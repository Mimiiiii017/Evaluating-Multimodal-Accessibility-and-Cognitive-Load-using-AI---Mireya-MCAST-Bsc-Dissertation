/**
 * tlx-from-llm.ts
 *
 * Live integration test: calls a real LLM (via Cloud-LLM-Preliminary benchmark
 * infrastructure) on an accessibility fixture, retrieves RAG context, then feeds
 * the detected issues into the NASA-TLX cognitive load predictor.
 *
 * Purpose:
 *   1. Proves the LLM endpoint is reachable and responding
 *   2. Proves the RAG service is returning chunks
 *   3. Shows predicted developer workload from ACTUAL model output (not mock data)
 *
 * Usage:
 *   npx ts-node src/tlx-from-llm.ts [options]
 *
 * Options:
 *   --fixture  <id>    Single fixture ID (alias for --fixtures)   (default: html-high)
 *   --fixtures <csv>   Comma-separated fixture IDs                (default: html-high)
 *   --model    <csv>   Comma-separated Ollama model IDs           (default: kimi-k2.5:cloud)
 *   --no-rag           Skip RAG retrieval
 *   --no-think         Append /no_think for reasoning models
 *   --all-conditions   Run all 4 RAG×Think conditions (overrides --no-rag / --no-think)
 *   --multi-stage-voting-kimi-qwen   kimi + qwen multi-stage voting (ignores --model)
 *   --multi-stage-voting             kimi + gpt-oss multi-stage voting (ignores --model)
 *   --multi-stage-voting-3models     kimi + gpt-oss + qwen 3-model voting (ignores --model)
 *   --host     <url>   Ollama host                               (default: from VS Code settings)
 *   --rag-endpoint <url> RAG service URL                         (default: http://127.0.0.1:8000)
 *
 * Examples:
 *   npx ts-node src/tlx-from-llm.ts
 *   npx ts-node src/tlx-from-llm.ts --fixture css-high --model gpt-oss:120b-cloud
 *   npx ts-node src/tlx-from-llm.ts --fixtures html-high,css-high,js-high,tsx-high --model kimi-k2.5:cloud --all-conditions
 *   npx ts-node src/tlx-from-llm.ts --fixtures html-high,css-high,js-high,tsx-high --multi-stage-voting-kimi-qwen --all-conditions
 *   npx ts-node src/tlx-from-llm.ts --fixtures html-high,css-high,js-high,tsx-high --multi-stage-voting-3models --all-conditions
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Cloud-LLM-Preliminary infrastructure ────────────────────────────────
import {
  runOnce,
  ModelBenchmarkConfig,
  ModelRunResult,
  createMultiStageVotedResult,
  createThreeModelMultiStageVotedResult,
} from '../../../benchmark/benchmark';
import { DEFAULT_ANALYSIS_PRESET } from '../../../../extension/ai-accessibility-assistant/src/utils/llm/ollama';
import type { AiIssue } from '../../../../extension/ai-accessibility-assistant/src/utils/types';

// ─── Fixtures & scoring ────────────────────────────────────────────────────
import { FIXTURE_MAP, ALL_FIXTURES } from '../../../fixtures/ground-truth';

// ─── NASA-TLX predictor ─────────────────────────────────────────────────────
import { predictTlxFromIssues, AccessibilityIssue } from './nasa-tlx-test-harness';

// ─── CLI argument parsing ─────────────────────────────────────────────────

type VotingMode = 'none' | 'multi-stage-kimi-qwen' | 'multi-stage-kimi-gpt' | 'multi-stage-3models';

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let fixtureIds  = ['html-high'];
  let modelIds    = ['kimi-k2.5:cloud'];
  let noRag       = false;
  let noThink     = false;
  let allConditions = false;
  let votingMode: VotingMode = 'none';
  let host        = getDefaultHost();
  let ragEndpoint = 'http://127.0.0.1:8000';

  let outputDir = path.join(__dirname, '../results');
  let save      = true;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fixture':                          fixtureIds  = args[++i].split(',').map(s => s.trim()); break;
      case '--fixtures':                         fixtureIds  = args[++i].split(',').map(s => s.trim()); break;
      case '--model':                            modelIds    = args[++i].split(',').map(s => s.trim()); break;
      case '--no-rag':                           noRag       = true;  break;
      case '--no-think':                         noThink     = true;  break;
      case '--all-conditions':                   allConditions = true; break;
      case '--multi-stage-voting-kimi-qwen':     votingMode  = 'multi-stage-kimi-qwen';  break;
      case '--multi-stage-voting':               votingMode  = 'multi-stage-kimi-gpt';   break;
      case '--multi-stage-voting-3models':       votingMode  = 'multi-stage-3models';    break;
      case '--host':                             host        = args[++i]; break;
      case '--rag-endpoint':                     ragEndpoint = args[++i]; break;
      case '--output':                           outputDir   = args[++i]; break;
      case '--no-save':                          save        = false;  break;
    }
  }

  return { fixtureIds, modelIds, noRag, noThink, allConditions, votingMode, host, ragEndpoint, outputDir, save };
}

// ─── Result row type ──────────────────────────────────────────────────────

interface TlxResultRow {
  condition:        string;   // e.g. rag-think
  modelId:          string;   // e.g. kimi-k2.5:cloud  OR  multi-stage-voting-kimi-qwen
  fixtureId:        string;
  responseTimeS:    number;
  issuesDetected:   number;
  tp:               number;
  fn:               number;
  fp:               number;
  precision:        number;
  recall:           number;
  f1:               number;
  tlxScore:         number;
  confidence:       string;
  mental:           number;
  physical:         number;
  temporal:         number;
  performance:      number;
  effort:           number;
  frustration:      number;
  interpretation:   string;
}

// ─── Tee logger (writes to both stdout and an in-memory buffer) ────────────

class TeeLogger {
  private lines: string[] = [];

  log(msg = ''): void {
    console.log(msg);
    this.lines.push(msg);
  }

  error(msg = ''): void {
    console.error(msg);
    this.lines.push(msg);
  }

  flush(): string {
    return this.lines.join('\n');
  }
}

// ─── Save helpers ──────────────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').slice(0, 23) + 'Z';
}

function saveResults(
  rows:      TlxResultRow[],
  label:     string,
  outputDir: string,
  textLog:   string,
): void {
  ensureDir(outputDir);
  const ts   = timestamp();
  const base = `nasa-tlx-${label}-${ts}`;

  // JSON
  const jsonPath = path.join(outputDir, `${base}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf8');

  // CSV
  const csvHeader = [
    'condition','modelId','fixtureId','responseTimeS',
    'issuesDetected','tp','fn','fp','precision','recall','f1',
    'tlxScore','confidence','mental','physical','temporal','performance','effort','frustration','interpretation',
  ].join(',');
  const csvRows = rows.map(r => [
    r.condition, r.modelId, r.fixtureId, r.responseTimeS.toFixed(1),
    r.issuesDetected, r.tp, r.fn, r.fp,
    r.precision.toFixed(4), r.recall.toFixed(4), r.f1.toFixed(4),
    r.tlxScore, r.confidence,
    r.mental.toFixed(0), r.physical.toFixed(0), r.temporal.toFixed(0),
    r.performance.toFixed(0), r.effort.toFixed(0), r.frustration.toFixed(0),
    `"${r.interpretation}"`,
  ].join(','));
  const csvPath = path.join(outputDir, `${base}.csv`);
  fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join('\n'), 'utf8');

  // Text (terminal transcript)
  const txtPath = path.join(outputDir, `${base}.txt`);
  fs.writeFileSync(txtPath, textLog, 'utf8');

  console.log(`\n  Results saved →`);
  console.log(`    JSON : ${jsonPath}`);
  console.log(`    CSV  : ${csvPath}`);
  console.log(`    TXT  : ${txtPath}`);
}

/** Read ollamaHost from workspace VS Code settings — same logic as run.ts */
function getDefaultHost(): string {
  try {
    const settingsPath = path.join(__dirname, '../../../../../.vscode/settings.json');
    const raw = fs.readFileSync(settingsPath, 'utf8');
    const m = raw.match(/"aiAccessibilityAssistant\.ollamaHost"\s*:\s*"([^"]+)"/);
    if (m) return m[1].replace(/\/$/, '');
  } catch { /* fall through */ }
  return 'http://localhost:11434';
}

