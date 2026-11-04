// parser.ts — turns the model's plain-text response into structured AiIssue objects

import { type AiIssue } from "../types";

export function parseTextResponse(text: string): AiIssue[] {
  const issues: AiIssue[] = [];

  // Strip chain-of-thought thinking blocks emitted by reasoning models (Qwen3, kimi, DeepSeek etc.)
  // These appear as <think>...</think> before the actual output and must not be parsed as issues.
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip duplicate "Final Answer:" sections that some models append
  const finalAnswerIdx = text.search(/\bFinal\s+Answer\s*:/i);
  if (finalAnswerIdx >= 0) {
    text = text.slice(0, finalAnswerIdx);
  }

  // Find every "Issue <number>:" header
  const issuePattern = /Issue\s+\d+\s*:?[ \t]*/gi;
  const starts: { matchEnd: number; matchStart: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = issuePattern.exec(text)) !== null) {
    starts.push({ matchStart: m.index, matchEnd: m.index + m[0].length });
  }

  for (let i = 0; i < starts.length; i++) {
    const blockStart = starts[i].matchStart;
    const blockEnd = i + 1 < starts.length ? starts[i + 1].matchStart : text.length;
    const block = text.slice(blockStart, blockEnd);

    // Title is the remainder of the "Issue N:" line
    const afterHeader = text.slice(starts[i].matchEnd, blockEnd).trimStart();
    const firstLine = afterHeader.split(/\r?\n/)[0]?.trim() ?? "";
    const looksLikeFieldLabel = /^(?:Severity|Line|Problem|Fix|Solution|WCAG)\b\s*:?$/i.test(firstLine);
    const title = looksLikeFieldLabel ? "" : firstLine;

    const issue: AiIssue = {
      title: title || "Accessibility issue",
      severity: "med",
    };

    const sevMatch = block.match(/\**\s*Severity\s*\**\s*:?[ \t]*(?:\r?\n[ \t]*)?(HIGH|MEDIUM|LOW)\b/i);
    if (sevMatch) {
      const s = sevMatch[1].toUpperCase();
      issue.severity = s === "HIGH" ? "high" : s === "LOW" ? "low" : "med";
    }

    const lineMatch = block.match(/\**\s*Line\s*\**\s*:?[ \t]*(?:\r?\n[ \t]*)?([0-9\s,\-]+)/i);
    if (lineMatch) {
      const lineStr = lineMatch[1];
      const lineSet = new Set<number>();
      const tokens = lineStr.split(',').map(t => t.trim()).filter(Boolean);

      for (const token of tokens) {
        const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
        if (range) {
          const start = parseInt(range[1], 10);
          const end = parseInt(range[2], 10);
          if (!isNaN(start) && !isNaN(end)) {
            // A range (e.g. 756-768) means one contiguous block (a CSS rule, a JSX element).
            // Only store the start line — expanding every line makes it look like dozens of
            // separate violations and produces a confusing multi-line List when there is one fix.
            lineSet.add(Math.min(start, end));
            continue;
          }
        }

        const single = parseInt(token, 10);
        if (!isNaN(single)) {
          lineSet.add(single);
        }
      }

      const lines = [...lineSet].sort((a, b) => a - b);
      if (lines.length > 0) {
        issue.lineHints = lines.length > 1 ? lines : undefined;
        issue.lineHint = lines[0];
      }
    }

    // Problem → explanation (capture everything until the next labelled field)
    const problemMatch = block.match(/\**\s*Problem\s*\**\s*:?[ \t]*(?:\r?\n[ \t]*)?([\s\S]*?)(?=\n\s*\**\s*(?:Fix|Solution|WCAG|Severity|Line|Issue)\s*\**\s*:?|$)/i);
    if (problemMatch) {
      issue.explanation = problemMatch[1].trim();
    }

    // Fix (or legacy Solution) → fix (capture everything until next labelled field)
    const fixMatch = block.match(/\**\s*(?:Fix|Solution)\s*\**\s*:?[ \t]*(?:\r?\n[ \t]*)?([\s\S]*?)(?=\n\s*\**\s*(?:Problem|WCAG|Severity|Line|Issue)\s*\**\s*:?|$)/i);
    if (fixMatch) {
      issue.fix = fixMatch[1].trim();
    }

    issues.push(issue);
  }

  return issues;
}

