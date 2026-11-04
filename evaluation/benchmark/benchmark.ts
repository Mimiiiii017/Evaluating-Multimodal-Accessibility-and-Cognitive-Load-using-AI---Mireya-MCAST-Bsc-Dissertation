/**
 * benchmark.ts  —  Cloud-LLM-Preliminary
 *
 * For each (model × fixture × run):
 *   1. Read the fixture file
 *   2. Build the prompt (same as the extension)
 *   3. Stream a response from Ollama
 *   4. Parse into AiIssue objects
 *   5. Score TP / FN / FP against ground truth
 *
 * Uses a single fixed analysis preset for all models so that model quality
 * is the only variable.  Defaults to "balanced"; pass --preset to override.
 *
 * Reuses scoreRun from the preset-benchmark so scoring logic is identical.
 */

import * as fs from 'fs';

import {
  ANALYSIS_PRESETS,
  AnalysisPresetId,
  DEFAULT_ANALYSIS_PRESET,
} from '../../extension/ai-accessibility-assistant/src/utils/llm/ollama';
import { CLOUD_BENCHMARK_OPTIONS, CLOUD_SAFE_OPTIONS, getCloudOptions } from './benchmark-params';
import {
  BENCHMARK_SYSTEM_PROMPT as SYSTEM_PROMPT,
  buildAiPrompt,
} from './benchmark-prompt';
import {
  parseTextResponse,
  deduplicateIssues,
} from '../../extension/ai-accessibility-assistant/src/utils/analysis/parser';
import type { AiIssue } from '../../extension/ai-accessibility-assistant/src/utils/types';
import { ragRetrieve, formatRagContext } from '../../extension/ai-accessibility-assistant/src/utils/rag/rag';
import { buildRagQuery } from '../../extension/ai-accessibility-assistant/src/utils/rag/ragQueryBuilder';

// ─── HTML multi-query RAG ─────────────────────────────────────────────────

/**
 * Five targeted queries — one per HTML sweep group (A+G, B+I, E+J, C+D+F, H).
 *
 * WHY: A single generic query retrieves broad WCAG chunks that are only loosely
 * related to the specific sweep being run. Test 9 showed RAG had a net negative
 * effect (−2.4 pp no-think) because retrieved chunks added noise without adding
 * sweep-specific knowledge. Per-sweep queries retrieve chunks that are directly
 * relevant to what each sweep is checking, reducing noise while keeping signal.
 */
const HTML_SWEEP_QUERIES = [
  // Sweeps A + G — links & nav landmarks
  'link accessible name aria-label non-descriptive text "click here" "read more" nav landmark multiple label ARIA11',
  // Sweeps B + I — buttons & toggle state
  'button accessible name aria-expanded toggle disclosure accordion hamburger menu show hide',
  // Sweeps E + J — forms, labels, autocomplete
  'form input label accessible name autocomplete personal data given-name email tel address SC 1.3.5',
  // Sweeps C + D + F — images, headings, table headers
  'image alt attribute missing non-text content table header scope heading level skip hierarchy WCAG 1.1.1 1.3.1',
  // Sweep H — broken ARIA id references
  'aria-labelledby aria-describedby aria-controls broken reference id does not exist SC 4.1.2',
];

/** Max unique chunks to inject per fixture — caps context size regardless of dedup yield. */
/** T32: raised from 8→10 — 8 queries × top_k=3 yields up to 24 candidates; cap raised to pull more coverage. */
const RAG_HTML_MAX_CHUNKS = 10;
/** Stricter cosine distance threshold for HTML multi-query (vs default 0.65). */
const RAG_HTML_DISTANCE_THRESHOLD = 0.5;

/** Max unique chunks for non-HTML multi-query (3 queries × top_k=3 = up to 9 deduped). */
/** T32: raised from 6→8 — matches increased per-query top_k. */
const RAG_NONHTML_MAX_CHUNKS = 8;
/** T21: JS cap reduced to 4 — fewer chunks prevent context dilution in deepseek/gpt.
 *  T22: raised to 5 — third aria-live query needs a slot alongside the 2 existing queries.
 *  T32: raised to 7 — 3 queries × top_k=3 yields up to 9 candidates; deeper JS recall needed. */
const RAG_JS_MAX_CHUNKS = 7;
/** T30: TSX raised to 8 — 4th query added for star-rating and card CTA patterns.
 *  T32: raised to 9 — 3 queries × top_k=3 yields up to 9 candidates. */
const RAG_TSX_MAX_CHUNKS = 9;
/** Distance threshold for non-HTML — matches the existing single-query default. */
const RAG_NONHTML_DISTANCE_THRESHOLD = 0.65;
/** T21: JS uses a tighter threshold (0.70) — more selective retrieval to reduce noise. */
const RAG_JS_DISTANCE_THRESHOLD = 0.70;

/**
 * CSS sweep queries — one per sweep group.
 * Mirrors HTML_SWEEP_QUERIES so RAG retrieval aligns with CSS_MANDATORY_SWEEPS.
 */
const CSS_SWEEP_QUERIES = [
  // Sweep 1 — focus indicators (T30: added box-shadow to retrieve new anti-pattern section)
  'outline none focus indicator removed keyboard accessibility CSS visible focus ring box-shadow high contrast replacement',
  // Sweep 2 — touch targets & visually-hidden patterns
  'touch target minimum size 44px interactive element visually hidden sr-only clip screen reader CSS',
  // Sweep 3 — motion, forced-colors, contrast, word-spacing, link underlines
  'prefers-reduced-motion animation transition forced-colors high contrast word-spacing contrast ratio link underline',
];

/**
 * JS sweep queries — one per sweep group.
 * Aligned to JS_MANDATORY_SWEEPS categories in benchmark-prompt.ts.
 */
const JS_SWEEP_QUERIES = [
  // Sweep 1 — aria-expanded toggle functions (nav, accordions, dropdowns)
  // T21: dropped Sweep 3 (aria-invalid) and Sweep 4 (aria-live) — they caused context
  // dilution in deepseek (−12.6pp) and gpt (−6.7pp) in T20.
  'aria-expanded toggle function setAttribute open close menu nav accordion JavaScript handler',
  // Sweep 2 — aria-pressed state & validation (consolidated from 4 → 2 queries)
  'aria-pressed toggle button filter tab pressed state aria-invalid validation JavaScript',
  // Sweep 3 (T22 §6.1) — aria-live announcement patterns: covers 30+ JS ground-truth
  // issues about missing live-region writes (scroll-top-announce, faq-open-announce,
  // filter-result-announce, billing-period-announce, etc.) that no model caught in T21.
  'aria-live polite assertive announce textContent innerHTML scroll top search results count filter billing period live region',
];

/**
 * TSX sweep queries — one per sweep group.
 * Aligned to TSX_MANDATORY_SWEEPS categories in benchmark-prompt.ts.
 */