// ─── AiIssue → AccessibilityIssue mapping ─────────────────────────────────

/**
 * Map an AiIssue from the LLM to the AccessibilityIssue type used by the
 * NASA-TLX predictor.  Infers category and severity from title keywords.
 */
function mapAiIssueToAccessibilityIssue(issue: AiIssue, index: number): AccessibilityIssue {
  const title = (issue.title ?? '').toLowerCase();
  const explanation = (issue.explanation ?? '').toLowerCase();
  const combined = `${title} ${explanation}`;

  // Infer category
  let category: AccessibilityIssue['category'] = 'html';
  if (combined.includes('aria') || combined.includes('role'))        category = 'aria';
  else if (combined.includes('focus') || combined.includes('outline')) category = 'focus';
  else if (combined.includes('contrast') || combined.includes('colour') || combined.includes('color')) category = 'contrast';
  else if (combined.includes('keyboard') || combined.includes('tab order')) category = 'keyboard' as any;
  else if (combined.includes('css') || combined.includes('style'))   category = 'css';
  else if (combined.includes('javascript') || combined.includes('.js')) category = 'js';
  else if (combined.includes('react') || combined.includes('tsx'))   category = 'js';
  else if (combined.includes('motor') || combined.includes('touch target')) category = 'motor';
  else if (combined.includes('cognitive') || combined.includes('timing') || combined.includes('animation')) category = 'cognitive';

  // Map severity
  let severity: AccessibilityIssue['severity'] = 'medium';
  const rawSeverity = issue.severity;
  if (rawSeverity === 'high')        severity = 'high';
  else if (rawSeverity === 'low')    severity = 'low';
  else if (rawSeverity === 'med')    severity = 'medium';

  // Bump to critical for certain high-impact patterns
  if (
    combined.includes('missing') && combined.includes('label') ||
    combined.includes('keyboard trap') ||
    combined.includes('focus') && combined.includes('removed')
  ) {
    severity = 'critical';
  }

  return {
    id: `llm-${index}`,
    title: issue.title ?? `Issue ${index + 1}`,
    category,
    severity,
  };
}

