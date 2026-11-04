/**
 * study-6-fixtures.ts — Study 6: Supplementary Comparison Fixtures
 *
 * Defines the fixture set for Study 6 tool comparison. Uses the same HTML, CSS, and JS
 * resources as Phases 1–3 benchmarks (32–33 kB, 68–72 kB, 461–509 kB respectively) to
 * ensure consistency and realism. Error levels (10, 30, 50) are drawn from empirical
 * literature and aligned with the same benchmarking justification.
 *
 * FIXTURE SELECTION CRITERIA
 * ──────────────────────────
 *
 * For Study 6, we select two representative fixtures from Phase 3.3 (Detailed HTML):
 *   • html-medium.html  — 30 errors (medium complexity; aligns with average real-world error count)
 *   • html-high.html    — 50 errors (high complexity; represents sites with significant barriers)
 *
 * These fixtures are chosen because:
 *   1. HTML is the primary analysis target for Lighthouse and axe-core (rendered DOM testing).
 *   2. The AI Accessibility Assistant can analyse both the raw HTML source and infer issues from DOM structure.
 *   3. 30 and 50 errors bracket the real-world baseline (30 is median, per Martins & Duarte 2016).
 *   4. JS and TSX fixtures are excluded from this tool comparison because Lighthouse and axe-core do not
 *      perform semantic accessibility analysis on JavaScript event handlers or React component patterns
 *      — only rendered DOM analysis.
 *
 * SIZE JUSTIFICATION — HTTP Archive Web Almanac 2024
 * ───────────────────────────────────────────────────
 *
 *   • HTML: 32–33 kB
 *     - HTTP Archive 2024 reports median transferred HTML at 33 kB (desktop) / 32 kB (mobile).
 *     - CMS median: 22–38 kB (mainstream); Wix outliers ~142 kB.
 *     - Selection: 32–33 kB aligns with typical modern page rather than bloated or minimal extremes.
 *
 *   • CSS: 68–72 kB
 *     - HTTP Archive 2022: median 72 kB (desktop) / 68 kB (mobile).
 *     - Ensures realistic stylesheet complexity without artificial padding.
 *
 *   • JS: 461–509 kB
 *     - HTTP Archive 2022: median 509 kB (desktop) / 461 kB (mobile).
 *     - Reflects contemporary JavaScript payload typical of SPA and framework-heavy pages.
 *
 * ERROR COUNT JUSTIFICATION
 * ───────────────────────────
 *
 *   10 errors (low-error fixture):
 *     - Martins & Duarte (2016): ~63% of pages contain more than 10 errors.
 *     - Indicates a low but realistic barrier count; useful reference for comparison.
 *
 *   30 errors (medium-error fixture, PRIMARY FOR THIS STUDY):
 *     - Martins & Duarte (2016): average of 30 accessibility errors per page.
 *     - Directly aligns with empirical mean; provides best representation of typical page.
 *     - This is the baseline for Study 6 because it captures the most common real-world scenario.
 *
 *   50 errors (high-error fixture):
 *     - Fernandes et al. (2019): average of 51 errors in homepage accessibility audits (WAVE).
 *     - Represents sites with significant accessibility barriers; realistic upper bound for automated tools.
 *     - Helps assess tool performance when barriers are numerous and complex.
 *
 * REFERENCES
 * ──────────
 * [1] HTTP Archive. 2024. Web Almanac: HTML.
 *     https://almanac.httparchive.org/en/2024/page-weight
 * [2] Martins, J., & Duarte, C. (2016). Web accessibility assessment: A methodology for large-scale
 *     analysis. In Proceedings of the 18th International ACM SIGACCESS Conference on Computers and
 *     Accessibility (pp. 143–152). ACM.
 * [3] Fernandes, M. S., et al. (2019). Automatic web accessibility evaluation: A systematic literature
 *     review. Journal of Web Engineering, 18(6), 501–544.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Study6Fixture {
  name: string;
  filePath: string;
  sourceType: 'html' | 'css' | 'js' | 'tsx';
  runBrowserAudits: boolean;
  errorCount: number;
  htmlSize: string;
  cssSize: string;
  jsSize: string;
  description: string;
}

/**
 * Define the fixtures for Study 6 comparison.
 * Using study-6 custom fixtures with specified complexity levels.
 */
export const STUDY_6_FIXTURES: Study6Fixture[] = [
  {
    name: 'study-6-html-medium',
    filePath: path.join(__dirname, 'fixtures/study-6-html-medium.html'),
    sourceType: 'html',
    runBrowserAudits: true,
    errorCount: 30,
    htmlSize: '32.5 kB',
    cssSize: '70 kB',
    jsSize: '485 kB',
    description: 'HTML fixture test (AI + Lighthouse + axe-core).',
  },
  {
    name: 'study-6-css-medium',
    filePath: path.join(__dirname, 'fixtures/study-6-css-medium.css'),
    sourceType: 'css',
    runBrowserAudits: true,
    errorCount: 30,
    htmlSize: '32.5 kB',
    cssSize: '70 kB',
    jsSize: '485 kB',
    description: 'CSS fixture test (AI + browser audits + source linters).',
  },
  {
    name: 'study-6-js-medium',
    filePath: path.join(__dirname, 'fixtures/study-6-js-medium.js'),
    sourceType: 'js',
    runBrowserAudits: true,
    errorCount: 30,
    htmlSize: '32.5 kB',
    cssSize: '70 kB',
    jsSize: '485 kB',
    description: 'JavaScript fixture test (AI + browser audits + source linters).',
  },
  {
    name: 'study-6-tsx-medium',
    filePath: path.join(__dirname, 'fixtures/study-6-tsx-medium.tsx'),
    sourceType: 'tsx',
    runBrowserAudits: false,
    errorCount: 30,
    htmlSize: '32.5 kB',
    cssSize: '70 kB',
    jsSize: '485 kB',
    description: 'TSX fixture test (AI + source linters; browser audits skipped for fairness).',
  },
];

/**
 * Extract fixture by name.
 */
export function getFixture(name: string): Study6Fixture | undefined {
  return STUDY_6_FIXTURES.find(f => f.name === name);
}

/**
 * Load raw HTML from fixture file.
 */
export function loadFixtureContent(fixture: Study6Fixture): string {
  try {
    return fs.readFileSync(fixture.filePath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to load fixture ${fixture.name}: ${err}`);
  }
}

/**
 * Get all fixture names.
 */
export function getAllFixtureNames(): string[] {
  return STUDY_6_FIXTURES.map(f => f.name);
}