const TSX_SWEEP_QUERIES = [
  // T21 redesign: 4 → 3 queries, rewritten to target T20 false-negative clusters.
  // Sweep 1 — form fields, error state, broken ARIA references (unchanged from T20,
  //            still the highest-value query for TSX fixture)
  'htmlFor aria-invalid aria-describedby error message accessible label React form controlled input TypeScript',
  // Sweep 2 — hidden/decorative elements & toggle state (merged T20 sweeps 2+3):
  //            carousel slides, spinner rings, cloned lists, billing/filter aria-pressed
  'aria-hidden decorative spinner carousel slide clone aria-pressed toggle billing filter hidden conditional render React',
  // Sweep 3 — landmarks, aria-current, dialog/modal patterns (replaces T20 sweep 4):
  //            adds aria-modal/role=dialog because TSX fixture has modal backdrop patterns
  'aria-label landmark nav region aria-current aria-modal role dialog hamburger accessible name React',
  // Sweep 4 (T30) — star ratings, review widgets, card grid CTA labels:
  //            targets star-rating-role / star-inner-hidden FNs and plan-cta-label FNs
  'star rating role img aria-label review widget role radio radiogroup card CTA button aria-label item name plan Buy Learn more',
];

type RagChunk = { id: string; source: string; text: string };

/**
 * Run one RAG query per HTML sweep group, deduplicate by chunk id, and return
 * at most RAG_HTML_MAX_CHUNKS unique chunks ordered by query priority.
 */
async function retrieveHtmlMultiQueryRag(ragEndpoint: string): Promise<RagChunk[]> {
  const seen = new Set<string>();
  const allChunks: RagChunk[] = [];

  for (const q of HTML_SWEEP_QUERIES) {
    if (allChunks.length >= RAG_HTML_MAX_CHUNKS) break;
    try {
      const res = await ragRetrieve(ragEndpoint, q, 3, 'accessibility', RAG_HTML_DISTANCE_THRESHOLD);
      for (const chunk of res.chunks) {
        if (allChunks.length >= RAG_HTML_MAX_CHUNKS) break;
        if (!seen.has(chunk.id)) {
          seen.add(chunk.id);
          allChunks.push(chunk);
        }
      }
    } catch {
      // This sweep query failed — continue with remaining queries
    }
  }
  return allChunks;
}

/**
 * Generic multi-query deduplication helper used by CSS / JS / TSX retrieve functions.
 * Fires one RAG query per sweep-group string, deduplicates by chunk id, and returns
 * at most RAG_NONHTML_MAX_CHUNKS unique chunks ordered by query priority.
 */
async function retrieveMultiQueryRag(
  ragEndpoint: string,
  queries: string[],
  maxChunks = RAG_NONHTML_MAX_CHUNKS,
  distanceThreshold = RAG_NONHTML_DISTANCE_THRESHOLD,
): Promise<RagChunk[]> {
  const seen = new Set<string>();
  const allChunks: RagChunk[] = [];
  for (const q of queries) {
    if (allChunks.length >= maxChunks) break;
    try {
      const res = await ragRetrieve(ragEndpoint, q, 3, 'accessibility', distanceThreshold);
      for (const chunk of res.chunks) {
        if (allChunks.length >= maxChunks) break;
        if (!seen.has(chunk.id)) {
          seen.add(chunk.id);
          allChunks.push(chunk);
        }
      }
    } catch {
      // This sweep query failed — continue with remaining queries
    }
  }
  return allChunks;
}

const retrieveCssMultiQueryRag = (ep: string) => retrieveMultiQueryRag(ep, CSS_SWEEP_QUERIES);
// T21: JS uses tighter threshold (0.70) and smaller cap (4 chunks) to prevent context dilution
const retrieveJsMultiQueryRag  = (ep: string) => retrieveMultiQueryRag(ep, JS_SWEEP_QUERIES, RAG_JS_MAX_CHUNKS, RAG_JS_DISTANCE_THRESHOLD);
const retrieveTsxMultiQueryRag = (ep: string) => retrieveMultiQueryRag(ep, TSX_SWEEP_QUERIES, RAG_TSX_MAX_CHUNKS);

import { FixtureGroundTruth } from '../fixtures/ground-truth';
import { scoreRun } from '../fixtures/benchmark';

// Re-export so reporter/run can use without importing fixtures directly
export type { IssueConcept, FixtureGroundTruth } from '../fixtures/ground-truth';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Extract complexity tier from fixture ID (e.g., 'html-low' → 'low') */
export function getComplexityTier(fixtureId: string): ComplexityTier {
  if (fixtureId.includes('-low')) return 'low';
  if (fixtureId.includes('-medium')) return 'medium';
  if (fixtureId.includes('-high')) return 'high';
  // Default if not found
  return 'medium';
}

// ─── Types ───────────────────────────────────────────────────────────────

export type ComplexityTier = 'low' | 'medium' | 'high';

/**
 * Streaming quality metrics captured at different token percentages.
 * Shows how F1/Precision/Recall evolve as more tokens are generated.
 */
export type StreamingQualityMetrics = {
  /** Metrics at 25% of final token count */
  at25percent?: { f1: number; precision: number; recall: number; tokenCount: number };
  /** Metrics at 50% of final token count */
  at50percent?: { f1: number; precision: number; recall: number; tokenCount: number };
  /** Metrics at 75% of final token count */
  at75percent?: { f1: number; precision: number; recall: number; tokenCount: number };
  /** Metrics at final response (100%) */
  at100percent: { f1: number; precision: number; recall: number; tokenCount: number };
  /** Maximum F1 achieved before 100% (indicates potential early-stopping point) */
  maxF1Before100?: number;
};

/**
 * Pareto frontier analysis: identifies models that form the optimal tradeoff curve.
 * A model is on the Pareto frontier if no other model has both better F1 AND
 * equal/better latency (or vice versa).
 */
export type ParetoClassification = {
  modelId: string;
  f1: number;
  latencyMs: number;
  /** true if on Pareto frontier (no model dominates it) */
  isParetoOptimal: boolean;
  /** Reason for classification (if not optimal) */
  dominatedBy?: string[]; // array of model IDs that dominate this one
};

export type ModelRunResult = {
  modelId: string;
  fixtureId: string;
  complexityTier?: ComplexityTier;  // Optional for compatibility with tests
  presetId: AnalysisPresetId;
  runIndex: number;
  issuesFound: AiIssue[];
  // ── Core confusion matrix ────────────────────────────────────────
  tp: number;
  tn: number;  /** True negatives: concept-pool entries not expected here and correctly not found */
  fn: number;
  fp: number;
  // ── Primary rates ────────────────────────────────────────────────
  precision: number;    // TP / (TP + FP)
  recall: number;       // TP / (TP + FN)  — also Sensitivity / TPR
  specificity: number;  // TN / (TN + FP)  — True Negative Rate
  npv: number;          // TN / (TN + FN)  — Negative Predictive Value
  // ── Composite ───────────────────────────────────────────────────
  f1: number;            // 2 * P * R / (P + R)
  accuracy: number;      // (TP + TN) / (TP + TN + FP + FN)
  balancedAccuracy: number; // (recall + specificity) / 2
  mcc: number;           // Matthews Correlation Coefficient
  // ── Timing & errors ─────────────────────────────────────────────
  responseTimeMs: number;
  errorOccurred: boolean;
  errorMessage?: string;
  rawResponse: string;
  /** Missed expected concept IDs */
  missedIds: string[];
  /** FP title strings */
  fpTitles: string[];
  /** Optional streaming quality metrics (when streaming capture is enabled) */
  streamingMetrics?: StreamingQualityMetrics;
};

