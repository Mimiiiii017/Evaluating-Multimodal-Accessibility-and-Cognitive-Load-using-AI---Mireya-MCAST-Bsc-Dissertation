// analysePanel.ts — analysis pipeline for the webview panel
// Orchestrates baseline + RAG + Ollama analysis and streams results
// to the panel via PanelLogger callbacks.

import * as vscode from "vscode";
import {
  FIXED_MODEL,
  SECONDARY_MODEL,
  ollamaGenerateStream,
} from "../utils/llm/ollama";
import { ragRetrieve, formatRagContext, RAG_CONFIG, ragCache } from "../utils/rag/rag";
import { buildRagQuery } from "../utils/rag/ragQueryBuilder";

// Per-sweep targeted queries for HTML — one per sweep group.
// A single generic query cannot simultaneously surface guidance for link names,
// toggle buttons, autocomplete, image alt, and ARIA id references all at once.
// Running five focused queries and deduplicating gives the model relevant, specific
// context for whichever issues are actually present in the developer's file.
const HTML_SWEEP_QUERIES = [
  'link accessible name aria-label non-descriptive text "click here" "read more" nav landmark multiple label ARIA11',
  'button accessible name aria-expanded toggle disclosure accordion hamburger menu show hide',
  'form input label accessible name autocomplete personal data given-name email tel address SC 1.3.5',
  'image alt attribute missing non-text content table header scope heading level skip hierarchy WCAG 1.1.1 1.3.1',
  'aria-labelledby aria-describedby aria-controls broken reference id does not exist SC 4.1.2',
];
const HTML_RAG_MAX_CHUNKS = 10;
const HTML_RAG_DISTANCE_THRESHOLD = 1.2;  // L2 distance space (ChromaDB default); relevant chunks score 0.55–0.93

async function retrieveHtmlRag(
  ragEndpoint: string
): Promise<{ id: string; source: string; text: string }[]> {
  const seen = new Set<string>();
  const all: { id: string; source: string; text: string }[] = [];
  for (const q of HTML_SWEEP_QUERIES) {
    if (all.length >= HTML_RAG_MAX_CHUNKS) { break; }
    try {
      const res = await ragRetrieve(ragEndpoint, q, 3, 'accessibility', HTML_RAG_DISTANCE_THRESHOLD);
      for (const chunk of res.chunks) {
        if (all.length >= HTML_RAG_MAX_CHUNKS) { break; }
        if (!seen.has(chunk.id)) { seen.add(chunk.id); all.push(chunk); }
      }
    } catch { /* individual query failed — continue */ }
  }
  return all;
}
import { SYSTEM_PROMPT, buildAiPrompt } from "../utils/prompts/prompt";
import { parseTextResponse, deduplicateIssues } from "../utils/analysis/parser";
import { aiIssueToDiagnostic } from "../utils/analysis/diagnostics";
import { getExtensionConfig } from "../utils/config";
import type { PanelLogger } from "../webview/panelLogger";
import type { AiIssue } from "../utils/types";

function formatIssueForPanel(issue: AiIssue, index: number): string {
  const sev = (issue.severity || 'med').toUpperCase();
  const title = issue.title || 'Accessibility issue';
  const lineText = issue.lineHints && issue.lineHints.length > 0
    ? issue.lineHints.join(', ')
    : issue.lineHint
      ? String(issue.lineHint)
      : 'unknown';
  const problem = issue.explanation || 'No explanation provided.';
  const fix = issue.fix || 'No fix provided.';

  return [
    `Issue ${index}: ${title}`,
    `  Severity: ${sev}`,
    `  Line: ${lineText}`,
    `  Problem: ${problem}`,
    `  Fix: ${fix}`,
  ].join('\n');
}

