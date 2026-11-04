/**
 * run.ts  —  CLI entry point for Cloud-LLM-Preliminary
 *
 * Usage:
 *   npx ts-node run.ts [options]
 *
 * Options:
 *   --lang     <name>  Language filter: all | html | css | js | tsx  (default: all)
 *   --fixtures <csv>   Comma-separated fixture IDs — overrides --lang if provided
 *   --preset   <id>    Analysis preset to use             (default: balanced)
 *   --host     <url>   Ollama base URL                    (default: http://localhost:11434)
 *   --runs     <n>     Repetitions per model/fixture pair (default: 1)
 *   --output   <dir>   Directory for JSON/CSV output      (default: ./results)
 *   --no-save          Skip saving result files
 *   --quiet            Suppress progress output
 *   --concurrency <n>  Parallel fixture calls per model (default: 2)
 *   --all-conditions   Run all 4 RAG×Think conditions simultaneously
 *   --help
 *
 * Examples:
 *   npx ts-node run.ts                                     # all fixtures, all models
 *   npx ts-node run.ts --lang html                         # only HTML fixtures
 *   npx ts-node run.ts --lang tsx --runs 2                 # only TSX, 2 runs each
 *   npx ts-node run.ts --fixtures html-low,html-medium     # exact fixture IDs
 *   npx ts-node run.ts --preset strict --no-save
 *   npx ts-node run.ts --fixtures html-high,css-high,js-high,tsx-high --runs 3 --all-conditions
 */

import * as path from 'path';
import * as fs from 'fs';

// ─── Read ollamaHost from workspace VS Code settings (shared with extension) ──
function getDefaultHost(): string {
  try {
    const settingsPath = path.join(__dirname, '../../.vscode/settings.json');
    const raw = fs.readFileSync(settingsPath, 'utf8');
    // Use regex extraction — avoids JSON.parse issues with literal newlines in
    // other settings values (e.g. chat.tools.terminal.autoApprove patterns).
    const m = raw.match(/"aiAccessibilityAssistant\.ollamaHost"\s*:\s*"([^"]+)"/);
    if (m) return m[1].replace(/\/$/, '');
  } catch { /* fall through to default */ }
  return 'http://localhost:11434';
}

const DEFAULT_HOST = getDefaultHost();

import {
  ANALYSIS_PRESETS,
  AnalysisPresetId,
  DEFAULT_ANALYSIS_PRESET,
} from '../../extension/ai-accessibility-assistant/src/utils/llm/ollama';

import { ALL_FIXTURES, CORE_FIXTURES, ADVERSARIAL_FIXTURES, FIXTURE_MAP } from '../fixtures/ground-truth';
import { ModelBenchmarkConfig, runBenchmark, shortName, computeConsensusIssues, createVotedResult, computeRejectedIssues, scoreRejectedIssues, createMultiStageVotedResult, computeMajorityVotingIssues, createThreeModelMultiStageVotedResult, ModelRunResult } from '../benchmark/benchmark';
import { printReport, saveJson, saveCsv, saveReport } from './reporter';

// ─── All installed models ──────────────────────────────────────────────────