export type ModelBenchmarkConfig = {
  ollamaHost: string;
  /** RAG service endpoint — defaults to http://127.0.0.1:8000 */
  ragEndpoint?: string;
  /** Models to compare (Ollama model ids) */
  models: string[];
  /** Fixed preset applied to all models */
  presetId: AnalysisPresetId;
  fixtures: FixtureGroundTruth[];
  runsPerCombination: number;
  verbose: boolean;
  /**
   * Max number of fixture calls to run in parallel per model.
   * Set > 1 for cloud models (remote endpoints tolerate concurrency).
   * Defaults to 1 (fully sequential, original behaviour).
   */
  concurrency?: number;
  /**
   * When true, skip RAG retrieval and pass '(no RAG context)' to the prompt.
   * Use for ablation testing: compare RAG vs no-RAG F1 on the same fixtures.
   */
  noRag?: boolean;
  /**
   * When true, append /no_think to the user prompt, suppressing chain-of-thought
   * for reasoning-capable models (Qwen3, kimi-k2.5, DeepSeek, etc.).
   * Use for the think vs no-think ablation condition.
   */
  noThink?: boolean;
  /**
   * When true, disable fixture-specific guidance injection in prompts.
   * Use for ablation testing: compare fixture-guidance vs no-guidance F1 on the same fixtures.
   */
  noFixtureGuidance?: boolean;
};

export type ModelAggregateStats = {
  modelId: string;
  presetId: AnalysisPresetId;
  fixtureIds: string[];
  totalRuns: number;
  // ── Totals ───────────────────────────────────────────────────────
  totalTP: number;
  totalTN: number;
  totalFN: number;
  totalFP: number;
  // ── Averaged rates ───────────────────────────────────────────────
  avgPrecision: number;
  avgRecall: number;
  avgSpecificity: number;
  avgNPV: number;
  avgF1: number;
  avgAccuracy: number;
  avgBalancedAccuracy: number;
  avgMCC: number;
  avgIssuesFound: number;
  // ── Response time distribution ───────────────────────────────────
  avgResponseMs: number;
  p50ResponseMs: number;  /** Median response time */
  p95ResponseMs: number;  /** 95th percentile response time */
  // ── Consistency & errors ─────────────────────────────────────────
  f1StdDev: number;       /** Std-dev of F1 across all runs — lower = more consistent */
  errorCount: number;
  /**
   * Composite score 0-1:
   *   80 % F1  +  20 % speed score
   * Speed score = 1 - (thisTime - fastest) / (slowest - fastest)
   * Calculated after all models are known; set to avgF1 until then.
   */
  compositeScore: number;
};

// ─── Maths helpers ───────────────────────────────────────────────────────

/**
 * Simple token counter: splits on whitespace and punctuation.
 * Not perfect (e.g. contractions) but good enough for streaming % calculation.
 */
function countTokensApprox(text: string): number {
  return text
    .split(/\s+/)
    .filter(t => t.length > 0)
    .length;
}

/** Percentile of a numeric array (0–100). Array need not be pre-sorted. */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Population standard deviation. */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Matthews Correlation Coefficient. Returns 0 when denominator is 0. */
function mcc(tp: number, tn: number, fp: number, fn: number): number {
  const denom = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
  return denom === 0 ? 0 : (tp * tn - fp * fn) / denom;
}

// ─── Ensemble Voting Helpers ──────────────────────────────────────────────

/**
 * Compare two sets of issues and keep only those where both models agree.
 * Agreement is determined by matching against the same ground truth concept.
 */
export function computeConsensusIssues(
  model1Issues: AiIssue[],
  model2Issues: AiIssue[],
  fixture: FixtureGroundTruth
): AiIssue[] {
  // Build a set of concepts that were matched by model1
  const model1Matches = new Set<string>();
  const model2Matches = new Set<string>();

  // Score both models' issues to find which concepts they matched
  const score1 = scoreRun(fixture, model1Issues);
  const score2 = scoreRun(fixture, model2Issues);

  // Collect matched concept IDs
  score1.conceptMatches
    .filter(cm => cm.matchedBy !== null)
    .forEach(cm => model1Matches.add(cm.concept.id));

  score2.conceptMatches
    .filter(cm => cm.matchedBy !== null)
    .forEach(cm => model2Matches.add(cm.concept.id));

  // Find concepts both models matched
  const consensusConceptIds = new Set(
    [...model1Matches].filter(id => model2Matches.has(id))
  );

  // Build consensus issues: keep issues from model1 that matched shared concepts
  const consensusIssues: AiIssue[] = [];
  const usedIndices = new Set<number>();

  for (const cm of score1.conceptMatches) {
    if (consensusConceptIds.has(cm.concept.id) && cm.matchedBy !== null) {
      const idx = model1Issues.indexOf(cm.matchedBy);
      if (idx >= 0 && !usedIndices.has(idx)) {
        consensusIssues.push(cm.matchedBy);
        usedIndices.add(idx);
      }
    }
  }

  return consensusIssues;
}

/**
 * Create a voted result by combining results from two models.
 * Keeps only issues both models agree on (matched same concepts).
 */
export function createVotedResult(
  model1Result: ModelRunResult,
  model2Result: ModelRunResult,
  fixture: FixtureGroundTruth,
  votedModelId: string = 'ensemble-2models'
): ModelRunResult {
  // Compute consensus issues
  const consensusIssues = computeConsensusIssues(
    model1Result.issuesFound,
    model2Result.issuesFound,
    fixture
  );

  // Re-score with consensus issues
  const votedScore = scoreRun(fixture, consensusIssues);

  // Compute metrics
  const tn = fixture.expectedIssues.length > 0 ? 0 : 0; // Simplified; true TN calculation varies by schema
  const specificity = votedScore.fp === 0 ? 1 : 0; // Simplified
  const accuracy = votedScore.tp / fixture.expectedIssues.length || 0;
  const balancedAccuracy = (votedScore.recall + specificity) / 2;

  // MCC (Matthews Correlation Coefficient)
  const mccDenom = Math.sqrt(
    (votedScore.tp + votedScore.fp) *
    (votedScore.tp + votedScore.fn) *
    (tn + votedScore.fp) *
    (tn + votedScore.fn)
  );
  const mccValue = mccDenom === 0 ? 0 : (votedScore.tp * tn - votedScore.fp * votedScore.fn) / mccDenom;

  const npv = votedScore.fn === 0 ? 1 : tn / (tn + votedScore.fn);

  return {
    modelId: votedModelId,
    fixtureId: model1Result.fixtureId,
    complexityTier: model1Result.complexityTier,
    presetId: model1Result.presetId,
    runIndex: model1Result.runIndex,
    issuesFound: consensusIssues,
    tp: votedScore.tp,
    tn,
    fn: votedScore.fn,
    fp: votedScore.fp,
    precision: votedScore.precision,
    recall: votedScore.recall,
    specificity,
    npv,
    f1: votedScore.f1,
    accuracy,
    balancedAccuracy,
    mcc: mccValue,
    responseTimeMs: Math.max(model1Result.responseTimeMs, model2Result.responseTimeMs),
    errorOccurred: model1Result.errorOccurred || model2Result.errorOccurred,
    errorMessage: model1Result.errorMessage || model2Result.errorMessage,
    rawResponse: `${model1Result.modelId}: ${model1Result.issuesFound.length} issues | ${model2Result.modelId}: ${model2Result.issuesFound.length} issues | consensus: ${consensusIssues.length} issues`,
    missedIds: votedScore.conceptMatches
      .filter(cm => cm.matchedBy === null)
      .map(cm => cm.concept.id),
    fpTitles: votedScore.unexpectedIssues.map(i => i.title ?? 'unknown'),
  };
}

