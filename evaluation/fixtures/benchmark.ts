/**
 * preset-benchmark/benchmark.ts  —  Core scoring logic
 *
 * scoreRun() matches LLM-emitted AiIssue objects to expected IssueConcepts
 * using keyword-based fuzzy matching.  The same function is used by both the
 * preset-benchmark and the llm-benchmark so scoring is always consistent.
 *
 * Matching rule:
 *   A concept is "matched" (TP) by the first AiIssue whose (title + explanation)
 *   contains ANY of the concept's keywords (case-insensitive substring match).
 *   Each found issue can only match one concept (greedy, first-wins).
 *
 * After matching:
 *   TP = matched concepts
 *   FN = unmatched concepts
 *   FP = found issues not matched to any concept
 *
 * On "clean" fixtures (isClean = true) every found issue is an FP because
 * there are no expected concepts to match against.
 */

import type { AiIssue } from
  '../../extension/ai-accessibility-assistant/src/utils/types';
import type { IssueConcept, FixtureGroundTruth } from './ground-truth';

// ─── Result types ─────────────────────────────────────────────────────────

export type ConceptMatch = {
  concept: IssueConcept;
  /** The AiIssue that matched this concept, or null if no match was found (FN) */
  matchedBy: AiIssue | null;
};

export type FPItem = {
  issue: AiIssue;
};

export type ScoreResult = {
  tp: number;
  fn: number;
  fp: number;
  precision: number;
  recall: number;
  f1: number;
  /** One entry per expected concept — matchedBy === null means it was missed */
  conceptMatches: ConceptMatch[];
  /** Found issues that did not match any expected concept */
  fpIssues: FPItem[];
  /** Same as fpIssues but as raw AiIssue[] (convenience alias) */
  unexpectedIssues: AiIssue[];
};

// ─── Scoring ──────────────────────────────────────────────────────────────

/**
 * Score a single LLM run against the fixture's ground truth.
 */
export function scoreRun(
  fixture: FixtureGroundTruth,
  issuesFound: AiIssue[]
): ScoreResult {
  const usedIndices = new Set<number>();

  const conceptMatches: ConceptMatch[] = fixture.expectedIssues.map(concept => {
    const matchIdx = issuesFound.findIndex((issue, i) => {
      if (usedIndices.has(i)) return false;
      const haystack = [
        issue.title       ?? '',
        issue.explanation ?? '',
        issue.fix         ?? '',
      ].join(' ').toLowerCase();
      return concept.keywords.some(kw => haystack.includes(kw.toLowerCase()));
    });

    if (matchIdx >= 0) {
      usedIndices.add(matchIdx);
      return { concept, matchedBy: issuesFound[matchIdx] };
    }
    return { concept, matchedBy: null };
  });

  const tp = conceptMatches.filter(cm => cm.matchedBy !== null).length;
  const fn = conceptMatches.filter(cm => cm.matchedBy === null).length;

  // Issues not matched to any concept
  const unexpectedIssues = issuesFound.filter((_, i) => !usedIndices.has(i));
  const fp = unexpectedIssues.length;

  // Precision: what fraction of things the model flagged were actually issues?
  // When both tp and fp are 0 (nothing flagged, nothing expected) → 1.
  const precision = (tp + fp) === 0 ? 1 : tp / (tp + fp);

  // Recall: what fraction of expected issues did the model find?
  // When both tp and fn are 0 (clean fixture, nothing missed) → 1.
  const recall    = (tp + fn) === 0 ? 1 : tp / (tp + fn);

  const f1 = (precision + recall) === 0
    ? 0
    : (2 * precision * recall) / (precision + recall);

  return {
    tp,
    fn,
    fp,
    precision,
    recall,
    f1,
    conceptMatches,
    fpIssues:         unexpectedIssues.map(issue => ({ issue })),
    unexpectedIssues,
  };
}