// ─── Per-condition runner ──────────────────────────────────────────────────

/** Resolve the fixed model pair/trio for a voting mode */
function votingModels(mode: VotingMode): string[] {
  switch (mode) {
    case 'multi-stage-kimi-qwen': return ['kimi-k2.5:cloud', 'qwen3.5:397b-cloud'];
    case 'multi-stage-kimi-gpt':  return ['kimi-k2.5:cloud', 'gpt-oss:120b-cloud'];
    case 'multi-stage-3models':   return ['kimi-k2.5:cloud', 'gpt-oss:120b-cloud', 'qwen3.5:397b-cloud'];
    default: return [];
  }
}

function votingLabel(mode: VotingMode): string {
  switch (mode) {
    case 'multi-stage-kimi-qwen': return 'multi-stage-voting-kimi-qwen';
    case 'multi-stage-kimi-gpt':  return 'multi-stage-voting';
    case 'multi-stage-3models':   return 'multi-stage-voting-3models';
    default: return 'single';
  }
}

function computeTlxAndLog(
  result:     ModelRunResult,
  fixture:    NonNullable<ReturnType<typeof FIXTURE_MAP.get>>,
  condLabel:  string,
  modelLabel: string,
  elapsedS:   number,
  log:        TeeLogger,
): TlxResultRow {
  const accessibilityIssues: AccessibilityIssue[] = result.issuesFound.map(
    (issue, i) => mapAiIssueToAccessibilityIssue(issue, i)
  );
  const prediction = predictTlxFromIssues(fixture.fixtureId, accessibilityIssues);

  const tlx = prediction.raw_tlx;
  let interpretation: string;
  if (tlx < 20)       interpretation = 'Low workload';
  else if (tlx < 40)  interpretation = 'Low-moderate workload';
  else if (tlx < 60)  interpretation = 'Moderate workload';
  else if (tlx < 75)  interpretation = 'High workload';
  else                interpretation = 'Very high workload';

  log.log(`  ✓ ${elapsedS.toFixed(1)}s  |  F1: ${(result.f1 * 100).toFixed(1)}%  (${result.tp} TP / ${result.fn} FN / ${result.fp} FP)`);
  log.log(`  TLX: ${prediction.raw_tlx}/100  [${prediction.confidence.toUpperCase()}]  — ${interpretation}`);
  log.log(`  Subscales → Mental:${prediction.subscale_scores.mental_demand.toFixed(0)}  Physical:${prediction.subscale_scores.physical_demand.toFixed(0)}  Temporal:${prediction.subscale_scores.temporal_demand.toFixed(0)}  Effort:${prediction.subscale_scores.effort.toFixed(0)}  Frustration:${prediction.subscale_scores.frustration.toFixed(0)}`);

  return {
    condition:       condLabel,
    modelId:         modelLabel,
    fixtureId:       fixture.fixtureId,
    responseTimeS:   elapsedS,
    issuesDetected:  result.issuesFound.length,
    tp:              result.tp,
    fn:              result.fn,
    fp:              result.fp,
    precision:       result.precision,
    recall:          result.recall,
    f1:              result.f1,
    tlxScore:        prediction.raw_tlx,
    confidence:      prediction.confidence,
    mental:          prediction.subscale_scores.mental_demand,
    physical:        prediction.subscale_scores.physical_demand,
    temporal:        prediction.subscale_scores.temporal_demand,
    performance:     prediction.subscale_scores.performance,
    effort:          prediction.subscale_scores.effort,
    frustration:     prediction.subscale_scores.frustration,
    interpretation,
  };
}