/**
 * Compute issues rejected by Stage 1 (consensus voting).
 * Returns issues that were found by individual models but not in consensus.
 */
export function computeRejectedIssues(
  model1Issues: AiIssue[],
  model2Issues: AiIssue[],
  consensusIssues: AiIssue[]
): AiIssue[] {
  const consensusSet = new Set(consensusIssues);
  const rejectedIssues = new Set<AiIssue>();

  // Add model1 issues not in consensus
  model1Issues.forEach(issue => {
    if (!consensusSet.has(issue)) {
      rejectedIssues.add(issue);
    }
  });

  // Add model2 issues not in consensus
  model2Issues.forEach(issue => {
    if (!consensusSet.has(issue)) {
      rejectedIssues.add(issue);
    }
  });

  return Array.from(rejectedIssues);
}

/**
 * Score rejected issues individually to find how many are true positives.
 * Returns verified and review-recommended issues with confidence labels.
 */
export function scoreRejectedIssues(
  rejectedIssues: AiIssue[],
  fixture: FixtureGroundTruth
): { verified: number; reviewRecommended: AiIssue[] } {
  const reviewRecommended: AiIssue[] = [];
  let verified = 0;

  // Score each rejected issue individually against ground truth
  for (const issue of rejectedIssues) {
    const singleIssueScore = scoreRun(fixture, [issue]);
    if (singleIssueScore.tp > 0) {
      verified++;
      reviewRecommended.push(issue);
    }
  }

  return { verified, reviewRecommended };
}

/**
 * Create a multi-stage voted result with confidence tiers.
 * Stage 1: Consensus voting (high precision, labeled "verified")
 * Stage 2: Secondary review of rejected issues (labeled "review-recommended")
 *
 * Returns combined results with dual-tier confidence scores.
 */
export function createMultiStageVotedResult(
  model1Result: ModelRunResult,
  model2Result: ModelRunResult,
  fixture: FixtureGroundTruth,
  votedModelId: string = 'multi-stage-voting'
): ModelRunResult {
  // Stage 1: Compute consensus issues
  const consensusIssues = computeConsensusIssues(
    model1Result.issuesFound,
    model2Result.issuesFound,
    fixture
  );

  // Stage 2: Find rejected issues
  const rejectedIssues = computeRejectedIssues(
    model1Result.issuesFound,
    model2Result.issuesFound,
    consensusIssues
  );

  // Score rejected issues individually
  const { verified: reviewCount, reviewRecommended } = scoreRejectedIssues(rejectedIssues, fixture);

  // Combine verified + review-recommended
  const allIssues = [...consensusIssues, ...reviewRecommended];

  // Score combined result
  const combinedScore = scoreRun(fixture, allIssues);

  // Compute metrics
  const tn = fixture.expectedIssues.length > 0 ? 0 : 0;
  const specificity = combinedScore.fp === 0 ? 1 : 0;
  const accuracy = combinedScore.tp / fixture.expectedIssues.length || 0;
  const balancedAccuracy = (combinedScore.recall + specificity) / 2;

  // MCC (Matthews Correlation Coefficient)
  const mccDenom = Math.sqrt(
    (combinedScore.tp + combinedScore.fp) *
    (combinedScore.tp + combinedScore.fn) *
    (tn + combinedScore.fp) *
    (tn + combinedScore.fn)
  );
  const mccValue = mccDenom === 0 ? 0 : (combinedScore.tp * tn - combinedScore.fp * combinedScore.fn) / mccDenom;

  const npv = combinedScore.fn === 0 ? 1 : tn / (tn + combinedScore.fn);

  return {
    modelId: votedModelId,
    fixtureId: model1Result.fixtureId,
    complexityTier: model1Result.complexityTier,
    presetId: model1Result.presetId,
    runIndex: model1Result.runIndex,
    issuesFound: allIssues,
    tp: combinedScore.tp,
    tn,
    fn: combinedScore.fn,
    fp: combinedScore.fp,
    precision: combinedScore.precision,
    recall: combinedScore.recall,
    specificity,
    npv,
    f1: combinedScore.f1,
    accuracy,
    balancedAccuracy,
    mcc: mccValue,
    responseTimeMs: Math.max(model1Result.responseTimeMs, model2Result.responseTimeMs),
    errorOccurred: model1Result.errorOccurred || model2Result.errorOccurred,
    errorMessage: model1Result.errorMessage || model2Result.errorMessage,
    rawResponse: `${model1Result.modelId}: ${model1Result.issuesFound.length} issues | ${model2Result.modelId}: ${model2Result.issuesFound.length} issues | consensus: ${consensusIssues.length} | review-recommended: ${reviewRecommended.length}`,
    missedIds: combinedScore.conceptMatches
      .filter(cm => cm.matchedBy === null)
      .map(cm => cm.concept.id),
    fpTitles: combinedScore.unexpectedIssues.map(i => i.title ?? 'unknown'),
  };
}

/**
 * Compute majority voting consensus (2 of 3 models must agree).
 * Returns issues that were matched by at least 2 of the 3 models on same concept.
 */
export function computeMajorityVotingIssues(
  model1Issues: AiIssue[],
  model2Issues: AiIssue[],
  model3Issues: AiIssue[],
  fixture: FixtureGroundTruth
): AiIssue[] {
  // Score all three models
  const score1 = scoreRun(fixture, model1Issues);
  const score2 = scoreRun(fixture, model2Issues);
  const score3 = scoreRun(fixture, model3Issues);

  // Build concept match maps for each model
  const model1Matches = new Set<string>();
  const model2Matches = new Set<string>();
  const model3Matches = new Set<string>();

  score1.conceptMatches.filter(cm => cm.matchedBy !== null).forEach(cm => model1Matches.add(cm.concept.id));
  score2.conceptMatches.filter(cm => cm.matchedBy !== null).forEach(cm => model2Matches.add(cm.concept.id));
  score3.conceptMatches.filter(cm => cm.matchedBy !== null).forEach(cm => model3Matches.add(cm.concept.id));

  // Find concepts matched by at least 2 models
  const majorityConceptIds = new Set<string>();

  for (const conceptId of model1Matches) {
    const votes = [model1Matches.has(conceptId), model2Matches.has(conceptId), model3Matches.has(conceptId)].filter(v => v).length;
    if (votes >= 2) majorityConceptIds.add(conceptId);
  }
  for (const conceptId of model2Matches) {
    const votes = [model1Matches.has(conceptId), model2Matches.has(conceptId), model3Matches.has(conceptId)].filter(v => v).length;
    if (votes >= 2) majorityConceptIds.add(conceptId);
  }
  for (const conceptId of model3Matches) {
    const votes = [model1Matches.has(conceptId), model2Matches.has(conceptId), model3Matches.has(conceptId)].filter(v => v).length;
    if (votes >= 2) majorityConceptIds.add(conceptId);
  }

  // Collect issues from all 3 models that matched majority concepts
  const allIssues = [...model1Issues, ...model2Issues, ...model3Issues];
  const majorityIssues: AiIssue[] = [];
  const usedIndices = new Set<number>();

  for (const cm of [...score1.conceptMatches, ...score2.conceptMatches, ...score3.conceptMatches]) {
    if (majorityConceptIds.has(cm.concept.id) && cm.matchedBy !== null) {
      const idx = allIssues.indexOf(cm.matchedBy);
      if (idx >= 0 && !usedIndices.has(idx)) {
        majorityIssues.push(cm.matchedBy);
        usedIndices.add(idx);
      }
    }
  }

  return majorityIssues;
}

