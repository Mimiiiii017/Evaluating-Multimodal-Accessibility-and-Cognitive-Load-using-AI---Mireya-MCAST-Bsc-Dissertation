/**
 * smoke-test.ts — offline sanity checks for the LLM benchmark (no Ollama needed)
 * Run: npx ts-node smoke-test.ts
 */

import { ALL_FIXTURES, FIXTURE_MAP } from '../fixtures/ground-truth';
import { aggregateByModel, applyCompositeScores, shortName } from '../benchmark/benchmark';
import type { ModelRunResult } from '../benchmark/benchmark';

let pass = 0;
let fail = 0;

function assert(cond: boolean, msg: string): void {
  if (cond) { console.log(`  ✓ ${msg}`); pass++; }
  else       { console.error(`  ✗ FAIL: ${msg}`); fail++; }
}

// ─── shortName helper ─────────────────────────────────────────────────────
console.log('\n── shortName helper ───────────────────────────────────────');
assert(shortName('qwen3-coder-next:cloud') === 'qwen3-coder-next (~?B)',       'appends size label for known cloud model');
assert(shortName('gemma3:27b-cloud')       === 'gemma3:27b (~27B)',            'appends size label with known B count');
assert(shortName('smollm:latest')          === 'smollm',                       'strips :latest suffix, no label for unknown');
assert(shortName('deepseek-r1:1.5b')       === 'deepseek-r1:1.5b',            'keeps non-cloud tag, no label for unknown');

// ─── Shared ground truth accessible ──────────────────────────────────────
console.log('\n── Shared ground truth ────────────────────────────────────');
assert(ALL_FIXTURES.length === 41, `41 fixtures reachable (got ${ALL_FIXTURES.length})`);
assert(FIXTURE_MAP.has('html-low'),  'html-low fixture accessible');
assert(FIXTURE_MAP.has('tsx-clean'), 'tsx-clean fixture accessible');

// ─── aggregateByModel - empty (all errors) ────────────────────────────────
console.log('\n── aggregateByModel: all-error run ────────────────────────');
const errResults: ModelRunResult[] = [{
  modelId: 'model-a',
  fixtureId: 'html-issues',
  presetId: 'balanced',
  runIndex: 0,
  issuesFound: [],
  tp: 0, tn: 10, fn: 5, fp: 0,
  precision: 0, recall: 0, specificity: 1, npv: 0.667,
  f1: 0, accuracy: 0.667, balancedAccuracy: 0.5, mcc: 0,
  responseTimeMs: 0,
  errorOccurred: true,
  errorMessage: 'Connection refused',
  rawResponse: '',
  missedIds: [],
  fpTitles: [],
}];
const errStats = aggregateByModel(errResults, 'model-a', 'balanced');
assert(errStats.errorCount === 1, 'error count = 1');
assert(errStats.avgF1 === 0,      'f1 = 0 on all-error run');

// ─── aggregateByModel - normal run ────────────────────────────────────────
console.log('\n── aggregateByModel: normal run ───────────────────────────');
const goodResults: ModelRunResult[] = [
  { modelId: 'model-b', fixtureId: 'html-issues', presetId: 'balanced', runIndex: 0,
    issuesFound: [], tp: 8, tn: 5, fn: 3, fp: 0,
    precision: 1.0, recall: 0.727, specificity: 1.0, npv: 0.625,
    f1: 0.842, accuracy: 0.813, balancedAccuracy: 0.864, mcc: 0.726,
    responseTimeMs: 30000, errorOccurred: false, rawResponse: '', missedIds: ['x'], fpTitles: [] },
  { modelId: 'model-b', fixtureId: 'tsx-issues',  presetId: 'balanced', runIndex: 0,
    issuesFound: [], tp: 6, tn: 5, fn: 0, fp: 0,
    precision: 1.0, recall: 1.0, specificity: 1.0, npv: 1.0,
    f1: 1.0, accuracy: 1.0, balancedAccuracy: 1.0, mcc: 1.0,
    responseTimeMs: 15000, errorOccurred: false, rawResponse: '', missedIds: [], fpTitles: [] },
];
const good = aggregateByModel(goodResults, 'model-b', 'balanced');
assert(good.totalTP === 14,                         'TP = 14');
assert(good.totalFN === 3,                          'FN = 3');
assert(good.totalFP === 0,                          'FP = 0');
assert(Math.abs(good.avgF1 - 0.921) < 0.001,        `avgF1 ≈ 0.921 (got ${good.avgF1.toFixed(3)})`);
assert(good.avgResponseMs === 22500,                 'avgResponseMs = 22500');

// ─── applyCompositeScores ─────────────────────────────────────────────────
console.log('\n── applyCompositeScores ───────────────────────────────────');
const rawStats = [
  { ...good,       modelId: 'fast-model',  avgF1: 0.9, avgResponseMs: 10000, compositeScore: 0 },
  { ...good,       modelId: 'slow-model',  avgF1: 0.9, avgResponseMs: 90000, compositeScore: 0 },
  { ...good,       modelId: 'equal-model', avgF1: 0.5, avgResponseMs: 10000, compositeScore: 0 },
];
const scored = applyCompositeScores(rawStats);

const fastScore  = scored.find(s => s.modelId === 'fast-model')!.compositeScore;
const slowScore  = scored.find(s => s.modelId === 'slow-model')!.compositeScore;
const equalScore = scored.find(s => s.modelId === 'equal-model')!.compositeScore;

assert(fastScore > slowScore,   'faster model scores higher than slower with same F1');
assert(fastScore === 0.8 * 0.9 + 0.2 * 1.0, `fast-model composite = ${fastScore.toFixed(3)} (expected ${(0.8*0.9+0.2*1).toFixed(3)})`);
assert(slowScore === 0.8 * 0.9 + 0.2 * 0.0, `slow-model composite = ${slowScore.toFixed(3)} (expected ${(0.8*0.9).toFixed(3)})`);
assert(fastScore > equalScore,  'higher F1 scores higher despite same speed');

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
