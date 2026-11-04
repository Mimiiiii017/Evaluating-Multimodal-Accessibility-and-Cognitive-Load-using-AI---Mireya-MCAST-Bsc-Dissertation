#!/usr/bin/env npx ts-node
/**
 * test-nasa-tlx.ts
 *
 * Demo: Predict NASA-TLX workload scores from accessibility issues,
 * then validate against mock developer ratings.
 *
 * Run: npx ts-node test-nasa-tlx.ts
 */

import {
  predictTlxFromIssues,
  validatePrediction,
  EXAMPLE_TEST_ISSUES,
  EXAMPLE_MOCK_DEVELOPER_RATING,
  DeveloperRating,
} from './nasa-tlx-test-harness.js';

// Mock actual developer ratings (would come from user study)
const MOCK_DEVELOPER_RATINGS: Record<string, DeveloperRating> = {
  'html-high': EXAMPLE_MOCK_DEVELOPER_RATING,
  'html-medium': {
    participant_id: 'dev-002',
    fixture_name: 'html-medium',
    subscale_ratings: {
      mental_demand: 45,
      physical_demand: 20,
      temporal_demand: 38,
      performance: 75,
      effort: 50,
      frustration: 35,
    },
    raw_tlx: 43,
    notes: 'Moderate difficulty. Some missing labels but overall manageable.',
  },
  'html-low': {
    participant_id: 'dev-003',
    fixture_name: 'html-low',
    subscale_ratings: {
      mental_demand: 25,
      physical_demand: 15,
      temporal_demand: 20,
      performance: 90,
      effort: 20,
      frustration: 15,
    },
    raw_tlx: 30,
    notes: 'Quick and easy. Only 2 obvious issues.',
  },
  'html-clean': {
    participant_id: 'dev-004',
    fixture_name: 'html-clean',
    subscale_ratings: {
      mental_demand: 10,
      physical_demand: 5,
      temporal_demand: 5,
      performance: 100,
      effort: 5,
      frustration: 5,
    },
    raw_tlx: 15,
    notes: 'Trivial. No issues found.',
  },
};

// ─── Test 1: Predict TLX for each fixture ──────────────────────────────────

console.log('═══════════════════════════════════════════════════════════════════');
console.log('NASA-TLX TEST HARNESS: Accessibility → Cognitive Load Prediction');
console.log('═══════════════════════════════════════════════════════════════════\n');

console.log('TEST 1: Predict TLX scores from accessibility issues\n');
console.log('─'.repeat(70));

const predictions = Object.entries(EXAMPLE_TEST_ISSUES).map(([fixture, issues]) => {
  const pred = predictTlxFromIssues(fixture, issues);
  console.log(`\n📊 ${fixture.toUpperCase()}`);
  console.log(`   Issues: ${pred.issue_count}`);
  console.log(`   Mental Demand:   ${pred.subscale_scores.mental_demand}/100`);
  console.log(`   Physical Demand: ${pred.subscale_scores.physical_demand}/100`);
  console.log(`   Temporal Demand: ${pred.subscale_scores.temporal_demand}/100`);
  console.log(`   Performance:     ${pred.subscale_scores.performance}/100`);
  console.log(`   Effort:          ${pred.subscale_scores.effort}/100`);
  console.log(`   Frustration:     ${pred.subscale_scores.frustration}/100`);
  console.log(`   ─────────────────────────`);
  console.log(`   🎯 PREDICTED TLX: ${pred.raw_tlx}/100 (${pred.confidence} confidence)`);
  console.log(`   📝 ${pred.explanation.substring(0, 100)}...`);
  return pred;
});

// ─── Test 2: Validate against mock developer ratings ─────────────────────

console.log('\n\n═══════════════════════════════════════════════════════════════════');
console.log('TEST 2: Validate predictions vs actual developer ratings\n');
console.log('─'.repeat(70));

const validations = predictions.map((pred) => {
  const actualRating = MOCK_DEVELOPER_RATINGS[pred.fixture_name];
  if (!actualRating) {
    console.log(`\n⚠️  ${pred.fixture_name}: No developer rating (skip)`);
    return null;
  }

  const validation = validatePrediction(pred, actualRating);
  const status =
    validation.decision === 'accurate'
      ? '✅'
      : validation.decision === 'overestimated'
        ? '⬆️'
        : '⬇️';

  console.log(
    `\n${status} ${validation.fixture_name}: predicted=${validation.predicted_tlx}, actual=${validation.actual_tlx}, error=${validation.error_margin.toFixed(1)}`
  );
  console.log(`   ${validation.decision.toUpperCase()}`);

  return validation;
});

// ─── Test 3: Correlation Analysis ──────────────────────────────────────────

console.log('\n\n═══════════════════════════════════════════════════════════════════');
console.log('TEST 3: Correlation Summary\n');
console.log('─'.repeat(70));

const validData = validations.filter((v): v is NonNullable<typeof v> => v !== null);
const predictions_arr = validData.map((v) => v.predicted_tlx);
const actuals_arr = validData.map((v) => v.actual_tlx);

// Pearson correlation
const meanPred = predictions_arr.reduce((a, b) => a + b, 0) / predictions_arr.length;
const meanActual = actuals_arr.reduce((a, b) => a + b, 0) / actuals_arr.length;

const covariance = predictions_arr.reduce(
  (sum, pred, i) => sum + (pred - meanPred) * (actuals_arr[i] - meanActual),
  0
);
const stdPred = Math.sqrt(predictions_arr.reduce((sum, p) => sum + (p - meanPred) ** 2, 0));
const stdActual = Math.sqrt(actuals_arr.reduce((sum, a) => sum + (a - meanActual) ** 2, 0));
const pearson = covariance / (stdPred * stdActual);

console.log(`Mean Predicted TLX: ${meanPred.toFixed(1)}`);
console.log(`Mean Actual TLX:    ${meanActual.toFixed(1)}`);
console.log(`Pearson r:          ${pearson.toFixed(3)}`);
console.log(`RMSE:               ${Math.sqrt(validData.reduce((sum, v) => sum + v.error_margin ** 2, 0) / validData.length).toFixed(1)}`);
console.log(`\nAccurate predictions: ${validData.filter((v) => v.decision === 'accurate').length}/${validData.length}`);

// ─── Test 4: Key Findings ──────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('KEY FINDINGS\n');
console.log('─'.repeat(70));

console.log(`
✓ NASA-TLX is NOT HTML-specific. It measures cognitive workload for ANY task.

✓ This harness maps accessibility barriers found in code (HTML, CSS, JS, TSX)
  to the 6 NASA-TLX dimensions:
    MD = Mental effort to understand/process issues
    PD = Physical effort (motor/keyboard navigation)
    TD = Time pressure to find all issues
    Perf = Developer's perception of success in identifying issues
    E = Overall effort required
    F = Frustration with barriers

✓ Prediction formula: issues → barriers → dimension impacts → TLX score

✓ Validation shows if LLM prediction matches real developer experience.
  - Pearson r ≥ 0.7 = strong correlation (good prediction)
  - Pearson r < 0.5 = weak (model needs tuning)

✓ Use case for dissertation:
  1. Run kimi-k2.5 on all 16 fixtures → get F1 scores
  2. Predict TLX from issues found
  3. Have ~10 developers rate NASA-TLX while using extension
  4. Correlate: F1 accuracy ↔ developer TLX (cognitive load)
  5. Report: "Better accessibility detection (higher F1) reduces
     developer cognitive load (lower TLX)" or "no significant correlation"
`);

console.log('═══════════════════════════════════════════════════════════════════\n');