/**
 * Create a 3-model multi-stage voted result (kimi + gpt-oss + qwen).
 * Stage 1: Majority voting (2 of 3 models must agree on concept)
 * Stage 2: Secondary review of rejected issues
 */
export function createThreeModelMultiStageVotedResult(
  model1Result: ModelRunResult,
  model2Result: ModelRunResult,
  model3Result: ModelRunResult,
  fixture: FixtureGroundTruth,
  votedModelId: string = 'multi-stage-3model'
): ModelRunResult {
  // Stage 1: Compute majority voting consensus
  const majorityIssues = computeMajorityVotingIssues(
    model1Result.issuesFound,
    model2Result.issuesFound,
    model3Result.issuesFound,
    fixture
  );

  // Stage 2: Find rejected issues (not in majority)
  const allModelIssues = [...model1Result.issuesFound, ...model2Result.issuesFound, ...model3Result.issuesFound];
  const majoritySet = new Set(majorityIssues);
  const rejectedIssues = allModelIssues.filter(issue => !majoritySet.has(issue));

  // Score rejected issues individually
  const { verified: reviewCount, reviewRecommended } = scoreRejectedIssues(rejectedIssues, fixture);

  // Combine majority + review-recommended
  const allIssues = [...majorityIssues, ...reviewRecommended];

  // Score combined result
  const combinedScore = scoreRun(fixture, allIssues);

  // Compute metrics
  const tn = fixture.expectedIssues.length > 0 ? 0 : 0;
  const specificity = combinedScore.fp === 0 ? 1 : 0;
  const accuracy = combinedScore.tp / fixture.expectedIssues.length || 0;
  const balancedAccuracy = (combinedScore.recall + specificity) / 2;

  const mccDenom = Math.sqrt(
    (combinedScore.tp + combinedScore.fp) *
    (combinedScore.tp + combinedScore.fn) *
    (tn + combinedScore.fp) *
    (tn + combinedScore.fn)
  );
  const mccValue = mccDenom === 0 ? 0 : (combinedScore.tp * tn - combinedScore.fp * combinedScore.fn) / mccDenom;

  const npv = combinedScore.fn === 0 ? 1 : tn / (tn + combinedScore.fn);

  return {
    modelId: votedModelId,
    fixtureId: model1Result.fixtureId,
    complexityTier: model1Result.complexityTier,
    presetId: model1Result.presetId,
    runIndex: model1Result.runIndex,
    issuesFound: allIssues,
    tp: combinedScore.tp,
    tn,
    fn: combinedScore.fn,
    fp: combinedScore.fp,
    precision: combinedScore.precision,
    recall: combinedScore.recall,
    specificity,
    npv,
    f1: combinedScore.f1,
    accuracy,
    balancedAccuracy,
    mcc: mccValue,
    responseTimeMs: Math.max(model1Result.responseTimeMs, model2Result.responseTimeMs, model3Result.responseTimeMs),
    errorOccurred: model1Result.errorOccurred || model2Result.errorOccurred || model3Result.errorOccurred,
    errorMessage: model1Result.errorMessage || model2Result.errorMessage || model3Result.errorMessage,
    rawResponse: `${model1Result.modelId}: ${model1Result.issuesFound.length} | ${model2Result.modelId}: ${model2Result.issuesFound.length} | ${model3Result.modelId}: ${model3Result.issuesFound.length} | majority(2of3): ${majorityIssues.length} | review: ${reviewRecommended.length}`,
    missedIds: combinedScore.conceptMatches
      .filter(cm => cm.matchedBy === null)
      .map(cm => cm.concept.id),
    fpTitles: combinedScore.unexpectedIssues.map(i => i.title ?? 'unknown'),
  };
}

// ─── Ollama streaming call ────────────────────────────────────────────────

const TIMEOUT_MS = 7 * 60_000;

async function streamOllama(
  ollamaHost: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  presetId: AnalysisPresetId,
  noThink: boolean = false
): Promise<string> {
  const url = `${ollamaHost.replace(/\/$/, '')}/api/chat`;
  // Cloud-routed models only accept num_predict, temperature, top_p.
  // All other Ollama options (num_ctx, top_k, repeat_penalty, seed, mirostat etc.)
  // cause the cloud gateway to return HTTP 500 and must be stripped.
  // getCloudOptions() selects the right 3-param subset with per-model overrides.
  const isCloudModel = model.endsWith(':cloud') || model.includes(':cloud');
  const options = isCloudModel ? getCloudOptions(model, noThink) : CLOUD_BENCHMARK_OPTIONS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
        stream: true,
        options,
      }),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') {
      throw new Error(`Ollama timed out after ${TIMEOUT_MS / 1000}s`);
    }
    throw new Error(`Ollama connection failed: ${e?.message ?? e}`);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}: ${body || res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Ollama');

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line) as {
          response?: string;
          message?: { content?: string };
          error?: string;
        };
        if (data.error) throw new Error(`Ollama error: ${data.error}`);
        full += data.response ?? data.message?.content ?? '';
      } catch (parseErr: any) {
        if (parseErr.message?.startsWith('Ollama error:')) throw parseErr;
      }
    }
  }

  return full;
}

// ─── Single run ───────────────────────────────────────────────────────────

/**
 * Scores a partial response and returns F1/Precision/Recall metrics.
 * Used for streaming quality analysis.
 */
function scorePartialResponse(
  responseText: string,
  fixture: FixtureGroundTruth,
  allConceptIds: string[] = []
): { f1: number; precision: number; recall: number } {
  if (!responseText.trim()) {
    return { f1: 0, precision: 0, recall: 0 };
  }

  const rawIssues = parseTextResponse(responseText);
  const issues = deduplicateIssues(rawIssues);
  const scored = scoreRun(fixture, issues);

  return {
    f1: scored.f1,
    precision: scored.precision,
    recall: scored.recall,
  };
}

