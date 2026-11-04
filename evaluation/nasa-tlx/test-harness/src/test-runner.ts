/**
 * test-runner.ts
 *
 * Entry point for NASA-TLX prediction test suite.
 * Runs predictions and validates against mock developer ratings.
 *
 * Run: npx ts-node src/test-runner.ts
 */

import {
  predictTlxFromIssues,
  validatePrediction,
  EXAMPLE_TEST_ISSUES,
  EXAMPLE_MOCK_DEVELOPER_RATING,
  AccessibilityIssue,
  NasaTlxPrediction,
  ValidationResult,
} from './nasa-tlx-test-harness.js';

// ─── Test Suite Runner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TestCase {
  name: string;
  fixtureName: string;
  issues: AccessibilityIssue[];
  expectedTlxRange: [number, number]; // [min, max] for fuzzy match
}

const TEST_SUITE: TestCase[] = [
  {
    name: 'Clean HTML (no issues)',
    fixtureName: 'html-clean',
    issues: EXAMPLE_TEST_ISSUES['html-clean'],
    expectedTlxRange: [0, 15],
  },
  {
    name: 'Low accessibility barriers (2 issues)',
    fixtureName: 'html-low',
    issues: EXAMPLE_TEST_ISSUES['html-low'],
    expectedTlxRange: [15, 45],
  },
  {
    name: 'Medium accessibility barriers (4 issues)',
    fixtureName: 'html-medium',
    issues: EXAMPLE_TEST_ISSUES['html-medium'],
    expectedTlxRange: [20, 55],
  },
  {
    name: 'High accessibility barriers (8 critical/high issues)',
    fixtureName: 'html-high',
    issues: EXAMPLE_TEST_ISSUES['html-high'],
    expectedTlxRange: [55, 90],
  },
];

interface TestReport {
  testName: string;
  passed: boolean;
  predicted: NasaTlxPrediction;
  validation?: ValidationResult;
  notes: string;
}

async function runTestSuite(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                      NASA-TLX Prediction Test Suite                           ║');
  console.log('║     Validating accessibility barrier → cognitive workload prediction model     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  const results: TestReport[] = [];
  const summaryStats = {
    testsRun: 0,
    passed: 0,
    failed: 0,
    avgError: 0,
    accurateCount: 0,
  };

  for (const testCase of TEST_SUITE) {
    console.log(
      `\n┌─ Test: ${testCase.name}\n│  Fixture: ${testCase.fixtureName}, Issues: ${testCase.issues.length}`
    );

    // 1. Predict TLX
    const prediction = predictTlxFromIssues(testCase.fixtureName, testCase.issues);

    // 2. Check if prediction falls within expected range
    const inRange = prediction.raw_tlx >= testCase.expectedTlxRange[0] && prediction.raw_tlx <= testCase.expectedTlxRange[1];
    const passed = inRange;

    // 3. Validate against mock developer rating (if available)
    let validation: ValidationResult | undefined;
    if (testCase.fixtureName === 'html-high') {
      validation = validatePrediction(prediction, EXAMPLE_MOCK_DEVELOPER_RATING);
      console.log(`│  Predicted TLX: ${prediction.raw_tlx}/100 (expected ${testCase.expectedTlxRange[0]}–${testCase.expectedTlxRange[1]})`);
      console.log(`│  Actual TLX (mock): ${validation.actual_tlx}/100`);
      console.log(`│  Error margin: ±${validation.error_margin.toFixed(1)} points`);
      console.log(`│  Validation: ${validation.decision.toUpperCase()}`);

      summaryStats.avgError += validation.error_margin;
      if (validation.decision === 'accurate') summaryStats.accurateCount++;
    } else {
      console.log(`│  Predicted TLX: ${prediction.raw_tlx}/100 (expected ${testCase.expectedTlxRange[0]}–${testCase.expectedTlxRange[1]})`);
    }

    console.log(`│  Confidence: ${prediction.confidence.toUpperCase()}`);
    console.log(`│  Subscales: MD=${prediction.subscale_scores.mental_demand} PD=${prediction.subscale_scores.physical_demand} TD=${prediction.subscale_scores.temporal_demand}`);
    console.log(
      `│             Perf=${prediction.subscale_scores.performance} E=${prediction.subscale_scores.effort} F=${prediction.subscale_scores.frustration}`
    );

    // Log reasoning
    if (prediction.subscale_scores.mental_demand > 0 || prediction.subscale_scores.frustration > 0) {
      console.log(`│`);
      console.log(`│  Drivers:`);
      for (const assumption of prediction.assumptions.slice(0, 2)) {
        console.log(`│    • ${assumption}`);
      }
    }

    console.log(`│  Result: ${passed ? '✓ PASS' : '✗ FAIL'}`);
    console.log('└─');

    results.push({
      testName: testCase.name,
      passed,
      predicted: prediction,
      validation,
      notes: `Expected TLX in [${testCase.expectedTlxRange[0]}, ${testCase.expectedTlxRange[1]}], got ${prediction.raw_tlx}`,
    });

    summaryStats.testsRun++;
    if (passed) {
      summaryStats.passed++;
    } else {
      summaryStats.failed++;
    }
  }

  // ─── Summary Report ──────────────────────────────────────────────────────────

  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              Test Summary Report                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝');

  const passRate = ((summaryStats.passed / summaryStats.testsRun) * 100).toFixed(1);
  const avgErrVal = (summaryStats.avgError / Math.max(1, summaryStats.accurateCount)).toFixed(1);

  console.log(`\n✓ Passed:     ${summaryStats.passed}/${summaryStats.testsRun}`);
  console.log(`✗ Failed:     ${summaryStats.failed}/${summaryStats.testsRun}`);
  console.log(`  Pass Rate:  ${passRate}%`);

  if (summaryStats.accurateCount > 0) {
    console.log(`\n  Validation Results (vs. mock ratings):`);
    console.log(`  • Accurate predictions: ${summaryStats.accurateCount}`);
    console.log(`  • Avg error margin: ±${avgErrVal} TLX points`);
  }

  console.log('\n  Detailed Results:');
  for (const result of results) {
    const status = result.passed ? '↓ ◇ PASS' : '↓ • FAIL';
    console.log(`\n  ${status} ${result.testName}`);
    console.log(`     Predicted: ${result.predicted.raw_tlx} | Notes: ${result.notes}`);
    if (result.validation) {
      console.log(`     Validation: ${result.validation.decision.toUpperCase()} (error ±${result.validation.error_margin.toFixed(1)})`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log(
    `║  Overall: ${passRate}% pass rate. Model prediction coverage appropriate for Phase 2 evaluation.      ║`
  );
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  process.exit(summaryStats.failed > 0 ? 1 : 0);
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