const ALL_MODELS: string[] = [
  // ── Smaller / faster (<30 B) ───────────────────────────────────────────

  // 'ministral-3:3b-cloud',        // ~3 B         — removed after T13: FP=225 across T13 conditions; chronic hallucinator across all tests; avg F1=24.3%
  // 'gemma3:4b-cloud',             // ~4 B          — removed after T12: avg 13.6% F1, no response to prompt changes
  // 'gpt-oss:20b-cloud',           // ~20 B        — removed after T13: TP≈0 in 3/4 conditions across all tests; effectively non-functional as an accessibility auditor
  // 'devstral-small-2:24b-cloud',  // ~24 B        — removed after T14: rt=7.5% rn=7.5%; complete collapse under RAG in both conditions; worst RAG performance series-wide
  // 'gemma3:27b-cloud',            // ~27 B        — removed after T14: avg F1=16.2%; four conditions no improvement trajectory; underperforms models half its size
  // 'nemotron-3-nano:30b-cloud',   // ~30 B         — removed after T12: avg 17.3% F1, extreme instability (7% rt vs 32% rn same test)
  // 'ministral-3:14b-cloud',       // ~14 B        — removed after T14: rn FP=129 across 3 runs (avg 43 FP/run); hallucination flood undermines precision
  
  
  // ── Mid-range (30–200 B) ──────────────────────────────────────────────
  
  // 'gemini-3-flash-preview:cloud',  // ~undisclosed  — removed after T31: 1/4 conditions across T29–T31 (nn only); plateau with no improvement trajectory; TSX and JS recall consistently near-zero; retained as contrast model through T31 but adds no discriminating signal
  // 'minimax-m2.5:cloud',           // ~456 B MoE (updated) — BROKEN: cloud API returns HTTP 500 on every request
  // 'deepseek-v3.2:cloud',          // ~671 B MoE  — removed after T31: genuine 0/4 across T28–T31 (T29/T30 passes were error-denominator artifacts); extreme slowness (557–767 s avg per fixture); CSS cold-scan timeouts in norag; nt recall 12.2% in clean run
  // 'gemma4:31b-cloud',             // ~31 B        — removed after T31: 0/4 across T28–T31 with flat 79.1–79.4% ceiling; does not follow structured sweep instructions; JS TP=4, TSX TP=6 in final clean run; prompt changes produce no measurable improvement


  // ── Large (100–700 B) ─────────────────────────────────────────────────
  
  // 'devstral-2:123b-cloud',        // ~123 B        — removed after T12: avg 18.7% F1, flat across all 3 tests, large model behaving like a small one
  'gpt-oss:120b-cloud',              // ~120 B  — T15 #1: avg F1=50.6%, best rn=61.6%
  // 'nemotron-3-super:cloud',       // ~undisclosed  — removed after T13: catastrophic failures in rn (FP=39) and nt (F1=7.6%); avg F1=17.6%; incoherent condition variance
  // 'cogito-2.1:671b-cloud',        // ~671 B        — removed after T15: avg F1=24.1%; zero FP all conditions (predicts no issues); 671B size with bottom-3 performance
  // 'mistral-large-3:675b-cloud',   // ~675 B        — removed after T23: 0/4 conditions ≥80% accuracy; 116 FPs in nn (recall-bias catastrophe); structurally recall-limited
  
  
  // ── Very large / undisclosed (>235 B) ────────────────────────────────
  
  // 'qwen3-vl:235b-cloud',          // ~235 B        — removed after T15: avg F1=25.5%; vision-language model; nt worst at 17.9%; not suited to pure-text HTML analysis
  'qwen3.5:397b-cloud',              // ~397 B  — T15 #3: avg F1=39.9%; most stable model
  // 'qwen3-coder:480b-cloud',       // ~480 B        — removed after T15: avg F1=20.9%; declining trend T12→T15; worst of large models
  // 'qwen3-coder-next:cloud',       // ~undisclosed  — removed after T13: extreme condition variance (7.6%–35.7%); nt dropped 32.5 pp T12→T13; avg F1=18.8%
  'kimi-k2.5:cloud',                 // ~undisclosed  — T42-T47: baseline; avg F1=70.5% (multi-stage rag-think) — winner of T48-T49 comparison
  // 'kimi-k2.6:cloud',              // ~undisclosed  — removed after T48–T49: k2.6 showed severe degradation (F1 46%→44% vs k2.5's 70.5%); recall collapsed to 30% (−43.6 pp); temperature adjustment made no difference; model fundamentally unsuited for accessibility detection
  // 'glm-5:cloud',                  // ~undisclosed  — removed after T23: 2/4 conditions ≥80%; rn regressed −2pp to 79.9%; slow (236–343s avg); replaced by stronger models
];

// ─── Language → languageId mapping ───────────────────────────────────────

const LANG_MAP: Record<string, string> = {
  html: 'html',
  css:  'css',
  js:   'javascript',
  tsx:  'typescriptreact',
};