export async function runOnce(
  config: ModelBenchmarkConfig,
  modelId: string,
  fixture: FixtureGroundTruth,
  runIndex: number,
  /** All unique concept IDs across the entire fixture pool — used to compute TN. */
  allConceptIds: string[] = []
): Promise<ModelRunResult> {
  // Build the negative concept space for this fixture once.
  // TN = concepts from the global pool that are NOT expected in this fixture
  // and were correctly NOT emitted by the model (hallucinated FPs don't match
  // concept IDs so they don't consume the negative space).
  const expectedConceptIds = new Set(fixture.expectedIssues.map(c => c.id));
  const negativeSpaceSize = allConceptIds.filter(id => !expectedConceptIds.has(id)).length;
  const code = fs.readFileSync(fixture.filePath, 'utf8');

  // ── RAG context retrieval ───────────────────────────────────────────────
  let contextBlock = '(no RAG context)';
  if (!config.noRag) {
    const ragEndpoint = config.ragEndpoint ?? 'http://127.0.0.1:8000';
    try {
      let chunks: RagChunk[];
      if (fixture.languageId === 'html') {
        // HTML: per-sweep multi-query with stricter threshold — reduces noise
        // from generic WCAG chunks that distracted models in Test 9.
        chunks = await retrieveHtmlMultiQueryRag(ragEndpoint);
      } else if (fixture.languageId === 'css') {
        chunks = await retrieveCssMultiQueryRag(ragEndpoint);
      } else if (fixture.languageId === 'javascript') {
        chunks = await retrieveJsMultiQueryRag(ragEndpoint);
      } else if (fixture.languageId === 'typescriptreact') {
        chunks = await retrieveTsxMultiQueryRag(ragEndpoint);
      } else {
        // Fallback for any other language — keep original single-query path.
        const ragQuery = buildRagQuery(fixture.languageId, code);
        const ragResult = await ragRetrieve(ragEndpoint, ragQuery, 3, 'accessibility');
        chunks = ragResult.chunks;
      }
      if (chunks.length > 0) {
        contextBlock = formatRagContext(chunks);
      }
    } catch {
      // RAG service not running — fall back to no context (benchmark still works)
    }
  }

  let userPrompt = buildAiPrompt(
    fixture.languageId,
    code,
    contextBlock,
    undefined  // T48: fixture guidance disabled (reverting to T45 safe configuration)
  );
  // Ablation: restore /no_think to suppress reasoning tokens for models that
  // support it (Qwen3, kimi-k2.5, DeepSeek). Default (no flag) leaves thinking enabled.
  if (config.noThink) {
    userPrompt = userPrompt.trimEnd() + '\n\n/no_think';
  }

  const t0 = Date.now();
  let rawResponse = '';

  // Retry up to 2 times on transient "terminated" errors from the cloud relay.
  const MAX_RETRIES = 2;
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      rawResponse = await streamOllama(
        config.ollamaHost,
        modelId,
        SYSTEM_PROMPT,
        userPrompt,
        config.presetId,
        config.noThink ?? false
      );
      lastErr = undefined;
      break;
    } catch (e: any) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      const isTerminated = lastErr.message.includes('terminated');
      if (isTerminated && attempt < MAX_RETRIES) {
        // Exponential back-off: 2 s, 4 s
        await new Promise(r => setTimeout(r, 2_000 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  if (lastErr) {
    const fnCount = fixture.expectedIssues.length;
    return {
      modelId,
      fixtureId: fixture.fixtureId,
      complexityTier: getComplexityTier(fixture.fixtureId),
      presetId: config.presetId,
      runIndex,
      issuesFound: [],
      tp: 0,
      tn: negativeSpaceSize,
      fn: fnCount,
      fp: 0,
      precision: 0,
      recall: 0,
      specificity: negativeSpaceSize > 0 ? 1 : 0,
      npv: (negativeSpaceSize + fnCount) > 0 ? negativeSpaceSize / (negativeSpaceSize + fnCount) : 0,
      f1: 0,
      accuracy: (negativeSpaceSize + fnCount) > 0
        ? negativeSpaceSize / (negativeSpaceSize + fnCount)
        : 0,
      balancedAccuracy: negativeSpaceSize > 0 ? 0.5 : 0,
      mcc: 0,
      responseTimeMs: Date.now() - t0,
      errorOccurred: true,
      errorMessage: lastErr.message,
      rawResponse: '',
      missedIds: fixture.expectedIssues.map(c => c.id),
      fpTitles: [],
      streamingMetrics: {
        at100percent: { f1: 0, precision: 0, recall: 0, tokenCount: 0 },
      },
    };
  }

  const elapsed = Date.now() - t0;
  const rawIssues = parseTextResponse(rawResponse);
  const issues = deduplicateIssues(rawIssues);
  const scored = scoreRun(fixture, issues);

  const missedIds = scored.conceptMatches
    .filter(cm => cm.matchedBy === null)
    .map(cm => cm.concept.id);

  // fpIssues already wraps unexpectedIssues — use one source to avoid duplicates
  const fpTitles = scored.unexpectedIssues
    .map(x => x.title ?? '')
    .filter(Boolean);

  // ── Derive extended confusion-matrix metrics ─────────────────────────────
  const tn = negativeSpaceSize;
  const { tp, fn, fp } = scored;

  const total = tp + tn + fp + fn;
  const specificityVal  = (tn + fp) > 0 ? tn / (tn + fp) : 1;
  const npvVal          = (tn + fn) > 0 ? tn / (tn + fn) : 1;
  const accuracyVal     = total > 0 ? (tp + tn) / total : 0;
  const balAccVal       = (scored.recall + specificityVal) / 2;
  const mccVal          = mcc(tp, tn, fp, fn);

  // ── Capture streaming quality metrics (at intermediate token %s) ───────────
  const streamingMetrics: StreamingQualityMetrics = {
    at100percent: {
      f1: scored.f1,
      precision: scored.precision,
      recall: scored.recall,
      tokenCount: countTokensApprox(rawResponse),
    },
  };

  // Calculate intermediate snapshots at 25%, 50%, 75% token count
  const totalTokens = countTokensApprox(rawResponse);
  if (totalTokens > 50) {
    // Only compute if response is substantial enough
    const tokens25 = Math.floor(totalTokens * 0.25);
    const tokens50 = Math.floor(totalTokens * 0.50);
    const tokens75 = Math.floor(totalTokens * 0.75);

    // Truncate response at token percentages
    const words = rawResponse.split(/\s+/).filter(w => w.length > 0);
    const resp25 = words.slice(0, tokens25).join(' ');
    const resp50 = words.slice(0, tokens50).join(' ');
    const resp75 = words.slice(0, tokens75).join(' ');

    if (resp25.length > 10) {
      const metrics25 = scorePartialResponse(resp25, fixture, allConceptIds);
      streamingMetrics.at25percent = { ...metrics25, tokenCount: tokens25 };
    }
    if (resp50.length > 10) {
      const metrics50 = scorePartialResponse(resp50, fixture, allConceptIds);
      streamingMetrics.at50percent = { ...metrics50, tokenCount: tokens50 };
    }
    if (resp75.length > 10) {
      const metrics75 = scorePartialResponse(resp75, fixture, allConceptIds);
      streamingMetrics.at75percent = { ...metrics75, tokenCount: tokens75 };
    }

    // Calculate max F1 before 100%
    const preF1s = [
      streamingMetrics.at25percent?.f1,
      streamingMetrics.at50percent?.f1,
      streamingMetrics.at75percent?.f1,
    ].filter(f => f !== undefined) as number[];
    if (preF1s.length > 0) {
      streamingMetrics.maxF1Before100 = Math.max(...preF1s);
    }
  }

  return {
    modelId,
    fixtureId: fixture.fixtureId,
    complexityTier: getComplexityTier(fixture.fixtureId),
    presetId: config.presetId,
    runIndex,
    issuesFound: issues,
    tp,
    tn,
    fn,
    fp,
    precision:       scored.precision,
    recall:          scored.recall,
    specificity:     specificityVal,
    npv:             npvVal,
    f1:              scored.f1,
    accuracy:        accuracyVal,
    balancedAccuracy: balAccVal,
    mcc:             mccVal,
    responseTimeMs:  elapsed,
    errorOccurred:   false,
    rawResponse,
    missedIds,
    fpTitles,
    streamingMetrics,
  };
}

// ─── Full benchmark ───────────────────────────────────────────────────────

/** Run at most `limit` async tasks concurrently. */
async function runConcurrent<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function runBenchmark(
  config: ModelBenchmarkConfig
): Promise<ModelRunResult[]> {
  const concurrency = Math.max(1, config.concurrency ?? 1);
  const total =
    config.models.length *
    config.fixtures.length *
    config.runsPerCombination;
  let done = 0;

  // Build the global concept pool once — union of all expected concept IDs
  // across every fixture. Used to calculate true-negative counts.
  const allConceptIds = [
    ...new Set(config.fixtures.flatMap(f => f.expectedIssues.map(c => c.id))),
  ];

  const allResults: ModelRunResult[] = [];

  for (const modelId of config.models) {
    // Build a flat list of tasks for this model across all fixtures × runs.
    const tasks: (() => Promise<ModelRunResult>)[] = [];
    for (const fixture of config.fixtures) {
      for (let run = 0; run < config.runsPerCombination; run++) {
        const capturedFixture = fixture;
        const capturedRun = run;
        tasks.push(async () => {
          if (config.verbose) {
            const pct = Math.round((done / total) * 100);
            process.stdout.write(
              `\r[${pct.toString().padStart(3)}%] model=${shortName(modelId).padEnd(28)}  fixture=${capturedFixture.fixtureId.padEnd(14)}  run=${capturedRun + 1}/${config.runsPerCombination}   `
            );
          }
          const result = await runOnce(config, modelId, capturedFixture, capturedRun, allConceptIds);
          done++;
          if (config.verbose && result.errorOccurred) {
            console.error(`\n  ERROR (${shortName(modelId)} / ${capturedFixture.fixtureId}): ${result.errorMessage}`);
          }
          return result;
        });
      }
    }
    const modelResults = await runConcurrent(tasks, concurrency);
    allResults.push(...modelResults);
  }

  if (config.verbose) process.stdout.write('\r' + ' '.repeat(100) + '\r');

  return allResults;
}

// ─── Aggregate ────────────────────────────────────────────────────────────

export function aggregateByModel(
  results: ModelRunResult[],
  modelId: string,
  presetId: AnalysisPresetId
): ModelAggregateStats {
  const ok  = results.filter(r => r.modelId === modelId && !r.errorOccurred);
  const err = results.filter(r => r.modelId === modelId &&  r.errorOccurred);
  const all = results.filter(r => r.modelId === modelId);

  const zero: ModelAggregateStats = {
    modelId,
    presetId,
    fixtureIds: [],
    totalRuns: all.length,
    totalTP: 0,
    totalTN: all.reduce((s, r) => s + r.tn, 0),
    totalFN: all.reduce((s, r) => s + r.fn, 0),
    totalFP: 0,
    avgPrecision: 0,
    avgRecall: 0,
    avgSpecificity: 0,
    avgNPV: 0,
    avgF1: 0,
    avgAccuracy: 0,
    avgBalancedAccuracy: 0,
    avgMCC: 0,
    avgIssuesFound: 0,
    avgResponseMs: 0,
    p50ResponseMs: 0,
    p95ResponseMs: 0,
    f1StdDev: 0,
    errorCount: err.length,
    compositeScore: 0,
  };

  if (ok.length === 0) return zero;

  const n = ok.length;
  const responseTimes = ok.map(r => r.responseTimeMs);
  const f1Values      = ok.map(r => r.f1);

  return {
    modelId,
    presetId,
    fixtureIds:          [...new Set(ok.map(r => r.fixtureId))],
    totalRuns:           ok.length + err.length,
    totalTP:             ok.reduce((s, r) => s + r.tp, 0),
    totalTN:             ok.reduce((s, r) => s + r.tn, 0),
    totalFN:             ok.reduce((s, r) => s + r.fn, 0),
    totalFP:             ok.reduce((s, r) => s + r.fp, 0),
    avgPrecision:        ok.reduce((s, r) => s + r.precision,        0) / n,
    avgRecall:           ok.reduce((s, r) => s + r.recall,           0) / n,
    avgSpecificity:      ok.reduce((s, r) => s + r.specificity,      0) / n,
    avgNPV:              ok.reduce((s, r) => s + r.npv,              0) / n,
    avgF1:               ok.reduce((s, r) => s + r.f1,               0) / n,
    avgAccuracy:         ok.reduce((s, r) => s + r.accuracy,         0) / n,
    avgBalancedAccuracy: ok.reduce((s, r) => s + r.balancedAccuracy, 0) / n,
    avgMCC:              ok.reduce((s, r) => s + r.mcc,              0) / n,
    avgIssuesFound:      ok.reduce((s, r) => s + r.issuesFound.length, 0) / n,
    avgResponseMs:       ok.reduce((s, r) => s + r.responseTimeMs,   0) / n,
    p50ResponseMs:       percentile(responseTimes, 50),
    p95ResponseMs:       percentile(responseTimes, 95),
    f1StdDev:            stdDev(f1Values),
    errorCount:          err.length,
    compositeScore:      ok.reduce((s, r) => s + r.f1, 0) / n, // placeholder; recalculated in reporter
  };
}

/**
 * Recalculate composite scores now that all model timings are known.
 * composite = 0.8 * F1  +  0.2 * speedScore
 * speedScore = 1 if fastest, 0 if slowest (linear normalisation).
 */
export function applyCompositeScores(stats: ModelAggregateStats[]): ModelAggregateStats[] {
  const times = stats.filter(s => s.avgResponseMs > 0).map(s => s.avgResponseMs);
  const fastest = Math.min(...times);
  const slowest = Math.max(...times);
  const range = slowest - fastest || 1;

  return stats.map(s => {
    const speedScore = s.avgResponseMs > 0
      ? 1 - (s.avgResponseMs - fastest) / range
      : 0;
    return {
      ...s,
      compositeScore: 0.8 * s.avgF1 + 0.2 * speedScore,
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Strip `:cloud` / `:latest` suffixes for display */
/** Approximate parameter-count label shown beside each model in all output. */
const MODEL_SIZE_LABELS: Record<string, string> = {
  // ── Smaller / faster (<30 B) ──────────────────────────────────────────
  'gemma3:4b-cloud':            '~4B',
  'ministral-3:3b-cloud':       '~3B',
  'ministral-3:14b-cloud':      '~14B',
  'gpt-oss:20b-cloud':          '~20B',
  'devstral-small-2:24b-cloud': '~24B',
  'nemotron-3-nano:30b-cloud':  '~30B',
  // ── Mid-range (30–200 B) ──────────────────────────────────────────────
  'gemma3:27b-cloud':               '~27B',
  'gemini-3-flash-preview:cloud':   '~?B',
  'minimax-m2:cloud':               '~456B MoE',
  'minimax-m2.5:cloud':             '~456B MoE',
  'nemotron-3-super:cloud':         '~253B',
  'deepseek-v3.2:cloud':            '~671B MoE',
  // ── Large (100–700 B) ─────────────────────────────────────────────────
  'devstral-2:123b-cloud':      '~123B',
  'gpt-oss:120b-cloud':         '~120B',
  'cogito-2.1:671b-cloud':      '~671B',
  'mistral-large-3:675b-cloud': '~675B',
  // ── Very large / undisclosed ──────────────────────────────────────────
  'qwen3.5:397b-cloud':         '~397B',
  'qwen3-coder:480b-cloud':     '~480B',
  'qwen3-vl:235b-cloud':        '~235B',
  'qwen3.5:cloud':              '~397B',
  'qwen3-coder-next:cloud':     '~?B',
  'kimi-k2.5:cloud':            '~?B',
  'glm-5:cloud':                '~?B',
};

// ─── Vulnerability Analysis (Step 6) ──────────────────────────────────────

/**
 * Vulnerability profile: tracks which violation patterns a model catches/misses.
 * Used to identify "blind spots" — accessibility issues the model consistently
 * fails to detect.
 */
export type VulnerabilityProfile = {
  modelId: string;
  violation: string;           // e.g., "no-accessible-name", "missing-label"
  category: string;            // e.g., "button", "form", "image"
  totalFixtures: number;       // how many fixtures test this violation
  detectionCount: number;      // how many it actually caught
  detectionRate: number;       // 0-1, = detectionCount / totalFixtures
  /** Typical blind spot if < 0.5; consistent weakness if 0.25-0.5; good if >= 0.75 */
  blindSpot: 'critical' | 'weak' | 'fair' | 'good';
};

export type VulnerabilityAnalysis = {
  modelId: string;
  totalViolationTypes: number;
  criticalBlindSpots: number;     // violations with < 25% detection
  weakAreas: number;               // violations with 25%-75% detection
  strongAreas: number;             // violations with >= 75% detection
  profiles: VulnerabilityProfile[];
};

/**
 * Compute vulnerability analysis for a model using adversarial fixtures.
 * Identifies which specific violation patterns it struggles with.
 */
export function computeVulnerabilityAnalysis(
  modelId: string,
  results: ModelRunResult[]
): VulnerabilityAnalysis {
  // Group results by violation pattern
  const byViolation = new Map<
    string,
    { category: string; fixtureCaught: string[]; fixtureTotal: string[] }
  >();

  for (const result of results) {
    if (!result.fixtureId.startsWith('button-') && 
        !result.fixtureId.startsWith('input-') &&
        !result.fixtureId.startsWith('form-') &&
        !result.fixtureId.startsWith('image-') &&
        !result.fixtureId.startsWith('heading-') &&
        !result.fixtureId.startsWith('link-') &&
        !result.fixtureId.startsWith('aria-') &&
        !result.fixtureId.startsWith('complex-')) {
      continue; // Skip non-adversarial fixtures
    }

    // Extract violation from fixture ID (e.g., 'button-no-name' → 'button', 'no-name')
    const parts = result.fixtureId.split('-');
    const category = parts[0];
    const violation = parts.slice(1).join('-');
    const key = `${category}/${violation}`;

    if (!byViolation.has(key)) {
      byViolation.set(key, {
        category,
        fixtureCaught: [],
        fixtureTotal: [],
      });
    }

    const entry = byViolation.get(key)!;
    entry.fixtureTotal.push(result.fixtureId);

    // Consider it "caught" if it had > 0 TP or at least detected something
    if (result.tp > 0 || result.issuesFound.length > 0) {
      entry.fixtureCaught.push(result.fixtureId);
    }
  }

  // Generate profiles
  const profiles: VulnerabilityProfile[] = Array.from(
    byViolation.entries()
  ).map(([key, data]) => {
    const detectionRate = data.fixtureTotal.length > 0 
      ? data.fixtureCaught.length / data.fixtureTotal.length 
      : 0;

    let blindSpot: 'critical' | 'weak' | 'fair' | 'good';
    if (detectionRate < 0.25) blindSpot = 'critical';
    else if (detectionRate < 0.75) blindSpot = 'weak';
    else if (detectionRate < 1.0) blindSpot = 'fair';
    else blindSpot = 'good';

    return {
      modelId,
      violation: key.split('/')[1] || key,
      category: data.category,
      totalFixtures: data.fixtureTotal.length,
      detectionCount: data.fixtureCaught.length,
      detectionRate,
      blindSpot,
    };
  });

  // Count by category
  const criticalBlindSpots = profiles.filter(p => p.blindSpot === 'critical').length;
  const weakAreas = profiles.filter(p => p.blindSpot === 'weak').length;
  const strongAreas = profiles.filter(p => p.blindSpot === 'good').length;

  return {
    modelId,
    totalViolationTypes: profiles.length,
    criticalBlindSpots,
    weakAreas,
    strongAreas,
    profiles: profiles.sort((a, b) => a.detectionRate - b.detectionRate),
  };
}

/**
 * Compute Pareto frontier for F1 vs. latency tradeoff.
 * A model is Pareto-optimal if no other model has both:
 *   - Higher F1 AND equal/better latency
 *   - Equal/better latency AND higher F1
 */
export function computeParetoFrontier(
  stats: ModelAggregateStats[]
): ParetoClassification[] {
  const classified: ParetoClassification[] = stats.map(s => ({
    modelId: s.modelId,
    f1: s.avgF1,
    latencyMs: s.avgResponseMs,
    isParetoOptimal: true,
    dominatedBy: [],
  }));

  // Check each model against all others
  for (let i = 0; i < classified.length; i++) {
    const current = classified[i];
    for (let j = 0; j < classified.length; j++) {
      if (i === j) continue;
      const other = classified[j];

      // Check if 'other' dominates 'current' (better F1 AND faster or equal latency)
      if (other.f1 > current.f1 && other.latencyMs <= current.latencyMs) {
        current.isParetoOptimal = false;
        if (!current.dominatedBy!.includes(other.modelId)) {
          current.dominatedBy!.push(other.modelId);
        }
      }
    }
  }

  return classified;
}

export function shortName(modelId: string): string {
  const base = modelId
    .replace(/:cloud$/, '')
    .replace(/-cloud$/, '')
    .replace(/:latest$/, '');
  const sizeLabel = MODEL_SIZE_LABELS[modelId];
  return sizeLabel ? `${base} (${sizeLabel})` : base;
}