export async function analyseFileForPanel(
  logger: PanelLogger,
  diagnostics: vscode.DiagnosticCollection
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("Open a file first, then run Analyse.");
    return;
  }

  const doc = editor.document;
  const text = doc.getText();
  const { ollamaHost, ragEndpoint } = getExtensionConfig();
  const model = FIXED_MODEL;
  const qwenModel = SECONDARY_MODEL;

  logger.log("═══ Accessibility Analysis ═══");
  logger.log(`File: ${doc.fileName}`);
  logger.log(`Language: ${doc.languageId}  |  Lines: ${doc.lineCount}  |  Chars: ${text.length}`);
  logger.log(`Models: ${model} + ${qwenModel}  |  RAG: ${ragEndpoint}`);
  logger.log("");

  diagnostics.delete(doc.uri);
  const issues: vscode.Diagnostic[] = [];

  // AI analysis chunk size — flat 200 lines across all file types for consistency.
  const CHUNK_LINES = 200;

  try {
      // Build chunks that respect code boundaries: scan forward from the target cut point
      // for a blank line after a closing brace so we never split mid-method.
      const allLines = doc.getText().split(/\r?\n/);
      // Strip comments before sending to the model — reduces token count while preserving
      // line numbers (array length stays the same so reported line numbers stay accurate).
      const isHtml = doc.languageId === 'html';
      const _openSeq  = isHtml ? '<!--' : '/*';
      const _closeSeq = isHtml ? '-->'  : '*/';
      const strippedLines = (() => {
        let inBlock = false;
        return allLines.map(line => {
          let out = '';
          let i = 0;
          while (i < line.length) {
            if (inBlock) {
              const end = line.indexOf(_closeSeq, i);
              if (end === -1) { i = line.length; }
              else { inBlock = false; i = end + _closeSeq.length; }
            } else {
              if (!isHtml && line[i] === '/' && line[i + 1] === '/') break;
              if (line.startsWith(_openSeq, i)) { inBlock = true; i += _openSeq.length; continue; }
              out += line[i++];
            }
          }
          return out;
        });
      })();
      const findNaturalBoundary = (lines: string[], target: number, maxScan: number): number => {
        const limit = Math.min(target + maxScan, lines.length);
        for (let i = target; i < limit; i++) {
          const cur = lines[i].trim();
          const nxt = (lines[i + 1] ?? '').trim();
          if ((cur === '}' || cur === '};') && nxt === '') return i + 1;
          if (cur === '' && i > target) return i;
        }
        return target;
      };
      const OVERLAP_LINES = 30; // lines of previous chunk prepended as context
      const fileChunks: string[] = [];
      let pos = 0;
      while (pos < allLines.length) {
        const rawEnd = Math.min(pos + CHUNK_LINES, allLines.length);
        const sliceEnd = rawEnd < allLines.length
          ? Math.max(findNaturalBoundary(allLines, rawEnd, 60), rawEnd)
          : rawEnd;
        const overlapStart = Math.max(0, pos - OVERLAP_LINES);
        const overlapLines = pos > 0
          ? strippedLines
              .slice(overlapStart, pos)
              .map((line, idx) => `${overlapStart + idx + 1}: ${line}`)
              .join('\n') + '\n'
          : '';
        const chunkContent = strippedLines
          .slice(pos, sliceEnd)
          .map((line, idx) => `${pos + idx + 1}: ${line}`)
          .join('\n');
        const header = pos > 0
          ? `// Lines ${pos + 1}–${sliceEnd} of ${allLines.length} (context: ${overlapStart + 1}–${pos})\n`
          : `// Lines ${pos + 1}–${sliceEnd} of ${allLines.length}\n`;
        fileChunks.push(header + overlapLines + chunkContent);
        pos = sliceEnd;
      }

      const totalChunks = fileChunks.length;
      if (totalChunks > 1) {
        logger.log(`File split into ${totalChunks} chunks (target: ${CHUNK_LINES} lines) — analysing all ${allLines.length} lines`);
      } else {
        logger.log(`✓ Full file sent: ${doc.lineCount} lines`);
      }

      // Retrieve RAG context once (reused for all chunks)
      const ragQuery = buildRagQuery(doc.languageId, fileChunks[0]);
      const cacheKey = `${doc.languageId}::${ragQuery}`;
      const cached = ragCache.get(cacheKey);
      let contextBlock: string;

      if (cached && Date.now() - cached.at < RAG_CONFIG.cacheTimeMs) {
        contextBlock = cached.context;
        logger.log("RAG: cache hit");
      } else {
        const t0 = Date.now();
        let ragChunks: { id: string; source: string; text: string }[];
        if (doc.languageId === 'html') {
          ragChunks = await retrieveHtmlRag(ragEndpoint);
        } else {
          const rag = await ragRetrieve(ragEndpoint, ragQuery, 3, "accessibility");
          ragChunks = rag.chunks;
        }
        contextBlock = formatRagContext(ragChunks);
        ragCache.set(cacheKey, { at: Date.now(), context: contextBlock });
        logger.log(`RAG: ${ragChunks.length} chunk(s) in ${Date.now() - t0} ms`);
      }

      if (!contextBlock || contextBlock === "(no context)") {
        logger.log("⚠ No knowledge-base chunks retrieved.");
      }

      const allKimiIssues: AiIssue[] = [];
      const allQwenIssues: AiIssue[] = [];
      const overallT0 = Date.now();

      for (let ci = 0; ci < totalChunks; ci++) {
        const chunkLabel = totalChunks > 1 ? ` [chunk ${ci + 1}/${totalChunks}]` : '';
        logger.log(`Stage 1: ${model} (recall) + ${qwenModel} (precision) running in parallel…${chunkLabel}`);

        const prompt = buildAiPrompt(doc.languageId, fileChunks[ci], contextBlock);
        let kimiResponse = '';
        let qwenResponse = '';
        const t0 = Date.now();
        let firstTokenMs: number | null = null;

        const qwenPromise = ollamaGenerateStream(
          ollamaHost,
          qwenModel,
          prompt,
          (chunk) => { qwenResponse += chunk; },
          SYSTEM_PROMPT
        ).catch((err: Error) => {
          logger.log(`  ⚠ ${qwenModel} error: ${err?.message ?? err}`);
        });

        await ollamaGenerateStream(
          ollamaHost,
          model,
          prompt,
          (chunk) => {
            kimiResponse += chunk;
            if (firstTokenMs === null) { firstTokenMs = Date.now() - t0; }
          },
          SYSTEM_PROMPT
        );

        await qwenPromise;
        logger.log(`\nChunk ${ci + 1} completed in ${Date.now() - t0} ms (first token: ${firstTokenMs} ms)`);

        allKimiIssues.push(...parseTextResponse(kimiResponse));
        allQwenIssues.push(...parseTextResponse(qwenResponse));
      }

      logger.log(`\nAll chunks done in ${Date.now() - overallT0} ms`);

      // Shared Jaccard helpers.
      const _stop = new Set(['a','an','the','is','are','was','were','has','have','had','be','been','with','for','on','at','by','from','in','of','to','and','or','not','no','this','that','it','its']);
      const _normT = (title: string): Set<string> =>
        new Set(title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !_stop.has(w)));
      // Title-only Jaccard (used for within-model dedup).
      const _jaccard = (a: AiIssue, b: AiIssue, threshold: number): boolean => {
        if (!a.title || !b.title) return false;
        const aw = _normT(a.title), bw = _normT(b.title);
        if (!aw.size || !bw.size) return false;
        const overlap = [...aw].filter(w => bw.has(w)).length;
        const union = new Set([...aw, ...bw]).size;
        return union > 0 && (overlap / union) >= threshold;
      };
      // Title+explanation Jaccard score (used for cross-model matching).
      // Using explanation gives far richer token overlap so models that describe the
      // same issue with different titles still match.
      const _jaccardScore = (a: AiIssue, b: AiIssue): number => {
        const tokens = (x: AiIssue) =>
          new Set(`${x.title || ''} ${(x.explanation || '').slice(0, 200)}`
            .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
            .filter(w => w.length > 2 && !_stop.has(w)));
        const aw = tokens(a), bw = tokens(b);
        if (!aw.size || !bw.size) return 0;
        const overlap = [...aw].filter(w => bw.has(w)).length;
        const union = new Set([...aw, ...bw]).size;
        return union > 0 ? overlap / union : 0;
      };

      // Collapse each model's cross-chunk findings independently:
      //   1. exact-title dedup + NA filter
      //   2. same-category cross-chunk merge (Jaccard >= 0.40)
      const dedupWithinModel = (raw: AiIssue[]): AiIssue[] => {
        const exact: AiIssue[] = deduplicateIssues(raw);
        const result: AiIssue[] = [];
        const used = new Set<number>();
        for (let i = 0; i < exact.length; i++) {
          if (used.has(i)) continue;
          used.add(i);
          const base = exact[i];
          const extra: number[] = [];
          for (let j = i + 1; j < exact.length; j++) {
            if (used.has(j)) continue;
            if (_jaccard(base, exact[j], 0.40)) {
              used.add(j);
              const dup = exact[j];
              if (dup.lineHints?.length) extra.push(...dup.lineHints);
              if (dup.lineHint != null) extra.push(dup.lineHint);
            }
          }
          if (extra.length) {
            const existing = base.lineHints?.length ? base.lineHints : (base.lineHint != null ? [base.lineHint] : []);
            result.push({ ...base, lineHints: [...new Set([...existing, ...extra])].sort((a, b) => a - b) });
          } else {
            result.push(base);
          }
        }
        return result;
      };

      const kimiUnique = dedupWithinModel(allKimiIssues);
      const qwenUnique  = dedupWithinModel(allQwenIssues);

      // Consensus merge: best-score-first bipartite matching.
      // title+explanation Jaccard >= 0.30, line numbers within ±5.
      type _Pair = { ki: number; qi: number; score: number };
      const _candidates: _Pair[] = [];
      for (let ki = 0; ki < kimiUnique.length; ki++) {
        for (let qi = 0; qi < qwenUnique.length; qi++) {
          const k = kimiUnique[ki], q = qwenUnique[qi];
          const kLine = k.lineHints?.[0] ?? k.lineHint;
          const qLine = q.lineHints?.[0] ?? q.lineHint;
          const lineClose = (!kLine || !qLine) || Math.abs(kLine - qLine) <= 5;
          if (!lineClose) continue;
          const score = _jaccardScore(k, q);
          if (score >= 0.30) { _candidates.push({ ki, qi, score }); }
        }
      }
      _candidates.sort((a, b) => b.score - a.score);
      const _kiUsed = new Set<number>();
      const _qiUsed = new Set<number>();
      const mergedIssues: AiIssue[] = [];
      for (const { ki, qi } of _candidates) {
        if (_kiUsed.has(ki) || _qiUsed.has(qi)) continue;
        _kiUsed.add(ki); _qiUsed.add(qi);
        const k = kimiUnique[ki], q = qwenUnique[qi];
        const kiHints = k.lineHints?.length ? k.lineHints : (k.lineHint != null ? [k.lineHint] : []);
        const qHints  = q.lineHints?.length ? q.lineHints : (q.lineHint != null ? [q.lineHint] : []);
        const mergedHints = [...new Set([...kiHints, ...qHints])].sort((a, b) => a - b);
        mergedIssues.push({ ...k, lineHints: mergedHints.length ? mergedHints : k.lineHints });
      }

      // Single-model survivors: admitted if they cite a specific WCAG SC,
      // have severity high or med, and have a concrete line number.
      const _WCAG_SC = /\b[1-4]\.[1-9]\.\d{1,2}\b/;
      const _isSurvivor = (issue: AiIssue): boolean => {
        const hasWcag = _WCAG_SC.test(`${issue.title || ''} ${issue.explanation || ''} ${issue.fix || ''}`);
        const highConf = issue.severity === 'high' || issue.severity === 'med';
        const hasLine = (issue.lineHints?.length ?? 0) > 0 || issue.lineHint != null;
        return hasWcag && highConf && hasLine;
      };
      let singleModelCount = 0;
      for (let ki = 0; ki < kimiUnique.length; ki++) {
        if (_kiUsed.has(ki)) continue;
        if (_isSurvivor(kimiUnique[ki])) { mergedIssues.push(kimiUnique[ki]); singleModelCount++; }
      }
      for (let qi = 0; qi < qwenUnique.length; qi++) {
        if (_qiUsed.has(qi)) continue;
        if (_isSurvivor(qwenUnique[qi])) { mergedIssues.push(qwenUnique[qi]); singleModelCount++; }
      }
      if (singleModelCount > 0) {
        logger.log(`[AI Analysis] Single-model survivors (WCAG-cited, high/med, with line): ${singleModelCount}`);
      }

      // Post-merge accessibility filter: drop findings with no accessibility signal.
      const _A11Y_TERMS = new RegExp([
        'wcag','sc\\s*\\d','[1-4]\\.[1-9]\\.\\d',
        'aria-expanded','aria-pressed','aria-invalid','aria-live','aria-hidden',
        'aria-label','aria-labelledby','aria-describedby','aria-controls',
        'aria-current','aria-activedescendant','aria-selected','aria-required',
        'aria-haspopup','aria-owns','aria-roledescription','aria-atomic',
        'aria-busy','aria-relevant','role=',
        'accessible','accessibility','a11y','screen.?reader','assistive.?tech',
        'focus.?indicator','focus.?ring','focus.?visible','focus.?manag',
        'keyboard.?focus','outline.*none','outline.*zero','focus.?trap',
        'roving.?tabindex','tabindex',
        'colour.?contrast','color.?contrast','contrast.?ratio','contrast.?fail',
        'insufficient.?contrast','non-text.?contrast','forced.?color',
        'high.?contrast','prefers.?color',
        'prefers.?reduced.?motion','motion.?animation','auto.?rotat',
        'touch.?target','pointer.?gesture','pointer.?cancel','target.?size',
        'minimum.?size','44.?px','24.?px',
        'alt.?text','alt.?attribute','missing.?alt','alternative.?text',
        'svg.*accessible','decorative.*image','image.*alt',
        'heading.?level','heading.?skip','heading.?hierarch','heading.?order',
        'landmark','page.?region','skip.?link','skip.?nav',
        'form.?label','input.?label','accessible.?name','label.?in.?name',
        'missing.?label','autocomplete','aria.?required','required.?field',
        'error.?message','validation.?error','error.?state','form.?validation',
        'table.?header','scope.?attribute','missing.?scope','th.*scope',
        'live.?region','role.*status','role.*alert',
        'dynamic.?content','dynamic.?updat','screen.?reader.?announc',
        'announc.*screen','status.?message',
        'keyboard.?access','keyboard.?nav','keyboard.?support','keyboard.?shortcut',
        'tab.?order','tab.?stop','key.?handler','keydown','keyup',
        'character.?key.?shortcut',
        'modal.?focus','focus.?return','dialog.*focus','focus.*dialog','trap.*focus',
        'disclosure.?button','toggle.?button','accordion','hamburger',
        'expand.*collaps','collaps.*expand',
        'link.?text','non.?descriptive.?link','link.?underline','descriptive.?link',
        'lang.?attribute','html.?lang','language.?of.?page',
        'time.?limit','auto.?updat','auto.?dismiss','toast.*dismiss',
        'caption','audio.?description','transcript',
        'visually.?hidden','sr.?only','screen.?reader.?only',
        'iframe.*title','sandboxed.?iframe',
        'orientation','reflow','resize.?text','text.?spacing',
        'word.?spacing','letter.?spacing',
      ].join('|'), 'i');
      const allIssues = mergedIssues.filter(issue => {
        const text = `${issue.title || ''} ${issue.explanation || ''} ${issue.fix || ''}`;
        return _A11Y_TERMS.test(text);
      });
      const filteredOut = mergedIssues.length - allIssues.length;
      if (filteredOut > 0) {
        logger.log(`[AI Analysis] Accessibility filter removed ${filteredOut} non-accessibility finding(s)`);
      }

      logger.log(`${model}: ${kimiUnique.length} unique  |  ${qwenModel}: ${qwenUnique.length} unique  |  Consensus (title+expl ≥0.30, ±5 lines): ${mergedIssues.length}  |  Final: ${allIssues.length} issue(s)`);

      if (allIssues.length > 0) {
        logger.postMessage({ type: "streamStart" });
        const rendered = allIssues.map((ai, idx) => formatIssueForPanel(ai, idx + 1)).join("\n\n");
        logger.streamChunk(rendered);
        logger.postMessage({ type: "streamEnd" });

        for (const ai of allIssues) {
          issues.push(...aiIssueToDiagnostic(doc, ai));
        }
      } else {
        logger.log("\nNo issues found.");
      }
  } catch (e: any) {
      const msg = String(e?.message ?? e);
      logger.log(`\nERROR: ${msg}`);

      if (e?.cause) {
        const cause = e.cause;
        const detail = cause?.code
          ? `${cause.code}: ${cause.message ?? cause}`
          : String(cause?.message ?? cause);
        logger.log(`  Cause: ${detail}`);
      }

      if (msg.includes("connection failed") || msg.includes("ECONNREFUSED")) {
        logger.log("  → Is Ollama running? Try: ollama serve");
      } else if (msg.includes("timed out")) {
        logger.log("  → Model too slow — try the Quick profile preset.");
      } else if (msg.includes("ECONNRESET") || msg.includes("socket hang up")) {
        logger.log("  → Ollama closed the connection (likely OOM).");
      } else if (msg.includes("HTTP 404")) {
        logger.log(`  → Fixed model not found: ${model}`);
      } else if (msg.includes("HTTP 5")) {
        logger.log("  → Ollama server error. Check Ollama logs.");
      }

      logger.log("Continuing with baseline-only results.");
  }

  diagnostics.set(doc.uri, issues);

  if (issues.length > 0) {
    vscode.window.showWarningMessage(
      `Accessibility: ${issues.length} issue(s). Check Problems tab.`
    );
  } else {
    logger.log("\n✓ No issues found.");
    vscode.window.showInformationMessage("Accessibility: No issues found.");
  }
}