// ─── Argument parsing ──────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args = argv.slice(2);

  const flag = (name: string) => args.includes(name);
  const opt  = (name: string) => {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : undefined;
  };

  if (flag('--help') || flag('-h')) {
    console.log(`
Usage: npx ts-node run.ts [options]

Options:
  --lang     <name>  Language filter — selects fixtures by language (default: all)
             Choices: all | html | css | js | tsx
             all  → all 16 fixtures (4 clean + 12 error)
             html → html-clean, html-low, html-medium, html-high
             css  → css-clean, css-low, css-medium, css-high
             js   → js-clean, js-low, js-medium, js-high
             tsx  → tsx-clean, tsx-low, tsx-medium, tsx-high
  --complexity <tier>  Complexity tier filter (default: all)
                Choices: all | low | medium | high
  --fixtures <csv>   Exact fixture IDs — overrides --lang if provided
             Available: ${ALL_FIXTURES.map(f => f.fixtureId).join(', ')}
  --preset   <id>    Fixed analysis preset (default: balanced)
             Choices: ${Object.keys(ANALYSIS_PRESETS).join(', ')}
  --host     <url>   Ollama base URL (default: http://localhost:11434)
  --runs     <n>     Repetitions per combination (default: 1)
  --output   <dir>   Output directory (default: ./results)
  --no-save          Skip writing JSON/CSV files
  --quiet            Suppress progress output
  --no-rag           Disable RAG context injection (useful for ablation testing)
  --no-think         Re-enable /no_think directive — suppresses chain-of-thought
                     for reasoning models (Qwen3, kimi, DeepSeek). Use for the
                     no-think vs think ablation condition.
  --no-fixture-guidance Disable fixture-specific prompt guidance (useful for ablation testing)
                     to isolate RAG impact vs guidance impact
  --concurrency <n>  Max parallel fixture calls per model (default: 1 — safe for cloud gateway; use 4 for local-only Ollama)
  --model    <csv>   Comma-separated model shortNames to run (default: all)
             e.g. --model kimi-k2.5 or --model "kimi-k2.5,deepseek-v3.2"
  --all-conditions   Run all 4 RAG×Think conditions simultaneously and save
                     separate result files for each. Ignores --no-rag / --no-think.
  --ensemble-voting  Run ensemble voting with kimi-k2.5 (high recall) and
                     gpt-oss:120b (high precision). Keeps only issues both
                     models agree on. Produces consensus F1 score.
  --multi-stage-voting Run multi-stage voting: Stage 1 consensus (high precision)
                     + Stage 2 secondary review (recover recall). Labels issues
                     as "verified" (both models) or "review-recommended" (single model).
  --multi-stage-voting-3models Run 3-model multi-stage voting (kimi + gpt-oss + qwen).
                     Stage 1: Majority voting (2 of 3 must agree). Stage 2: secondary
                     review. Expected: 72%+ F1, improved precision via consensus.
  --multi-stage-voting-kimi-qwen Run multi-stage voting with kimi (recall) + qwen (balanced).
                     Alternative model pair to test if qwen precision helps over gpt-oss.
                     Stage 1: Consensus, Stage 2: secondary review. Expected: 69-71% F1.
  --help             Show this help
    `);
    process.exit(0);
  }

  // Fixtures — --fixtures wins; otherwise apply --lang filter
  const fixturesRaw = opt('--fixtures');
  let fixtureIds: string[];

  if (fixturesRaw) {
    fixtureIds = fixturesRaw.split(',').map(s => s.trim());
    for (const id of fixtureIds) {
      if (!FIXTURE_MAP.has(id)) {
        console.error(`Unknown fixture "${id}". Valid: ${ALL_FIXTURES.map(f => f.fixtureId).join(', ')}`);
        process.exit(1);
      }
    }
  } else {
    const langRaw = (opt('--lang') ?? 'all').toLowerCase().trim();
    if (langRaw !== 'all' && !(langRaw in LANG_MAP)) {
      console.error(`Unknown --lang "${langRaw}". Valid: all, ${Object.keys(LANG_MAP).join(', ')}`);
      process.exit(1);
    }
    const langId = langRaw !== 'all' ? LANG_MAP[langRaw] : undefined;
    
    // Apply complexity tier filter if provided
    const complexityRaw = (opt('--complexity') ?? 'all').toLowerCase().trim();
    const validComplexities = ['all', 'low', 'medium', 'high'];
    if (!validComplexities.includes(complexityRaw)) {
      console.error(`Unknown --complexity "${complexityRaw}". Valid: ${validComplexities.join(', ')}`);
      process.exit(1);
    }
    
    const adversarial = flag('--adversarial');
    const fixturePool = adversarial ? ADVERSARIAL_FIXTURES : CORE_FIXTURES;
    fixtureIds = fixturePool
      .filter(f => langId === undefined || f.languageId === langId)
      .filter(f => {
        if (complexityRaw === 'all') return true;
        if (complexityRaw === 'low')    return f.fixtureId.includes('-low');
        if (complexityRaw === 'medium') return f.fixtureId.includes('-medium');
        if (complexityRaw === 'high')   return f.fixtureId.includes('-high');
        return false;
      })
      .map(f => f.fixtureId);
  }

  // Preset
  const presetRaw = opt('--preset') ?? DEFAULT_ANALYSIS_PRESET;
  if (!(presetRaw in ANALYSIS_PRESETS)) {
    console.error(`Unknown preset "${presetRaw}". Valid: ${Object.keys(ANALYSIS_PRESETS).join(', ')}`);
    process.exit(1);
  }

  const runs = parseInt(opt('--runs') ?? '1', 10);
  if (isNaN(runs) || runs < 1) {
    console.error('--runs must be a positive integer');
    process.exit(1);
  }

  const concurrency = parseInt(opt('--concurrency') ?? '1', 10);
  if (isNaN(concurrency) || concurrency < 1) {
    console.error('--concurrency must be a positive integer');
    process.exit(1);
  }

  return {
    fixtureIds,
    lang:      opt('--lang') ?? 'all',
    presetId:  presetRaw as AnalysisPresetId,
    host:      opt('--host')   ?? DEFAULT_HOST,
    runs,
    outputDir: opt('--output') ?? path.join(__dirname, 'results'),
    save:      !flag('--no-save'),
    quiet:     flag('--quiet'),
    concurrency,
    noRag:         flag('--no-rag'),
    noThink:       flag('--no-think'),
    noFixtureGuidance: flag('--no-fixture-guidance'),
    allConditions: flag('--all-conditions'),
    models:        opt('--model'),
    ensembleVoting: flag('--ensemble-voting'),
    multiStageVoting: flag('--multi-stage-voting'),
    multiStageVoting3models: flag('--multi-stage-voting-3models'),
    multiStageVotingKimiQwen: flag('--multi-stage-voting-kimi-qwen'),
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function runCondition(
  noRag: boolean,
  noThink: boolean,
  opts: ReturnType<typeof parseArgs>,
  models: string[],
  fixtures: ReturnType<typeof FIXTURE_MAP.get>[],
): Promise<void> {
  const label = `${noRag ? 'norag' : 'rag'}-${noThink ? 'nothink' : 'think'}`;
  const config: ModelBenchmarkConfig = {
    ollamaHost: opts.host,
    models,
    presetId:   opts.presetId,
    fixtures:   fixtures as any,
    runsPerCombination: opts.runs,
    verbose:     false,   // suppress per-run output when running in parallel
    concurrency: opts.concurrency,
    noRag,
    noThink,
    noFixtureGuidance: opts.noFixtureGuidance,
  };

  console.log(`  [${label}] Starting…`);
  const t0 = Date.now();
  let results;
  try {
    results = await runBenchmark(config);
  } catch (err: any) {
    console.error(`  [${label}] Fatal error: ${err.message ?? err}`);
    return;
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  [${label}] Completed ${results.length} runs in ${elapsed}s`);

  printReport(results, models, opts.presetId);

  if (opts.save) {
    const jsonPath   = saveJson(results, opts.outputDir, label);
    const csvPath    = saveCsv(results, models, opts.outputDir, label);
    const reportPath = saveReport(results, models, opts.presetId, opts.outputDir, label);
    console.log(`  [${label}] JSON   saved → ${jsonPath}`);
    console.log(`  [${label}] CSV    saved → ${csvPath}`);
    console.log(`  [${label}] Report saved → ${reportPath}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const fixtures = opts.fixtureIds.map(id => FIXTURE_MAP.get(id)!);

  const requestedModels = opts.models
    ? opts.models.split(',').map((s: string) => s.trim())
    : null;
  const models = requestedModels
    ? ALL_MODELS.filter(m => requestedModels.some((r: string) => m.includes(r)))
    : ALL_MODELS;
  if (requestedModels && models.length === 0) {
    console.error(`No models matched: ${requestedModels.join(', ')}`);
    console.error(`Available: ${ALL_MODELS.join(', ')}`);
    process.exit(1);
  }
  if (requestedModels && !opts.quiet) {
    console.log(`  Models filtered to: ${models.map(shortName).join(', ')}`);
  }

  // Ensemble voting with all conditions
  if (opts.ensembleVoting && opts.allConditions) {
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel)) {
      console.error(`Error: Ensemble voting requires both ${kimiModel} and ${gptModel} in ALL_MODELS`);
      process.exit(1);
    }

    const conditions: Array<[boolean, boolean, string]> = [
      [true,  true,  'norag-nothink' ],
      [true,  false, 'norag-think'   ],
      [false, true,  'rag-nothink'   ],
      [false, false, 'rag-think'     ],
    ];

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — ENSEMBLE VOTING + ALL CONDITIONS mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} (recall) + ${gptModel} (precision)`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture × 4 conditions`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 2 * 4} LLM calls (both models × 4 conditions)`);
      console.log('');
      console.log('  All 4 conditions running simultaneously with ensemble voting:');
      console.log('    norag-nothink  |  norag-think  |  rag-nothink  |  rag-think');
      console.log('');
    }

    const t0 = Date.now();

    // Run all 4 conditions in parallel
    await Promise.all(
      conditions.map(async ([noRag, noThink, condLabel]) => {
        const config1: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [kimiModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const config2: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [gptModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const kimiResults = await runBenchmark(config1);
        const gptResults = await runBenchmark(config2);

        // Compute consensus
        const votedResults: ModelRunResult[] = [];
        for (const fixture of fixtures) {
          for (let run = 0; run < opts.runs; run++) {
            const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
            const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

            if (kimiResult && gptResult) {
              const votedResult = createVotedResult(
                kimiResult,
                gptResult,
                fixture,
                'ensemble-kimi+gpt-oss'
              );
              votedResults.push(votedResult);
            }
          }
        }

        // Save results for this condition
        if (opts.save) {
          const label = `ensemble-voting-${condLabel}`;
          const allModelIds = [kimiModel, gptModel, 'ensemble-kimi+gpt-oss'];
          saveJson(votedResults, opts.outputDir, label);
          saveCsv(votedResults, allModelIds, opts.outputDir, label);
          saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
        }
      })
    );

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  All 4 conditions with ensemble voting finished in ${elapsed}s total`);
    return;
  }

  // Multi-stage voting with all conditions
  if (opts.multiStageVoting && opts.allConditions) {
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel)) {
      console.error(`Error: Multi-stage voting requires both ${kimiModel} and ${gptModel} in ALL_MODELS`);
      process.exit(1);
    }

    const conditions: Array<[boolean, boolean, string]> = [
      [true,  true,  'norag-nothink' ],
      [true,  false, 'norag-think'   ],
      [false, true,  'rag-nothink'   ],
      [false, false, 'rag-think'     ],
    ];

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — MULTI-STAGE VOTING + ALL CONDITIONS mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} (recall) + ${gptModel} (precision)`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture × 4 conditions`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 2 * 4} LLM calls (both models × 4 conditions)`);
      console.log('');
      console.log('  Stage 1: Consensus voting (verified, 100% precision)');
      console.log('  Stage 2: Secondary review of rejected issues (review-recommended)');
      console.log('');
      console.log('  All 4 conditions running simultaneously with multi-stage voting:');
      console.log('    norag-nothink  |  norag-think  |  rag-nothink  |  rag-think');
      console.log('');
    }

    const t0 = Date.now();

    // Run all 4 conditions in parallel
    await Promise.all(
      conditions.map(async ([noRag, noThink, condLabel]) => {
        const config1: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [kimiModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const config2: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [gptModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const kimiResults = await runBenchmark(config1);
        const gptResults = await runBenchmark(config2);

        // Compute multi-stage voting
        const votedResults: ModelRunResult[] = [];
        for (const fixture of fixtures) {
          for (let run = 0; run < opts.runs; run++) {
            const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
            const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

            if (kimiResult && gptResult) {
              const votedResult = createMultiStageVotedResult(
                kimiResult,
                gptResult,
                fixture,
                'multi-stage-kimi+gpt-oss'
              );
              votedResults.push(votedResult);
            }
          }
        }

        // Save results for this condition
        if (opts.save) {
          const label = `multi-stage-voting-${condLabel}`;
          const allModelIds = [kimiModel, gptModel, 'multi-stage-kimi+gpt-oss'];
          saveJson(votedResults, opts.outputDir, label);
          saveCsv(votedResults, allModelIds, opts.outputDir, label);
          saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
        }
      })
    );

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  All 4 conditions with multi-stage voting finished in ${elapsed}s total`);
    return;
  }

  // Kimi+Qwen multi-stage voting with all conditions (testing alternative model pair - T42)
  if (opts.multiStageVotingKimiQwen && opts.allConditions) {
    const kimiModel = 'kimi-k2.5:cloud';
    const qwenModel = 'qwen3.5:397b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(qwenModel)) {
      console.error(`Error: Kimi+Qwen voting requires both ${kimiModel} and ${qwenModel} in ALL_MODELS`);
      process.exit(1);
    }

    const conditions: Array<[boolean, boolean, string]> = [
      [true,  true,  'norag-nothink' ],
      [true,  false, 'norag-think'   ],
      [false, true,  'rag-nothink'   ],
      [false, false, 'rag-think'     ],
    ];

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — KIMI+QWEN MULTI-STAGE VOTING + ALL CONDITIONS mode (T42)');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} (recall) + ${qwenModel} (balanced)`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture × 4 conditions`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 2 * 4} LLM calls (both models × 4 conditions)`);
      console.log('');
      console.log('  Stage 1: Consensus voting (kimi + qwen agreement)');
      console.log('  Stage 2: Secondary review of rejected issues');
      console.log('  Hypothesis: Qwen precision may improve over gpt-oss');
      console.log('');
      console.log('  All 4 conditions running simultaneously:');
      console.log('    norag-nothink  |  norag-think  |  rag-nothink  |  rag-think');
      console.log('');
    }

    const t0 = Date.now();

    // Run all 4 conditions in parallel
    await Promise.all(
      conditions.map(async ([noRag, noThink, condLabel]) => {
        const config1: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [kimiModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const config2: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [qwenModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const kimiResults = await runBenchmark(config1);
        const qwenResults = await runBenchmark(config2);

        // Compute multi-stage voting with kimi + qwen
        const votedResults: ModelRunResult[] = [];
        for (const fixture of fixtures) {
          for (let run = 0; run < opts.runs; run++) {
            const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
            const qwenResult = qwenResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

            if (kimiResult && qwenResult) {
              const votedResult = createMultiStageVotedResult(
                kimiResult,
                qwenResult,
                fixture,
                'multi-stage-kimi+qwen'
              );
              votedResults.push(votedResult);
            }
          }
        }

        // Save results for this condition
        if (opts.save) {
          const label = `multi-stage-kimi-qwen-${condLabel}`;
          const allModelIds = [kimiModel, qwenModel, 'multi-stage-kimi+qwen'];
          saveJson(votedResults, opts.outputDir, label);
          saveCsv(votedResults, allModelIds, opts.outputDir, label);
          saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
        }
      })
    );

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  All 4 conditions with kimi+qwen multi-stage voting finished in ${elapsed}s total`);
    return;
  }

  // 3-Model multi-stage voting with all conditions (kimi + gpt-oss + qwen)
  if (opts.multiStageVoting3models && opts.allConditions) {
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';
    const qwenModel = 'qwen3.5:397b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel) || !ALL_MODELS.includes(qwenModel)) {
      console.error(`Error: 3-model voting requires ${kimiModel}, ${gptModel}, and ${qwenModel} in ALL_MODELS`);
      process.exit(1);
    }

    const conditions: Array<[boolean, boolean, string]> = [
      [true,  true,  'norag-nothink' ],
      [true,  false, 'norag-think'   ],
      [false, true,  'rag-nothink'   ],
      [false, false, 'rag-think'     ],
    ];

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — 3-MODEL MULTI-STAGE VOTING + ALL CONDITIONS mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} + ${gptModel} + ${qwenModel}`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture × 4 conditions`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 3 * 4} LLM calls (3 models × 4 conditions)`);
      console.log('');
      console.log('  Stage 1: Majority voting (2 of 3 models must agree on concept)');
      console.log('  Stage 2: Secondary review of rejected issues');
      console.log('');
      console.log('  All 4 conditions running simultaneously with 3-model voting:');
      console.log('    norag-nothink  |  norag-think  |  rag-nothink  |  rag-think');
      console.log('');
    }

    const t0 = Date.now();

    // Run all 4 conditions in parallel
    await Promise.all(
      conditions.map(async ([noRag, noThink, condLabel]) => {
        const config1: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [kimiModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const config2: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [gptModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const config3: ModelBenchmarkConfig = {
          ollamaHost: opts.host,
          models: [qwenModel],
          presetId: opts.presetId,
          fixtures,
          runsPerCombination: opts.runs,
          verbose: !opts.quiet,
          concurrency: opts.concurrency,
          noRag,
          noThink,
        };

        const kimiResults = await runBenchmark(config1);
        const gptResults = await runBenchmark(config2);
        const qwenResults = await runBenchmark(config3);

        // Compute 3-model multi-stage voting
        const votedResults: ModelRunResult[] = [];
        for (const fixture of fixtures) {
          for (let run = 0; run < opts.runs; run++) {
            const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
            const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
            const qwenResult = qwenResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

            if (kimiResult && gptResult && qwenResult) {
              const votedResult = createThreeModelMultiStageVotedResult(
                kimiResult,
                gptResult,
                qwenResult,
                fixture,
                'multi-stage-3model-kimi+gpt+qwen'
              );
              votedResults.push(votedResult);
            }
          }
        }

        // Save results for this condition
        if (opts.save) {
          const label = `multi-stage-3model-voting-${condLabel}`;
          const allModelIds = [kimiModel, gptModel, qwenModel, 'multi-stage-3model-kimi+gpt+qwen'];
          saveJson(votedResults, opts.outputDir, label);
          saveCsv(votedResults, allModelIds, opts.outputDir, label);
          saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
        }
      })
    );

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  All 4 conditions with 3-model multi-stage voting finished in ${elapsed}s total`);
    return;
  }

  if (opts.allConditions) {
    // Run all 4 RAG×Think conditions simultaneously
    const conditions: Array<[boolean, boolean]> = [
      [true,  true ],  // norag-nothink
      [true,  false],  // norag-think
      [false, true ],  // rag-nothink
      [false, false],  // rag-think
    ];
    const totalCalls = models.length * fixtures.length * opts.runs * 4;
    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — ALL CONDITIONS mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${models.length}  →  ${models.map(shortName).join(', ')}`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per combination × 4 conditions`);
      console.log(`  Total:    ${totalCalls} LLM calls across all conditions`);
      console.log(`  Concurrency: ${opts.concurrency} fixtures in parallel per model per condition`);
      console.log('');
      console.log('  All 4 conditions running simultaneously:');
      console.log('    norag-nothink  |  norag-think  |  rag-nothink  |  rag-think');
      console.log('');
    }
    const t0 = Date.now();
    await Promise.all(
      conditions.map(([noRag, noThink]) => runCondition(noRag, noThink, opts, models, fixtures))
    );
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n  All conditions finished in ${elapsed}s total`);
    return;
  }

  // Ensemble voting path (single condition)
  if (opts.ensembleVoting) {
    // Run ensemble voting with kimi and gpt-oss
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel)) {
      console.error(`Error: Ensemble voting requires both ${kimiModel} and ${gptModel} in ALL_MODELS`);
      process.exit(1);
    }

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — ENSEMBLE VOTING mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} (recall) + ${gptModel} (precision)`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture`);
      console.log(`  Strategy: Keep only issues both models agree on`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 2} LLM calls (both models on same fixtures)`);
      console.log('');
    }

    const t0 = Date.now();

    // Run both models
    const config1: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [kimiModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    const config2: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [gptModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    if (!opts.quiet) console.log(`\n  Running ${kimiModel}…`);
    const kimiResults = await runBenchmark(config1);

    if (!opts.quiet) console.log(`\n  Running ${gptModel}…`);
    const gptResults = await runBenchmark(config2);

    // Compute consensus results
    if (!opts.quiet) console.log(`\n  Computing consensus votes…`);
    const votedResults: ModelRunResult[] = [];

    for (const fixture of fixtures) {
      for (let run = 0; run < opts.runs; run++) {
        const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
        const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

        if (kimiResult && gptResult) {
          const votedResult = createVotedResult(
            kimiResult,
            gptResult,
            fixture,
            'ensemble-kimi+gpt-oss'
          );
          votedResults.push(votedResult);
        }
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    if (!opts.quiet) console.log(`\n  Ensemble voting completed in ${elapsed}s`);

    // Report results
    const allModelIds = [kimiModel, gptModel, 'ensemble-kimi+gpt-oss'];
    printReport(votedResults, allModelIds, opts.presetId);

    if (opts.save) {
      const label = `ensemble-voting-${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}`;
      const jsonPath = saveJson(votedResults, opts.outputDir, label);
      const csvPath = saveCsv(votedResults, allModelIds, opts.outputDir, label);
      const reportPath = saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
      if (!opts.quiet) {
        console.log(`\n  JSON   saved → ${jsonPath}`);
        console.log(`  CSV    saved → ${csvPath}`);
        console.log(`  Report saved → ${reportPath}`);
      }
    }

    return;
  }

  // Multi-stage voting path (single condition)
  if (opts.multiStageVoting) {
    // Run multi-stage voting with kimi and gpt-oss
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel)) {
      console.error(`Error: Multi-stage voting requires both ${kimiModel} and ${gptModel} in ALL_MODELS`);
      process.exit(1);
    }

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — MULTI-STAGE VOTING mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} (recall) + ${gptModel} (precision)`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture`);
      console.log(`  Strategy: Stage 1 - Consensus (verified); Stage 2 - Secondary review (review-recommended)`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 2} LLM calls (both models on same fixtures)`);
      console.log('');
    }

    const t0 = Date.now();

    // Run both models
    const config1: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [kimiModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    const config2: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [gptModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    if (!opts.quiet) console.log(`\n  Running ${kimiModel}…`);
    const kimiResults = await runBenchmark(config1);

    if (!opts.quiet) console.log(`\n  Running ${gptModel}…`);
    const gptResults = await runBenchmark(config2);

    // Compute multi-stage voted results
    if (!opts.quiet) console.log(`\n  Computing multi-stage voting…`);
    if (!opts.quiet) console.log(`    Stage 1: Consensus issues (verified tier)…`);
    if (!opts.quiet) console.log(`    Stage 2: Secondary review of rejected issues (review-recommended tier)…`);
    const votedResults: ModelRunResult[] = [];

    for (const fixture of fixtures) {
      for (let run = 0; run < opts.runs; run++) {
        const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
        const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

        if (kimiResult && gptResult) {
          const votedResult = createMultiStageVotedResult(
            kimiResult,
            gptResult,
            fixture,
            'multi-stage-kimi+gpt-oss'
          );
          votedResults.push(votedResult);
        }
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    if (!opts.quiet) console.log(`\n  Multi-stage voting completed in ${elapsed}s`);

    // Report results
    const allModelIds = [kimiModel, gptModel, 'multi-stage-kimi+gpt-oss'];
    printReport(votedResults, allModelIds, opts.presetId);

    if (opts.save) {
      const label = `multi-stage-voting-${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}`;
      const jsonPath = saveJson(votedResults, opts.outputDir, label);
      const csvPath = saveCsv(votedResults, allModelIds, opts.outputDir, label);
      const reportPath = saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
      if (!opts.quiet) {
        console.log(`\n  JSON   saved → ${jsonPath}`);
        console.log(`  CSV    saved → ${csvPath}`);
        console.log(`  Report saved → ${reportPath}`);
      }
    }

    return;
  }

  // 3-Model multi-stage voting path (single condition)
  if (opts.multiStageVoting3models) {
    // Run 3-model multi-stage voting with kimi, gpt-oss, and qwen
    const kimiModel = 'kimi-k2.5:cloud';
    const gptModel = 'gpt-oss:120b-cloud';
    const qwenModel = 'qwen3.5:397b-cloud';

    if (!ALL_MODELS.includes(kimiModel) || !ALL_MODELS.includes(gptModel) || !ALL_MODELS.includes(qwenModel)) {
      console.error(`Error: 3-model voting requires ${kimiModel}, ${gptModel}, and ${qwenModel} in ALL_MODELS`);
      process.exit(1);
    }

    if (!opts.quiet) {
      console.log('');
      console.log('  Cloud-LLM-Preliminary — 3-MODEL MULTI-STAGE VOTING mode');
      console.log(`  Ollama:   ${opts.host}`);
      console.log(`  Models:   ${kimiModel} + ${gptModel} + ${qwenModel}`);
      console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
      console.log(`  Runs:     ${opts.runs} per fixture`);
      console.log(`  Strategy: Stage 1 - Majority voting (2of3); Stage 2 - Secondary review`);
      console.log(`  Total:    ~${fixtures.length * opts.runs * 3} LLM calls (3 models on same fixtures)`);
      console.log('');
    }

    const t0 = Date.now();

    // Run all 3 models
    const config1: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [kimiModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    const config2: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [gptModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    const config3: ModelBenchmarkConfig = {
      ollamaHost: opts.host,
      models: [qwenModel],
      presetId: opts.presetId,
      fixtures,
      runsPerCombination: opts.runs,
      verbose: !opts.quiet,
      concurrency: opts.concurrency,
      noRag: opts.noRag,
      noThink: opts.noThink,
    };

    if (!opts.quiet) console.log(`\n  Running ${kimiModel}…`);
    const kimiResults = await runBenchmark(config1);

    if (!opts.quiet) console.log(`\n  Running ${gptModel}…`);
    const gptResults = await runBenchmark(config2);

    if (!opts.quiet) console.log(`\n  Running ${qwenModel}…`);
    const qwenResults = await runBenchmark(config3);

    // Compute 3-model multi-stage voting
    if (!opts.quiet) console.log(`\n  Computing 3-model multi-stage voting…`);
    if (!opts.quiet) console.log(`    Stage 1: Majority voting (2 of 3 models must agree)…`);
    if (!opts.quiet) console.log(`    Stage 2: Secondary review of rejected issues…`);
    const votedResults: ModelRunResult[] = [];

    for (const fixture of fixtures) {
      for (let run = 0; run < opts.runs; run++) {
        const kimiResult = kimiResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
        const gptResult = gptResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);
        const qwenResult = qwenResults.find(r => r.fixtureId === fixture.fixtureId && r.runIndex === run);

        if (kimiResult && gptResult && qwenResult) {
          const votedResult = createThreeModelMultiStageVotedResult(
            kimiResult,
            gptResult,
            qwenResult,
            fixture,
            'multi-stage-3model-kimi+gpt+qwen'
          );
          votedResults.push(votedResult);
        }
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    if (!opts.quiet) console.log(`\n  3-model multi-stage voting completed in ${elapsed}s`);

    // Report results
    const allModelIds = [kimiModel, gptModel, qwenModel, 'multi-stage-3model-kimi+gpt+qwen'];
    printReport(votedResults, allModelIds, opts.presetId);

    if (opts.save) {
      const label = `multi-stage-3model-voting-${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}`;
      const jsonPath = saveJson(votedResults, opts.outputDir, label);
      const csvPath = saveCsv(votedResults, allModelIds, opts.outputDir, label);
      const reportPath = saveReport(votedResults, allModelIds, opts.presetId, opts.outputDir, label);
      if (!opts.quiet) {
        console.log(`\n  JSON   saved → ${jsonPath}`);
        console.log(`  CSV    saved → ${csvPath}`);
        console.log(`  Report saved → ${reportPath}`);
      }
    }

    return;
  }

  // Single-condition path (original behaviour)
  const totalCalls = models.length * fixtures.length * opts.runs;

  const config: ModelBenchmarkConfig = {
    ollamaHost: opts.host,
    models,
    presetId:   opts.presetId,
    fixtures,
    runsPerCombination: opts.runs,
    verbose: !opts.quiet,
    concurrency: opts.concurrency,
    noRag:       opts.noRag,
    noThink:     opts.noThink,
  };

  if (!opts.quiet) {
    const langLabel = opts.lang === 'all' ? 'all languages' : `${opts.lang} only`;
    console.log('');
    console.log('  Cloud-LLM-Preliminary — starting');
    console.log(`  Ollama:   ${opts.host}`);
    console.log(`  Preset:   ${opts.presetId}`);
    console.log(`  Language: ${langLabel}`);
    console.log(`  Models:   ${models.length}  →  ${models.map(shortName).join(', ')}`);
    console.log(`  Fixtures: ${opts.fixtureIds.length}  →  ${opts.fixtureIds.join(', ')}`);
    console.log(`  Runs:     ${opts.runs} per combination`);
    console.log(`  Total:    ${totalCalls} LLM calls`);
    console.log('');

    // Rough estimate: cloud models vary wildly; use a conservative 2 min/call,
    // divided by concurrency since fixtures run in parallel within each model.
    const estMins = Math.ceil((totalCalls * 2) / opts.concurrency);
    console.log(`  Concurrency: ${opts.concurrency} fixtures in parallel per model`);
    console.log(`  Estimated time: ~${estMins} min (varies significantly by model)`);
    console.log('');
    console.log('  Running… (Ctrl+C to abort)');
  }

  const t0 = Date.now();
  let results;
  try {
    results = await runBenchmark(config);
  } catch (err: any) {
    console.error('\nFatal error:', err.message ?? err);
    process.exit(1);
  }
  const elapsed = Date.now() - t0;

  if (!opts.quiet) {
    console.log(`  Completed ${results.length} runs in ${(elapsed / 1000).toFixed(1)}s`);
  }

  printReport(results, models, opts.presetId);

  if (opts.save) {
    const label = `${opts.noRag ? 'norag' : 'rag'}-${opts.noThink ? 'nothink' : 'think'}`;
    const jsonPath    = saveJson(results, opts.outputDir, label);
    const csvPath     = saveCsv(results, models, opts.outputDir, label);
    const reportPath  = saveReport(results, models, opts.presetId, opts.outputDir, label);
    console.log(`  JSON   saved → ${jsonPath}`);
    console.log(`  CSV    saved → ${csvPath}`);
    console.log(`  Report saved → ${reportPath}`);
    console.log('');
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
