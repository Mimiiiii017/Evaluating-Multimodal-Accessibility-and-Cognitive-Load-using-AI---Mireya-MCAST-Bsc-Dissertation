/**
 * study-6-run.ts — Study 6: Supplementary Tool Comparison Orchestrator
 *
 * Coordinates accessibility analysis across three tools for Study 6:
 *   1. AI Accessibility Assistant (source-level)
 *   2. Google Lighthouse (rendered DOM)
 *   3. Deque axe-core (rendered DOM)
 *
 * WORKFLOW
 * ────────
 *   For each fixture (html-medium, html-high):
 *     1. Query AI system for findings (reuse extension analysis pipeline)
 *     2. Spin up local server and render page for Lighthouse and axe-core
 *     3. Run Lighthouse audit via Chrome DevTools Protocol
 *     4. Run axe-core via puppeteer or axe-core Node API
 *     5. Collect all findings, normalize format, and store
 *     6. Generate alignment matrix and comparison report
 *
 * CLI USAGE
 * ─────────
 *   npm run study6:compare
 *   npm run study6:compare -- --fixture html-medium --ai-model ollama.mistral
 *   npm run study6:compare -- --all-fixtures --output ./results/study-6.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import puppeteer, { Browser } from 'puppeteer';
import * as esbuild from 'esbuild';
import { STUDY_6_FIXTURES, loadFixtureContent, Study6Fixture } from './study-6-fixtures';
import {
  createComparisonReport,
  printAlignmentMatrix,
  saveComparisonReport,
  ToolFinding,
} from './study-6-compare';

const execAsync = promisify(exec);

interface Study6Options {
  fixture?: string;
  allFixtures?: boolean;
  aiModel?: string;
  outputDir?: string;
  concurrency?: number;
  serverPort?: number;
  headless?: boolean;
}

interface AiIssueLike {
  title?: string;
  severity?: 'high' | 'med' | 'low';
  explanation?: string;
  fix?: string;
  lineHint?: number;
  lineHints?: number[];
}

interface VirtualFile {
  content: string;
  mimeType: string;
}

interface BrowserHarness {
  html: string;
  virtualFiles: Record<string, VirtualFile>;
}

interface SupplementaryToolOutputs {
  axeLinter: ToolFinding[] | null;
  eslintJsxA11y: ToolFinding[] | null;
  webhint: ToolFinding[] | null;
  stylelintA11y: ToolFinding[] | null;
}

/**
 * Parse command-line arguments.
 */
function parseArgs(): Study6Options {
  const args = process.argv.slice(2);
  const opts: Study6Options = {
    allFixtures: false,
    aiModel: 'kimi-k2.5:cloud + qwen3.5:397b-cloud',
    outputDir: './results/study-6',
    concurrency: 1,
    serverPort: 3456,
    headless: true,
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fixture':
        opts.fixture = args[++i];
        break;
      case '--all-fixtures':
        opts.allFixtures = true;
        break;
      case '--ai-model':
        opts.aiModel = args[++i];
        break;
      case '--output':
        opts.outputDir = args[++i];
        break;
      case '--port':
        opts.serverPort = parseInt(args[++i], 10);
        break;
      case '--no-headless':
        opts.headless = false;
        break;
    }
  }
  
  return opts;
}

/**
 * Query the AI system for accessibility findings.
 * Reuses the extension's analysis pipeline.
 */
