// baseline.ts — runs fast regex checks for common issues before the AI analysis starts
// Does not require Ollama or the RAG service — results appear instantly.
// Currently checks:
//   HTML — images missing alt text, form inputs missing associated labels
//   CSS  — interactive elements missing :focus styles

import * as vscode from "vscode";

const BASELINE_SOURCE = "AI Accessibility Assistant (baseline)";

function makeDiag(
  doc: vscode.TextDocument,
  matchIndex: number,
  matchLength: number,
  message: string,
  severity: vscode.DiagnosticSeverity
): vscode.Diagnostic {
  const range = new vscode.Range(doc.positionAt(matchIndex), doc.positionAt(matchIndex + matchLength));
  const d = new vscode.Diagnostic(range, message, severity);
  d.source = BASELINE_SOURCE;
  return d;
}

export function runBaselineChecks(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  
  if (doc.languageId === "html") {
    diags.push(...findImgMissingAlt(doc));
    diags.push(...findInputsMissingLabel(doc));
  }

  if (["css", "scss", "sass", "less"].includes(doc.languageId)) {
    diags.push(...findMissingFocusStyles(doc));
  }
  
  return diags;
}

export function findImgMissingAlt(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  const text = doc.getText();
  const imgTagRegex = /<img\b[^>]*>/gi;

  let match: RegExpExecArray | null;
  while ((match = imgTagRegex.exec(text)) !== null) {
    const tag = match[0];
    // WCAG sweep F baseline: flag only when alt attribute is fully absent.
    const hasAltAttribute = /\balt\s*=\s*["'][^"']*["']/i.test(tag);

    if (!hasAltAttribute) {
      diags.push(makeDiag(
        doc, match.index, tag.length,
        "Image is missing an alt attribute (add alt text or alt=\"\" for decorative images).",
        vscode.DiagnosticSeverity.Warning
      ));
    }
  }

  return diags;
}

export function findInputsMissingLabel(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  const text = doc.getText();
  const controlRegex = /<(input|select|textarea)\b[^>]*>/gi;

  // Collect explicit <label for="..."> targets once.
  const labelledIds = new Set<string>();
  const labelForRegex = /<label\b[^>]*\bfor\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let labelForMatch: RegExpExecArray | null;
  while ((labelForMatch = labelForRegex.exec(text)) !== null) {
    const id = labelForMatch[1].trim();
    if (id) {
      labelledIds.add(id);
    }
  }

  // Track <label>...</label> spans so wrapped controls are treated as labelled.
  const labelRanges: Array<{ start: number; end: number }> = [];
  const labelBlockRegex = /<label\b[^>]*>[\s\S]*?<\/label>/gi;
  let labelBlockMatch: RegExpExecArray | null;
  while ((labelBlockMatch = labelBlockRegex.exec(text)) !== null) {
    labelRanges.push({
      start: labelBlockMatch.index,
      end: labelBlockMatch.index + labelBlockMatch[0].length,
    });
  }

  let match: RegExpExecArray | null;
  while ((match = controlRegex.exec(text)) !== null) {
    const tag = match[0];
    const tagName = (match[1] || "").toLowerCase();

    if (tagName === "input") {
      const typeMatch = tag.match(/\btype\s*=\s*["']([^"']+)["']/i);
      const typeValue = typeMatch?.[1]?.trim().toLowerCase();
      // Inputs that do not require labels.
      if (["hidden", "submit", "button", "reset", "image"].includes(typeValue || "text")) {
        continue;
      }
    }

    const idMatch = tag.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const idValue = idMatch?.[1]?.trim();
    const hasAriaLabel = /\baria-label\s*=\s*["']\s*[^"']+\s*["']/i.test(tag);
    const hasAriaLabelledBy = /\baria-labelledby\s*=\s*["']\s*[^"']+\s*["']/i.test(tag);
    const hasLabelFor = !!idValue && labelledIds.has(idValue);
    const isWrappedByLabel = labelRanges.some(r => match!.index >= r.start && match!.index < r.end);

    if (!(hasAriaLabel || hasAriaLabelledBy || hasLabelFor || isWrappedByLabel)) {
      diags.push(makeDiag(
        doc, match.index, tag.length,
        "Form control is missing an accessible label (<label>, aria-label, or aria-labelledby).",
        vscode.DiagnosticSeverity.Warning
      ));
    }
  }

  return diags;
}

export function findMissingFocusStyles(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  const text = doc.getText();

  const interactivePatterns = [
    { selector: /\b(button|input|select|textarea|a)\s*\{/gi, name: "interactive element" },
    { selector: /\.(btn|button|link|input|field)[^{]*\{/gi, name: "button/link class" },
  ];
  
  for (const pattern of interactivePatterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.selector);
    
    while ((match = regex.exec(text)) !== null) {
      const selectorText = match[1] || match[0];

      // Check if there's a :focus variant nearby (within 500 chars is reasonable for same file)
      const nearbyText = text.slice(Math.max(0, match.index - 500), Math.min(text.length, match.index + 500));
      
      if (!nearbyText.includes(":focus") && !nearbyText.includes("outline")) {
        diags.push(makeDiag(
          doc, match.index, match[0].length,
          `${pattern.name} may be missing :focus styles for keyboard navigation.`,
          vscode.DiagnosticSeverity.Information
        ));
      }
    }
  }
  
  return diags;
}