async function runCondition(
  noRag: boolean,
  noThink: boolean,
  opts: ReturnType<typeof parseArgs>,
  modelIds: string[],
  fixtures: NonNullable<ReturnType<typeof FIXTURE_MAP.get>>[],
  allConceptIds: string[],
  log: TeeLogger,
): Promise<TlxResultRow[]> {
  const condLabel = `${noRag ? 'norag' : 'rag'}-${noThink ? 'nothink' : 'think'}`;
  const mode = opts.votingMode;
  const rows: TlxResultRow[] = [];

  log.log(`\n${'─'.repeat(72)}`);
  log.log(`  Condition: ${condLabel.toUpperCase()}${mode !== 'none' ? `  [${votingLabel(mode)}]` : ''}`);
  log.log(`${'─'.repeat(72)}`);

  function makeConfig(modelId: string): ModelBenchmarkConfig {
    return {
      ollamaHost:         opts.host,
      ragEndpoint:        opts.ragEndpoint,
      presetId:           DEFAULT_ANALYSIS_PRESET,
      noRag,
      noThink,
      models:             [modelId],
      fixtures:           [],
      runsPerCombination: 1,
      verbose:            false,
    };
  }

  for (const fixture of fixtures) {
    if (mode === 'none') {
      for (const modelId of modelIds) {
        log.log(`\n▶ [${condLabel}] ${modelId}  ×  ${fixture.fixtureId}`);
        const t0 = Date.now();
        const result = await runOnce(makeConfig(modelId), modelId, fixture, 0, allConceptIds);
        const elapsedS = (Date.now() - t0) / 1000;

        if (result.errorOccurred) { log.error(`  ✗ Failed: ${result.errorMessage}`); continue; }
        rows.push(computeTlxAndLog(result, fixture, condLabel, modelId, elapsedS, log));
      }
    } else if (mode === 'multi-stage-kimi-qwen' || mode === 'multi-stage-kimi-gpt') {
      const [m1, m2] = votingModels(mode);
      log.log(`\n▶ [${condLabel}] ${m1} + ${m2}  ×  ${fixture.fixtureId}`);
      const t0 = Date.now();
      const [r1, r2] = await Promise.all([
        runOnce(makeConfig(m1), m1, fixture, 0, allConceptIds),
        runOnce(makeConfig(m2), m2, fixture, 0, allConceptIds),
      ]);
      const elapsedS = (Date.now() - t0) / 1000;

      if (r1.errorOccurred) { log.error(`  ✗ ${m1} failed: ${r1.errorMessage}`); continue; }
      if (r2.errorOccurred) { log.error(`  ✗ ${m2} failed: ${r2.errorMessage}`); continue; }

      const voted = createMultiStageVotedResult(r1, r2, fixture, votingLabel(mode));
      log.log(`  [${m1}] F1: ${(r1.f1 * 100).toFixed(1)}%  ${r1.tp} TP / ${r1.fn} FN / ${r1.fp} FP`);
      log.log(`  [${m2}] F1: ${(r2.f1 * 100).toFixed(1)}%  ${r2.tp} TP / ${r2.fn} FN / ${r2.fp} FP`);
      log.log(`  [voted]  F1: ${(voted.f1 * 100).toFixed(1)}%  ${voted.tp} TP / ${voted.fn} FN / ${voted.fp} FP  (${voted.issuesFound.length} combined issues)`);
      rows.push(computeTlxAndLog(voted, fixture, condLabel, votingLabel(mode), elapsedS, log));
    } else if (mode === 'multi-stage-3models') {
      const [m1, m2, m3] = votingModels(mode);
      log.log(`\n▶ [${condLabel}] ${m1} + ${m2} + ${m3}  ×  ${fixture.fixtureId}`);
      const t0 = Date.now();
      const [r1, r2, r3] = await Promise.all([
        runOnce(makeConfig(m1), m1, fixture, 0, allConceptIds),
        runOnce(makeConfig(m2), m2, fixture, 0, allConceptIds),
        runOnce(makeConfig(m3), m3, fixture, 0, allConceptIds),
      ]);
      const elapsedS = (Date.now() - t0) / 1000;

      if (r1.errorOccurred) { log.error(`  ✗ ${m1} failed: ${r1.errorMessage}`); continue; }
      if (r2.errorOccurred) { log.error(`  ✗ ${m2} failed: ${r2.errorMessage}`); continue; }
      if (r3.errorOccurred) { log.error(`  ✗ ${m3} failed: ${r3.errorMessage}`); continue; }

      const voted = createThreeModelMultiStageVotedResult(r1, r2, r3, fixture, votingLabel(mode));
      log.log(`  [${m1}] F1: ${(r1.f1 * 100).toFixed(1)}%  ${r1.tp} TP / ${r1.fn} FN / ${r1.fp} FP`);
      log.log(`  [${m2}] F1: ${(r2.f1 * 100).toFixed(1)}%  ${r2.tp} TP / ${r2.fn} FN / ${r2.fp} FP`);
      log.log(`  [${m3}] F1: ${(r3.f1 * 100).toFixed(1)}%  ${r3.tp} TP / ${r3.fn} FN / ${r3.fp} FP`);
      log.log(`  [voted]  F1: ${(voted.f1 * 100).toFixed(1)}%  ${voted.tp} TP / ${voted.fn} FN / ${voted.fp} FP  (${voted.issuesFound.length} combined issues)`);
      rows.push(computeTlxAndLog(voted, fixture, condLabel, votingLabel(mode), elapsedS, log));
    }
  }

  return rows;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);
  const log  = new TeeLogger();

  log.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  log.log('║           NASA-TLX Live LLM Integration Test                         ║');
  log.log('║   Calls real LLM + RAG → detects issues → predicts workload score    ║');
  log.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  // ── Resolve fixtures ──────────────────────────────────────────────────────
  const fixtures: NonNullable<ReturnType<typeof FIXTURE_MAP.get>>[] = [];
  for (const fid of opts.fixtureIds) {
    const f = FIXTURE_MAP.get(fid);
    if (!f) {
      const available = ALL_FIXTURES.map(x => x.fixtureId).join(', ');
      log.error(`✗ Unknown fixture "${fid}". Available: ${available}`);
      process.exit(1);
    }
    fixtures.push(f);
  }

  log.log('Configuration:');
  log.log(`  Fixtures:     ${opts.fixtureIds.join(', ')}`);
  if (opts.votingMode !== 'none') {
    log.log(`  Voting mode:  ${votingLabel(opts.votingMode)}  →  models: ${votingModels(opts.votingMode).join(' + ')}`);
  } else {
    log.log(`  Models:       ${opts.modelIds.join(', ')}`);
  }
  log.log(`  Conditions:   ${opts.allConditions ? 'all 4 (rag-think, rag-nothink, norag-think, norag-nothink)' : `${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}` }`);
  log.log(`  RAG endpoint: ${opts.ragEndpoint}`);
  log.log(`  Ollama host:  ${opts.host}`);
  if (opts.save) log.log(`  Output dir:   ${opts.outputDir}`);
  log.log('');

  // ── All concept IDs (for TN calculation) ─────────────────────────────────
  const allConceptIds = Array.from(
    new Set(ALL_FIXTURES.flatMap(f => f.expectedIssues.map(c => c.id)))
  );

  // ── Determine run label (used for filename) ───────────────────────────────
  const modeTag   = opts.votingMode !== 'none' ? votingLabel(opts.votingMode) : opts.modelIds.map(m => m.replace(/:cloud$/,'')).join('+');
  const condTag   = opts.allConditions ? 'all-conditions' : `${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}`;
  const runLabel  = `${modeTag}-${condTag}`;

  const allRows: TlxResultRow[] = [];

  // ── Run conditions ────────────────────────────────────────────────────────
  if (opts.allConditions) {
    for (const [noRag, noThink] of [[false, false], [false, true], [true, false], [true, true]] as [boolean, boolean][]) {
      const rows = await runCondition(noRag, noThink, opts, opts.modelIds, fixtures, allConceptIds, log);
      allRows.push(...rows);
    }
  } else {
    const noRag   = opts.noRag;
    const noThink = opts.noThink;
    const fixture = fixtures[0];
    const modelId = opts.modelIds[0];

    if (fixtures.length > 1 || opts.modelIds.length > 1 || opts.votingMode !== 'none') {
      const rows = await runCondition(noRag, noThink, opts, opts.modelIds, fixtures, allConceptIds, log);
      allRows.push(...rows);
    } else {
      // ── Single fixture × single model — full verbose output ───────────────
      const config: ModelBenchmarkConfig = {
        ollamaHost:         opts.host,
        ragEndpoint:        opts.ragEndpoint,
        presetId:           DEFAULT_ANALYSIS_PRESET,
        noRag,
        noThink,
        models:             [modelId],
        fixtures:           [fixture],
        runsPerCombination: 1,
        verbose:            false,
      };

      log.log(`▶ Calling ${modelId} on fixture "${fixture.fixtureId}"...`);
      const t0 = Date.now();
      const result = await runOnce(config, modelId, fixture, 0, allConceptIds);
      const elapsedS = (Date.now() - t0) / 1000;

      if (result.errorOccurred) {
        log.error(`\n✗ LLM call failed: ${result.errorMessage}`);
        log.error('  → Check that Ollama is running and the model is available.');
        process.exit(1);
      }

      log.log(`✓ LLM responded in ${elapsedS.toFixed(1)}s\n`);

      log.log('─── LLM Detection Results ───────────────────────────────────────────────');
      log.log(`  Issues detected:   ${result.issuesFound.length}`);
      log.log(`  True Positives:    ${result.tp}  (correctly identified)`);
      log.log(`  False Negatives:   ${result.fn}  (missed)`);
      log.log(`  False Positives:   ${result.fp}  (hallucinated)`);
      log.log(`  Precision:         ${(result.precision * 100).toFixed(1)}%`);
      log.log(`  Recall:            ${(result.recall * 100).toFixed(1)}%`);
      log.log(`  F1 Score:          ${(result.f1 * 100).toFixed(1)}%`);
      log.log('');

      if (result.issuesFound.length === 0) log.log('  ⚠ No issues detected — TLX prediction will be 0 (baseline).');

      const row = computeTlxAndLog(result, fixture, `${noRag?'norag':'rag'}-${noThink?'nothink':'think'}`, modelId, elapsedS, log);
      allRows.push(row);

      log.log('');
      log.log('─── NASA-TLX Predicted Workload (detail) ────────────────────────────────');
      log.log(`  Subscale Scores:`);
      const pred = predictTlxFromIssues(fixture.fixtureId, result.issuesFound.map((iss,i) => mapAiIssueToAccessibilityIssue(iss,i)));
      log.log(`    Mental Demand:      ${pred.subscale_scores.mental_demand.toFixed(0)}/100`);
      log.log(`    Physical Demand:    ${pred.subscale_scores.physical_demand.toFixed(0)}/100`);
      log.log(`    Temporal Demand:    ${pred.subscale_scores.temporal_demand.toFixed(0)}/100`);
      log.log(`    Performance:        ${pred.subscale_scores.performance.toFixed(0)}/100`);
      log.log(`    Effort:             ${pred.subscale_scores.effort.toFixed(0)}/100`);
      log.log(`    Frustration:        ${pred.subscale_scores.frustration.toFixed(0)}/100`);
      log.log('');

      if (result.issuesFound.length > 0) {
        log.log('─── Detected Issues (first 10) ──────────────────────────────────────────');
        for (const issue of result.issuesFound.slice(0, 10)) {
          const sev = issue.severity ? `[${issue.severity.toUpperCase()}]` : '';
          log.log(`  ${sev.padEnd(7)} ${issue.title ?? '(no title)'}`);
        }
        if (result.issuesFound.length > 10) log.log(`  ... and ${result.issuesFound.length - 10} more`);
        log.log('');
      }

      if (result.missedIds && result.missedIds.length > 0) {
        log.log('─── Missed Ground-Truth Issues ──────────────────────────────────────────');
        for (const id of result.missedIds.slice(0, 8)) {
          const concept = fixture.expectedIssues.find(c => c.id === id);
          log.log(`  ✗ ${id}: ${concept?.description ?? '(unknown)'}`);
        }
        if (result.missedIds.length > 8) log.log(`  ... and ${result.missedIds.length - 8} more missed`);
        log.log('');
      }

      log.log('╔═══════════════════════════════════════════════════════════════════════╗');
      log.log('║  Summary                                                              ║');
      log.log('╠═══════════════════════════════════════════════════════════════════════╣');
      log.log(`║  LLM:            ✓ LIVE  (${elapsedS.toFixed(1)}s response time)`.padEnd(72) + '║');
      log.log(`║  RAG:            ${noRag ? '— skipped' : '✓ ACTIVE  (chunks injected into prompt)'}`.padEnd(72) + '║');
      log.log(`║  Detection F1:   ${(result.f1 * 100).toFixed(1)}%  (${result.tp} TP / ${result.fn} FN / ${result.fp} FP)`.padEnd(72) + '║');
      log.log(`║  Predicted TLX:  ${row.tlxScore}/100  — ${row.interpretation}`.padEnd(72) + '║');
      log.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
    }
  }

  // ── Save results ──────────────────────────────────────────────────────────
  if (opts.save && allRows.length > 0) {
    saveResults(allRows, runLabel, opts.outputDir, log.flush());
  }
}

main().catch(err => {
  console.error('\nFatal error:', err?.message ?? err);
  process.exit(1);
});