async function analyzeWithAI(sourceContent: string, sourceType: Study6Fixture['sourceType'], aiModel: string): Promise<ToolFinding[]> {
  console.log(`[AI Analysis] Analyzing ${sourceType.toUpperCase()} with ${aiModel}...`);

  const {
    FIXED_MODEL,
    SECONDARY_MODEL,
    ollamaGenerateStream,
  } = require('../../extension/ai-accessibility-assistant/src/utils/llm/ollama');
  const { SYSTEM_PROMPT, buildAiPrompt } = require('../../extension/ai-accessibility-assistant/src/utils/prompts/prompt');
  const { ragRetrieve, formatRagContext } = require('../../extension/ai-accessibility-assistant/src/utils/rag/rag');
  const { parseTextResponse, deduplicateIssues } = require('../../extension/ai-accessibility-assistant/src/utils/analysis/parser');

  const ragEndpoint = 'http://127.0.0.1:8000';
  const queries = [
    'link accessible name aria-label non-descriptive text "click here" "read more" nav landmark multiple label ARIA11',
    'button accessible name aria-expanded toggle disclosure',
    'form input label accessible name autocomplete personal data given-name email tel address SC 1.3.5',
    'image alt attribute missing non-text content table header scope heading level skip hierarchy WCAG 1.1.1 1.3.1',
    'aria-labelledby aria-describedby aria-controls broken reference id does not exist SC 4.1.2',
  ];

  let ragContext = '';
  for (const query of queries) {
    try {
      const response = await ragRetrieve(ragEndpoint, query, 3, 'accessibility', 0.5);
      const formatted = formatRagContext(response.chunks);
      ragContext += formatted + '\n';
    } catch (err) {
      console.log(`[AI Analysis] RAG query failed (non-fatal): ${err}`);
    }
  }

  const CHUNK_LINES = 200;
  const promptLanguage = sourceType === 'js' ? 'javascript' : sourceType === 'tsx' ? 'typescript' : sourceType;
  // Build chunks that respect code boundaries: scan forward from the target cut point
  // for a blank line after a closing brace so we never split mid-method.
  const allLines = sourceContent.split(/\r?\n/);
  // Strip comments before sending to the model — reduces token count while preserving
  // line numbers (array length stays the same so reported line numbers stay accurate).
  const isHtml = sourceType === 'html';
  const _openSeq  = isHtml ? '<!--' : '/*';
  const _closeSeq = isHtml ? '-->'  : '*/';
  const strippedLines = (() => {
    let inBlock = false;
    return allLines.map((line: string) => {
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
  const OVERLAP_LINES = 30; // lines of previous chunk prepended to next chunk as context
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
  const fileChunks: string[] = [];
  let pos = 0;
  while (pos < allLines.length) {
    const rawEnd = Math.min(pos + CHUNK_LINES, allLines.length);
    const sliceEnd = rawEnd < allLines.length
      ? Math.max(findNaturalBoundary(allLines, rawEnd, 60), rawEnd)
      : rawEnd;
    // Prepend overlap from previous chunk so cross-boundary issues are visible in both chunks.
    const overlapStart = Math.max(0, pos - OVERLAP_LINES);
    const overlapLines = pos > 0
      ? strippedLines
          .slice(overlapStart, pos)
          .map((line: string, idx: number) => `${overlapStart + idx + 1}: ${line}`)
          .join('\n') + '\n'
      : '';
    const chunkContent = strippedLines
      .slice(pos, sliceEnd)
      .map((line: string, idx: number) => `${pos + idx + 1}: ${line}`)
      .join('\n');
    const header = pos > 0
      ? `// Lines ${pos + 1}–${sliceEnd} of ${allLines.length} (context: ${overlapStart + 1}–${pos})\n`
      : `// Lines ${pos + 1}–${sliceEnd} of ${allLines.length}\n`;
    fileChunks.push(header + overlapLines + chunkContent);
    pos = sliceEnd;
  }

  const totalChunks = fileChunks.length;
  console.log(`[AI Analysis] ${sourceType.toUpperCase()}: ${allLines.length} lines → ${totalChunks} chunk(s), target ${CHUNK_LINES} lines`);

  const allKimiIssues: AiIssueLike[] = [];
  const allQwenIssues: AiIssueLike[] = [];

  for (let ci = 0; ci < totalChunks; ci++) {
    const chunkLabel = totalChunks > 1 ? ` [chunk ${ci + 1}/${totalChunks}]` : '';
    console.log(`[AI Analysis] Calling ${FIXED_MODEL} + ${SECONDARY_MODEL}${chunkLabel}...`);

    const prompt = buildAiPrompt(promptLanguage, fileChunks[ci], ragContext || '(no context)');
    let kimiResponse = '';
    let qwenResponse = '';

    const qwenPromise = ollamaGenerateStream(
      'http://localhost:11434',
      SECONDARY_MODEL,
      prompt,
      (chunk: string) => { qwenResponse += chunk; },
      SYSTEM_PROMPT,
    ).catch((err: Error) => {
      console.warn(`[AI Analysis] ${SECONDARY_MODEL} error: ${err?.message ?? err}`);
    });

    await ollamaGenerateStream(
      'http://localhost:11434',
      FIXED_MODEL,
      prompt,
      (chunk: string) => { kimiResponse += chunk; },
      SYSTEM_PROMPT,
    );

    await qwenPromise;

    allKimiIssues.push(...parseTextResponse(kimiResponse));
    allQwenIssues.push(...parseTextResponse(qwenResponse));
  }

  // Shared Jaccard helpers.
  const _stop = new Set(['a','an','the','is','are','was','were','has','have','had','be','been','with','for','on','at','by','from','in','of','to','and','or','not','no','this','that','it','its']);
  const _normT = (title: string): Set<string> =>
    new Set(title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w: string) => w.length > 2 && !_stop.has(w)));
  // Title-only Jaccard (used for within-model dedup).
  const _jaccard = (a: AiIssueLike, b: AiIssueLike, threshold: number): boolean => {
    if (!a.title || !b.title) return false;
    const aw = _normT(a.title), bw = _normT(b.title);
    if (!aw.size || !bw.size) return false;
    const overlap = [...aw].filter(w => bw.has(w)).length;
    const union = new Set([...aw, ...bw]).size;
    return union > 0 && (overlap / union) >= threshold;
  };
  // Title+explanation Jaccard score (used for cross-model matching).
  // Using explanation gives far richer token overlap so models that describe the
  // same issue with different titles still match (e.g. "Insufficient color contrast"
  // vs "Poor contrast ratio" — title Jaccard ≈ 0.13 but combined ≈ 0.45).
  const _jaccardScore = (a: AiIssueLike, b: AiIssueLike): number => {
    const tokens = (x: AiIssueLike) =>
      new Set(`${x.title || ''} ${(x.explanation || '').slice(0, 200)}`
        .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
        .filter((w: string) => w.length > 2 && !_stop.has(w)));
    const aw = tokens(a), bw = tokens(b);
    if (!aw.size || !bw.size) return 0;
    const overlap = [...aw].filter(w => bw.has(w)).length;
    const union = new Set([...aw, ...bw]).size;
    return union > 0 ? overlap / union : 0;
  };

  // Collapse one model's cross-chunk findings:
  //   1. exact-title dedup + NA filter (via deduplicateIssues)
  //   2. same-category cross-chunk merge (Jaccard >= 0.65)
  const dedupWithinModel = (raw: AiIssueLike[]): AiIssueLike[] => {
    const exact: AiIssueLike[] = deduplicateIssues(raw);
    const result: AiIssueLike[] = [];
    const used = new Set<number>();
    for (let i = 0; i < exact.length; i++) {
      if (used.has(i)) continue;
      used.add(i);
      const base = exact[i];
      const extra: number[] = [];
      for (let j = i + 1; j < exact.length; j++) {
        if (used.has(j)) continue;
        if (_jaccard(base, exact[j], 0.4)) {
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

  // Consensus merge: a finding only appears in the output if BOTH models reported it.
  // Matching criteria:
  //   - title+explanation Jaccard >= 0.30 (rich token overlap catches same issue
  //     described with different words — e.g. "Insufficient color contrast" vs
  //     "Poor contrast ratio" share many explanation tokens even if title tokens differ)
  //   - line numbers within ±2  (if the LLM can't agree on where the issue is
  //     to within 2 lines, they're not describing the same thing)
  // Pairs are scored and sorted best-first to avoid greedy artefacts.
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
      if (score >= 0.30) _candidates.push({ ki, qi, score });
    }
  }
  _candidates.sort((a, b) => b.score - a.score);
  const _kiUsed = new Set<number>();
  const _qiUsed = new Set<number>();
  const mergedIssues: AiIssueLike[] = [];
  for (const { ki, qi } of _candidates) {
    if (_kiUsed.has(ki) || _qiUsed.has(qi)) continue;
    _kiUsed.add(ki); _qiUsed.add(qi);
    const k = kimiUnique[ki], q = qwenUnique[qi];
    const kiHints = k.lineHints?.length ? k.lineHints : (k.lineHint != null ? [k.lineHint] : []);
    const qHints  = q.lineHints?.length ? q.lineHints : (q.lineHint != null ? [q.lineHint] : []);
    const mergedHints = [...new Set([...kiHints, ...qHints])].sort((a, b) => a - b);
    mergedIssues.push({ ...k, lineHints: mergedHints.length ? mergedHints : k.lineHints });
  }

  // Single-model survivors — any source type.
  // A solo finding is admitted if it passes ALL three quality gates:
  //   1. Cites a specific WCAG SC (not "unknown") — hallucinations tend to be vague
  //   2. Severity is "high" or "med"
  //   3. Has a concrete line number — no location = not actionable
  const _WCAG_SC = /\b[1-4]\.[1-9]\.\d{1,2}\b/;
  const _isSurvivor = (issue: AiIssueLike): boolean => {
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
    console.log(`[AI Analysis] Single-model survivors (WCAG-cited, high/med, with line): ${singleModelCount}`);
  }

  // Post-merge accessibility filter.
  // Drop any finding whose combined title+explanation contains none of the signals
  // that mark it as a real WCAG/accessibility issue.
  // Terms are drawn directly from the knowledge-base category headings and detection rules.
  const _A11Y_TERMS = new RegExp([
    // WCAG SC references
    'wcag', 'sc\\s*\\d', '[1-4]\\.[1-9]\\.\\d',
    // ARIA attributes
    'aria-expanded', 'aria-pressed', 'aria-invalid', 'aria-live', 'aria-hidden',
    'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-controls',
    'aria-current', 'aria-activedescendant', 'aria-selected', 'aria-required',
    'aria-haspopup', 'aria-owns', 'aria-roledescription', 'aria-atomic',
    'aria-busy', 'aria-relevant', 'role=',
    // Generic a11y words
    'accessible', 'accessibility', 'a11y', 'screen.?reader', 'assistive.?tech',
    // Focus
    'focus.?indicator', 'focus.?ring', 'focus.?visible', 'focus.?manag',
    'keyboard.?focus', 'outline.*none', 'outline.*zero', 'focus.?trap',
    'roving.?tabindex', 'tabindex',
    // Colour / contrast
    'colour.?contrast', 'color.?contrast', 'contrast.?ratio', 'contrast.?fail',
    'insufficient.?contrast', 'non-text.?contrast', 'forced.?color',
    'high.?contrast', 'prefers.?color',
    // Motion / animation
    'prefers.?reduced.?motion', 'motion.?animation', 'auto.?rotat',
    // Touch / pointer
    'touch.?target', 'pointer.?gesture', 'pointer.?cancel', 'target.?size',
    'minimum.?size', '44.?px', '24.?px',
    // Images / alt text
    'alt.?text', 'alt.?attribute', 'missing.?alt', 'alternative.?text',
    'svg.*accessible', 'decorative.*image', 'image.*alt',
    // Headings / structure
    'heading.?level', 'heading.?skip', 'heading.?hierarch', 'heading.?order',
    'landmark', 'page.?region', 'skip.?link', 'skip.?nav',
    // Labels / forms
    'form.?label', 'input.?label', 'accessible.?name', 'label.?in.?name',
    'missing.?label', 'autocomplete', 'aria.?required', 'required.?field',
    'error.?message', 'validation.?error', 'error.?state', 'form.?validation',
    // Tables
    'table.?header', 'scope.?attribute', 'missing.?scope', 'th.*scope',
    // Live regions / dynamic content
    'live.?region', 'aria-live', 'role.*status', 'role.*alert',
    'dynamic.?content', 'dynamic.?updat', 'screen.?reader.?announc',
    'announc.*screen', 'status.?message',
    // Keyboard / interaction
    'keyboard.?access', 'keyboard.?nav', 'keyboard.?support', 'keyboard.?shortcut',
    'tab.?order', 'tab.?stop', 'key.?handler', 'keydown', 'keyup',
    'character.?key.?shortcut',
    // Dialogs / modals
    'modal.?focus', 'focus.?return', 'dialog.*focus', 'focus.*dialog',
    'trap.*focus',
    // Toggle / disclosure
    'disclosure.?button', 'toggle.?button', 'accordion', 'hamburger',
    'expand.*collaps', 'collaps.*expand',
    // Links
    'link.?text', 'non.?descriptive.?link', 'link.?underline', 'descriptive.?link',
    // Language / internationalisation
    'lang.?attribute', 'html.?lang', 'language.?of.?page',
    // Timing / auto-update
    'time.?limit', 'auto.?updat', 'auto.?dismiss', 'toast.*dismiss',
    // Captions / media
    'caption', 'audio.?description', 'transcript',
    // Visually hidden
    'visually.?hidden', 'sr.?only', 'screen.?reader.?only',
    // iframes
    'iframe.*title', 'sandboxed.?iframe',
    // Orientation / reflow
    'orientation', 'reflow', 'resize.?text', 'text.?spacing',
    // Word / letter spacing
    'word.?spacing', 'letter.?spacing',
  ].join('|'), 'i');
  const accessibilityFindings = mergedIssues.filter(issue => {
    const text = `${issue.title || ''} ${issue.explanation || ''} ${issue.fix || ''}`;
    return _A11Y_TERMS.test(text);
  });
  const filteredOut = mergedIssues.length - accessibilityFindings.length;
  if (filteredOut > 0) {
    console.log(`[AI Analysis] Accessibility filter removed ${filteredOut} non-accessibility finding(s)`);
  }

  const findings = accessibilityFindings.map((issue): ToolFinding => {
    const wcagMatch = `${issue.title || ''} ${issue.explanation || ''}`.match(/\b([1-4]\.\d\.\d)\b/);
    const lines = issue.lineHints && issue.lineHints.length > 0
      ? issue.lineHints.join(', ')
      : issue.lineHint
        ? String(issue.lineHint)
        : undefined;

    return {
      wcag: wcagMatch?.[1] || 'unknown',
      issueType: issue.title || 'Accessibility issue',
      severity: issue.severity === 'high' ? 'error' : issue.severity === 'low' ? 'notice' : 'warning',
      description: issue.explanation || issue.fix || issue.title || 'Accessibility issue detected by AI analysis.',
      element: lines ? `Lines ${lines}` : undefined,
      toolSource: 'ai',
    };
  });

  console.log(`[AI Analysis] ${FIXED_MODEL}: ${kimiUnique.length} unique  |  ${SECONDARY_MODEL}: ${qwenUnique.length} unique  |  Consensus (title+expl ≥0.30, ±5 lines): ${mergedIssues.length}  |  Final: ${findings.length}`);
  return findings;
}

/**
 * Serve HTML locally and wait for server readiness.
 */
function startLocalServer(
  htmlContent: string,
  fixture: Study6Fixture,
  port: number,
  virtualFiles: Record<string, VirtualFile> = {},
): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const fixturesRoot = path.resolve(path.dirname(fixture.filePath));

    const server = http.createServer((req, res) => {
      const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);

      if (requestPath === '/' || requestPath === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
        return;
      }

      if (virtualFiles[requestPath]) {
        res.writeHead(200, { 'Content-Type': virtualFiles[requestPath].mimeType });
        res.end(virtualFiles[requestPath].content);
        return;
      }

      const safePath = requestPath.replace(/^\/+/, '');
      const filePath = path.resolve(fixturesRoot, safePath);
      if (!filePath.startsWith(fixturesRoot)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === '.css'
        ? 'text/css'
        : ext === '.js'
          ? 'application/javascript'
          : ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.woff2'
              ? 'font/woff2'
              : ext === '.png'
                ? 'image/png'
                : ext === '.jpg' || ext === '.jpeg'
                  ? 'image/jpeg'
                  : 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(fs.readFileSync(filePath));
    });
    
    server.listen(port, () => {
      console.log(`[Server] Started on http://localhost:${port}`);
      resolve(server);
    });
    
    server.on('error', reject);
  });
}

function buildBrowserHarness(fixture: Study6Fixture, sourceContent: string): BrowserHarness {
  const fileName = path.basename(fixture.filePath);

  if (fixture.sourceType === 'html') {
    return { html: sourceContent, virtualFiles: {} };
  }

  if (fixture.sourceType === 'css') {
    return {
      html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Study 6 CSS Harness</title>
  <link rel="stylesheet" href="/${fileName}" />
</head>
<body>
  <header><nav><a href="#">Click here</a><button>Menu</button></nav></header>
  <main>
    <h1>Harness</h1>
    <h2>Subheading</h2>
    <img src="logo.png" alt="Company logo" />
    <form><input type="email" placeholder="Your email" /><textarea placeholder="Message"></textarea><button type="submit">Send</button></form>
    <table><tr><td>Plan</td><td>Price</td></tr><tr><td>Basic</td><td>$29</td></tr></table>
  </main>
</body>
</html>`,
      virtualFiles: {},
    };
  }

  if (fixture.sourceType === 'js') {
    return {
      html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Study 6 JS Harness</title>
  <style>
    body { color: #111; background: #fff; }
    input,select,textarea,button,a,[role="button"]{min-height:44px;box-sizing:border-box;}
    small,.meta,.caption,.tag,.chip,.badge{font-size:14px !important;}
    main * { color:#111 !important; background-color:#fff !important; }
  </style>
</head>
<body>
  <header>
    <nav>
      <button id="menu-button">Menu</button>
    </nav>
  </header>
  <main>
    <h1>JS Harness</h1>
    <form id="contact-form" aria-label="Contact">
      <label for="h-email">Email</label>
      <input id="h-email" type="email" />
      <label for="h-name">Name</label>
      <input id="h-name" type="text" />
      <label for="h-phone">Phone</label>
      <input id="h-phone" type="tel" />
      <label for="h-topic">Topic</label>
      <select id="h-topic"><option value="">Select</option></select>
      <label for="h-message">Message</label>
      <textarea id="h-message"></textarea>
      <button type="submit">Send</button>
    </form>
    <div aria-live="polite"></div>
    <button class="open-modal-btn">Open Modal</button>
    <div class="modal" style="display:none"><button class="close-btn">Close</button></div>
  </main>
  <script src="/${fileName}"></script>
</body>
</html>`,
      virtualFiles: {},
    };
  }

  const tsxEntry = `${sourceContent}

import React from 'react';
import { createRoot } from 'react-dom/client';

const __root = document.getElementById('root');
if (__root && typeof App !== 'undefined') {
  createRoot(__root).render(React.createElement(App));
}`;

  const bundle = esbuild.buildSync({
    stdin: {
      contents: tsxEntry,
      resolveDir: path.dirname(fixture.filePath),
      sourcefile: 'study-6-tsx-harness-entry.tsx',
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['es2019'],
    jsx: 'automatic',
  });

  const appJs = bundle.outputFiles?.[0]?.text || '';

  return {
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Study 6 TSX Harness</title>
</head>
<body>
  <div id="root"></div>
  <script src="/tsx-app.js"></script>
</body>
</html>`,
    virtualFiles: {
      '/tsx-app.js': { content: appJs, mimeType: 'application/javascript' },
    },
  };
}

/**
 * Run Lighthouse accessibility audit via CLI and extract failing audits.
 */
async function runLighthouse(url: string, outputPath: string): Promise<ToolFinding[]> {
  console.log(`[Lighthouse] Running audit on ${url}...`);

  try {
    const cmd = [
      'npx --yes lighthouse',
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=accessibility',
      '--quiet',
      '--chrome-flags="--headless=new --disable-gpu --no-sandbox"',
    ].join(' ');

    await execAsync(cmd, { timeout: 90000, maxBuffer: 10 * 1024 * 1024 });

    if (!fs.existsSync(outputPath)) {
      console.warn('[Lighthouse] No JSON report generated');
      return [];
    }

    const report = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    const findings: ToolFinding[] = [];

    const auditRefs = report?.categories?.accessibility?.auditRefs || [];
    for (const ref of auditRefs) {
      const auditId = ref?.id;
      if (!auditId) {
        continue;
      }

      const audit = report?.audits?.[auditId];
      if (!audit) {
        continue;
      }

      const isBinaryFailure = audit.scoreDisplayMode === 'binary' && audit.score !== 1;
      const isScoredFailure = typeof audit.score === 'number' && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable';
      if (!isBinaryFailure && !isScoredFailure) {
        continue;
      }

      const nodes = Array.isArray(audit?.details?.items) ? audit.details.items : [];
      if (nodes.length === 0) {
        findings.push({
          wcag: (audit.tags || []).find((t: string) => /^wcag\d+/i.test(t)) || 'unknown',
          issueType: audit.title || auditId,
          severity: 'warning',
          description: audit.description || audit.explanation || 'Accessibility issue found by Lighthouse',
          element: undefined,
          toolSource: 'lighthouse',
        });
        continue;
      }

      for (const item of nodes) {
        const snippet = item?.node?.snippet || item?.snippet || item?.selector || undefined;
        findings.push({
          wcag: (audit.tags || []).find((t: string) => /^wcag\d+/i.test(t)) || 'unknown',
          issueType: audit.title || auditId,
          severity: 'warning',
          description: audit.description || audit.explanation || 'Accessibility issue found by Lighthouse',
          element: snippet,
          toolSource: 'lighthouse',
        });
      }
    }

    console.log(`[Lighthouse] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.error(`[Lighthouse] Error: ${err}`);
    return [];
  }
}

/**
 * Run axe-core audit via puppeteer.
 */
async function runAxeCore(browser: Browser, url: string): Promise<ToolFinding[]> {
  console.log(`[axe-core] Running audit on ${url}...`);
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Inject and run axe-core
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        (globalThis as any).axe.run((err: any, results: any) => {
          resolve(results);
        });
      });
    });
    
    await page.close();
    
    const findings: ToolFinding[] = [];
    
    // Extract violations and incomplete issues
    if ((results as any).violations) {
      ((results as any).violations as any[]).forEach(violation => {
        violation.nodes?.forEach((node: any) => {
          findings.push({
            wcag: (violation.tags?.[0] || '').replace('wcag', '').replace('wcag2', '').trim() || 'unknown',
            issueType: violation.impact ? `${violation.id} (${violation.impact})` : violation.id,
            severity: violation.impact === 'critical' ? 'error' : 'warning',
            description: violation.description,
            element: node.target?.[0] || node.html?.substring(0, 50),
            toolSource: 'axeCore',
          });
        });
      });
    }
    
    console.log(`[axe-core] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.error(`[axe-core] Error: ${err}`);
    return [];
  }
}

/**
 * Run Axe Accessibility Linter (axe CLI).
 * Note: this tool is URL/DOM oriented and not applicable to raw CSS-only source.
 */
async function runAxeLinter(url: string): Promise<ToolFinding[] | null> {
  console.log(`[Axe Linter] Running axe CLI on ${url}...`);

  try {
    const chromedriverPath = `${process.env.HOME}/.browser-driver-manager/chromedriver/linux-148.0.7778.167/chromedriver-linux64/chromedriver`;
    const chromePath = `${process.env.HOME}/.browser-driver-manager/chrome/linux-148.0.7778.167/chrome-linux64/chrome`;
    const cmd = `npx --yes @axe-core/cli ${url} -j --chromedriver-path "${chromedriverPath}" --chrome-path "${chromePath}"`;

    let stdout = '';
    try {
      ({ stdout } = await execAsync(cmd, { timeout: 90000, maxBuffer: 10 * 1024 * 1024 }));
    } catch (err: any) {
      // axe CLI can exit non-zero when violations exist; parse its stdout anyway.
      stdout = err?.stdout || '';
      if (!stdout) {
        throw err;
      }
    }

    // axe CLI -j outputs JSON array: [{violations:[...], passes:[...], ...}, ...]
    const jsonStart = stdout.indexOf('[');
    const jsonEnd = stdout.lastIndexOf(']');
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
      ? stdout.slice(jsonStart, jsonEnd + 1)
      : '[]';
    const parsed = JSON.parse(jsonText);

    const findings: ToolFinding[] = [];
    // Flatten violations across all page results in the array
    const violations = Array.isArray(parsed)
      ? parsed.flatMap((r: any) => Array.isArray(r?.violations) ? r.violations : [])
      : Array.isArray(parsed?.violations) ? parsed.violations : [];
    for (const violation of violations) {
      const nodes = Array.isArray(violation?.nodes) ? violation.nodes : [];
      if (nodes.length === 0) {
        findings.push({
          wcag: (violation?.tags || []).find((t: string) => /^wcag/i.test(t)) || 'unknown',
          issueType: violation?.id || 'axe-linter-issue',
          severity: violation?.impact === 'critical' ? 'error' : 'warning',
          description: violation?.description || violation?.help || 'Issue reported by Axe Accessibility Linter.',
          toolSource: 'axeLinter',
        });
        continue;
      }

      for (const node of nodes) {
        findings.push({
          wcag: (violation?.tags || []).find((t: string) => /^wcag/i.test(t)) || 'unknown',
          issueType: violation?.id || 'axe-linter-issue',
          severity: violation?.impact === 'critical' ? 'error' : 'warning',
          description: violation?.description || violation?.help || 'Issue reported by Axe Accessibility Linter.',
          element: (node?.target && node.target[0]) || node?.html,
          toolSource: 'axeLinter',
        });
      }
    }

    console.log(`[Axe Linter] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.warn(`[Axe Linter] Failed: ${err}`);
    return null;
  }
}