export function deduplicateIssues(issues: AiIssue[]): AiIssue[] {
  // 1. Drop issues whose explanation says "not applicable" / "N/A" / speculative / unverifiable
  const NA_PATTERNS = [
    /not\s+applicable/i,
    /\bN\/A\b/,
    /not\s+present\s+in\s+this/i,
    /no\s+.*\s+(?:present|visible|found)/i,
    /if\s+(?:present|any|used|available)/i,
    /cannot\s+(?:verify|confirm|determine)/i,
    /can(?:'t|not)\s+(?:verify|confirm|determine)/i,
    /without\s+seeing/i,
    /(?:exact|actual)\s+.*(?:isn't|is not)\s+specified/i,
    /we\s+cannot\s+verify/i,
    /appears?\s+to\s+be/i,
  ];

  const A11Y_TERMS = /aria|role|focus|keyboard|screen.?reader|wcag|axe|label|alt|tabindex|announce|live.?region|contrast|colour|color|accessible|accessibility|a11y|landmark|heading|semantic|tab.?order|skip.?link|form|input|button|link|image|caption|transcript|captions|reduced.motion|assistive|perceivable|operable|understandable|text.?alternative|visual.?indicator|auditory|cognitive|motor|impairment|blind|deaf|disabled|dialog|modal|navigation|menu|notification|alert|error.?message|status|tooltip|autocomplete|placeholder|name.?missing|missing.?name/i;

  const filtered = issues.filter(issue => {
    const text = `${issue.title || ''} ${issue.explanation || ''} ${issue.fix || ''}`;
    // Also drop issues whose fix is a non-actionable non-finding.
    const fix = (issue.fix || '').trim().toLowerCase();
    if (/^no fix (needed|required|necessary)\.?$/i.test(fix)) return false;
    if (/^n\/?a\.?$/i.test(fix)) return false;
    if (NA_PATTERNS.some(p => p.test(text))) return false;
    // Drop findings with no accessibility-related terms at all.
    return A11Y_TERMS.test(text);
  });

  // 2. Group issues by normalised title (same problem = combine across multiple lines)
  const grouped = new Map<string, AiIssue[]>();
  for (const issue of filtered) {
    // Normalise: lowercase, strip location qualifiers and common prefixes, collapse whitespace
    const norm = (issue.title || '')
      .toLowerCase()
      .replace(/missing\s+aria\s+attributes?\s+on\s+/g, '')
      .replace(/\s+in\s+(the\s+)?(footer|header|sidebar|topbar|menu|body|page)/g, '')  // Remove location qualifiers
      .replace(/\s+/g, ' ')
      .trim();
    if (!grouped.has(norm)) {
      grouped.set(norm, []);
    }
    grouped.get(norm)!.push(issue);
  }

  // 3. Combine issues with same problem into single blocks with multiple line numbers
  const combined: AiIssue[] = [];
  for (const issueGroup of grouped.values()) {
    if (issueGroup.length === 1) {
      // Single instance → prefix fix with line number(s) so it always shows "Line N: <fix>"
      // Only add the prefix if the fix doesn't already start with a "Line N:" marker.
      const single = issueGroup[0];
      if (single.fix && !/^Line\s+\d+/i.test(single.fix)) {
        if (single.lineHints && single.lineHints.length > 1) {
          // Model wrote one block with multiple comma-separated lines (e.g. Line: 45, 78, 102)
          // but only one generic fix — repeat the fix labelled for every line
          single.fix = single.lineHints.map(ln => `Line ${ln}: ${single.fix}`).join('\n');
        } else if (single.lineHint !== undefined) {
          single.fix = `Line ${single.lineHint}: ${single.fix}`;
        }
      }
      combined.push(single);
    } else {
      // Multiple instances of same problem → combine into one block with all lines
      const first = issueGroup[0];
      
      // Collect all unique line numbers
      const allLines = issueGroup
        .map(i => i.lineHint)
        .filter((line): line is number => line !== undefined)
        .filter((line, idx, arr) => arr.indexOf(line) === idx)
        .sort((a, b) => a - b);

      // Combine fixes — always labelled per line
      const fixEntries = issueGroup
        .filter(i => i.fix && i.lineHint !== undefined)
        .map(i => ({ line: i.lineHint!, fix: i.fix! }))
        .sort((a, b) => a.line - b.line);

      let combinedFix: string | undefined;
      if (fixEntries.length === 0) {
        combinedFix = first.fix;
      } else {
        const uniqueFixes = new Set(fixEntries.map(e => e.fix.trim()));
        if (uniqueFixes.size === 1) {
          // All fixes are identical — show once per line with label
          combinedFix = allLines.map(line => `Line ${line}: ${fixEntries[0].fix}`).join('\n');
        } else {
          // Different fix per line — show each labelled by line number
          combinedFix = fixEntries.map(e => `Line ${e.line}: ${e.fix}`).join('\n');
        }
      }

      combined.push({
        title: first.title,
        severity: first.severity,
        explanation: first.explanation,
        fix: combinedFix,
        lineHints: allLines.length > 0 ? allLines : undefined,
        evidence: first.evidence,
      });
    }
  }

  return combined;
}