/**
 * Run ESLint + jsx-a11y on JS/TSX source.
 */
async function runEslintJsxA11y(sourceContent: string, fixture: Study6Fixture, outputDir: string): Promise<ToolFinding[] | null> {
  if (fixture.sourceType !== 'tsx') {
    console.log('[ESLint jsx-a11y] Not applicable (requires TSX), skipping.');
    return null;
  }

  console.log(`[ESLint jsx-a11y] Running on ${fixture.name}...`);

  try {
    const tempDir = path.join(outputDir, 'tmp-lint');
    fs.mkdirSync(tempDir, { recursive: true });
    const ext = fixture.sourceType === 'tsx' ? '.tsx' : '.js';
    const filePath = path.join(tempDir, `${fixture.name}${ext}`);
    fs.writeFileSync(filePath, sourceContent, 'utf-8');

    const { ESLint } = require('eslint');
    const tsParser = require('@typescript-eslint/parser');

    const eslint = new ESLint({
      useEslintrc: false,
      overrideConfig: {
        parser: fixture.sourceType === 'tsx' ? '@typescript-eslint/parser' : undefined,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
        plugins: ['jsx-a11y'],
        extends: ['plugin:jsx-a11y/recommended'],
        rules: {
          // Text alternatives
          'jsx-a11y/alt-text': 'error',
          // ARIA role rules
          'jsx-a11y/aria-role': 'error',
          'jsx-a11y/aria-props': 'error',
          'jsx-a11y/aria-unsupported-elements': 'warn',
          'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
          // Heading rules
          'jsx-a11y/heading-has-content': 'warn',
          // Link rules
          'jsx-a11y/anchor-is-valid': 'warn',
          // Form rules
          'jsx-a11y/label-has-associated-control': 'warn',
          // Interactive element rules
          'jsx-a11y/no-static-element-interactions': 'error',
          'jsx-a11y/click-events-have-key-events': 'error',
          'jsx-a11y/interactive-supports-focus': 'error',
          'jsx-a11y/no-noninteractive-element-interactions': 'error',
          'jsx-a11y/no-noninteractive-tabindex': 'error',
          // Keyboard event rules
          'jsx-a11y/mouse-events-have-key-events': 'error',
          // Scope attribute rules
          'jsx-a11y/scope': 'warn',
          // Image role rules
          'jsx-a11y/img-redundant-alt': 'warn',
        },
      },
    });

    // Make sure parser package is loaded when TSX is used.
    void tsParser;

    const results = await eslint.lintFiles([filePath]);

    // If the file cannot be parsed, this tool did not run meaningfully.
    // Return null so downstream reporting shows N/A rather than a misleading 0.
    const fatalResult = results.find((r: any) => (r.fatalErrorCount || 0) > 0);
    if (fatalResult) {
      const fatalMessage = (fatalResult.messages || []).find((m: any) => m.fatal)?.message || 'Unknown parsing/config error';
      console.warn(`[ESLint jsx-a11y] Fatal parse/config error: ${fatalMessage}`);
      return null;
    }

    const findings: ToolFinding[] = [];
    for (const result of results) {
      for (const message of result.messages || []) {
        if (!message.ruleId || !message.ruleId.startsWith('jsx-a11y/')) {
          continue;
        }
        findings.push({
          wcag: 'unknown',
          issueType: message.ruleId,
          severity: message.severity === 2 ? 'error' : 'warning',
          description: message.message,
          element: message.line ? `Line ${message.line}` : undefined,
          toolSource: 'eslintJsxA11y',
        });
      }
    }

    console.log(`[ESLint jsx-a11y] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.warn(`[ESLint jsx-a11y] Failed: ${err}`);
    return null;
  }
}

/**
 * Run webhint against the rendered harness URL.
 */
async function runWebhint(url: string): Promise<ToolFinding[] | null> {
  console.log(`[Webhint] Running on ${url}...`);

  try {
    // Use webhint built-in configuration to avoid interactive missing-package/config errors.
    const cmd = `npx --yes hint ${url} -f json`;

    let stdout = '';
    try {
      ({ stdout } = await execAsync(cmd, { timeout: 90000, maxBuffer: 10 * 1024 * 1024 }));
    } catch (err: any) {
      // webhint can return non-zero if hints are found; parse formatter output anyway.
      stdout = err?.stdout || '';
      if (!stdout) {
        throw err;
      }
    }

    const jsonStart = stdout.indexOf('[');
    const jsonEnd = stdout.lastIndexOf(']');
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
      ? stdout.slice(jsonStart, jsonEnd + 1)
      : '[]';
    const parsed = JSON.parse(jsonText);

    const findings: ToolFinding[] = [];
    const items = Array.isArray(parsed) ? parsed : [];

    for (const item of items) {
      // webhint severity is typically numeric: 1..4 (>= 4 is error)
      const numericSeverity = Number(item?.severity);
      const hintId = item?.hintId || item?.ruleId || 'webhint';
      const location = item?.location;

      findings.push({
        wcag: 'unknown',
        issueType: hintId,
        severity: Number.isFinite(numericSeverity) && numericSeverity >= 4 ? 'error' : 'warning',
        description: item?.message || 'Issue reported by webhint.',
        element: location ? `${item?.resource || ''}:${location?.line || ''}` : item?.resource,
        toolSource: 'webhint',
      });
    }

    console.log(`[Webhint] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.warn(`[Webhint] Failed: ${err}`);
    return null;
  }
}

/**
 * Run stylelint with stylelint-a11y rules on CSS source.
 */
async function runStylelintA11y(sourceContent: string, fixture: Study6Fixture): Promise<ToolFinding[] | null> {
  if (fixture.sourceType !== 'css') {
    console.log('[stylelint-a11y] Not applicable to this fixture type, skipping.');
    return null;
  }

  console.log(`[stylelint-a11y] Running on ${fixture.name}...`);

  try {
    const stylelint = require('stylelint');
    const result = await stylelint.lint({
      code: sourceContent,
      codeFilename: path.basename(fixture.filePath),
      config: {
        plugins: ['@double-great/stylelint-a11y'],
        rules: {
          'a11y/media-prefers-reduced-motion': true,
          'a11y/no-display-none': true,
          'a11y/no-obsolete-attribute': true,
        },
      },
    });

    const findings: ToolFinding[] = [];
    const warnings = result?.results?.[0]?.warnings || [];
    for (const warning of warnings) {
      findings.push({
        wcag: 'unknown',
        issueType: warning.rule || 'stylelint-a11y',
        severity: warning.severity === 'error' ? 'error' : 'warning',
        description: warning.text || 'Issue reported by stylelint-a11y.',
        element: warning.line ? `Line ${warning.line}` : undefined,
        toolSource: 'stylelintA11y',
      });
    }

    console.log(`[stylelint-a11y] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.warn(`[stylelint-a11y] Failed: ${err}`);
    return null;
  }
}

/**
 * Run comparison analysis for a single fixture.
 */
async function analyzeFixture(
  fixture: Study6Fixture,
  opts: Study6Options,
): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYZING: ${fixture.name} (${fixture.errorCount} errors)`);
  console.log(`${'='.repeat(80)}\n`);
  
  const sourceContent = loadFixtureContent(fixture);
  
  // 1. AI Analysis (source-level)
  const aiFindings = await analyzeWithAI(sourceContent, fixture.sourceType, opts.aiModel!);

  let lighthouseFindings: ToolFinding[] = [];
  let axeCoreFindings: ToolFinding[] = [];
  const supplementary: SupplementaryToolOutputs = {
    axeLinter: null,
    eslintJsxA11y: null,
    webhint: null,
    stylelintA11y: null,
  };

  // Always start server for URL-based tools (axeLinter, webhint, Lighthouse, axe-core)
  const harness = buildBrowserHarness(fixture, sourceContent);
  const server = await startLocalServer(harness.html, fixture, opts.serverPort!, harness.virtualFiles);
  const url = `http://localhost:${opts.serverPort}`;

  if (fixture.runBrowserAudits) {
    // 2. Lighthouse (rendered DOM)
    const lighthouseOutputPath = path.join(opts.outputDir!, `lighthouse-${fixture.name}.json`);
    lighthouseFindings = await runLighthouse(url, lighthouseOutputPath);

    // 3. axe-core (rendered DOM)
    const browser = await puppeteer.launch({ headless: opts.headless });
    axeCoreFindings = await runAxeCore(browser, url);
    await browser.close();
  } else {
    console.log(`[Browser Audits] Skipped for ${fixture.sourceType.toUpperCase()} fixture (fairness setting)`);
  }

  // 4. Supplementary URL-capable tools (work regardless of runBrowserAudits)
  supplementary.axeLinter = await runAxeLinter(url);
  supplementary.webhint = await runWebhint(url);

  // 5. Stop server
  server.close();

  // 6. Supplementary source linters.
  supplementary.eslintJsxA11y = await runEslintJsxA11y(sourceContent, fixture, opts.outputDir!);
  supplementary.stylelintA11y = await runStylelintA11y(sourceContent, fixture);
  
  // 8. Generate comparison report
  const report = createComparisonReport(
    fixture.name,
    fixture.errorCount,
    opts.aiModel!,
    aiFindings,
    lighthouseFindings,
    axeCoreFindings,
    supplementary,
  );
  
  // 9. Save and print results
  const reportPath = path.join(opts.outputDir!, `${fixture.name}-comparison.json`);
  saveComparisonReport(report, reportPath);
  printAlignmentMatrix(report);
}

/**
 * Main entry point.
 */
async function main() {
  const opts = parseArgs();
  
  // Ensure output directory exists
  if (!fs.existsSync(opts.outputDir!)) {
    fs.mkdirSync(opts.outputDir!, { recursive: true });
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  Study 6: Supplementary Tool Comparison                    ║
║ Core: AI + Lighthouse + axe-core | Extra: axe-linter, jsx-a11y, webhint   ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
  
  try {
    const fixturesToRun = opts.allFixtures
      ? STUDY_6_FIXTURES
      : [STUDY_6_FIXTURES.find(f => f.name === opts.fixture) || STUDY_6_FIXTURES[0]];
    
    for (const fixture of fixturesToRun) {
      await analyzeFixture(fixture, opts);
    }
    
    console.log(`\n✓ Study 6 analysis complete. Results saved to ${opts.outputDir}`);
  } catch (err) {
    console.error(`✗ Error during analysis: ${err}`);
    process.exit(1);
  }
}

main();
