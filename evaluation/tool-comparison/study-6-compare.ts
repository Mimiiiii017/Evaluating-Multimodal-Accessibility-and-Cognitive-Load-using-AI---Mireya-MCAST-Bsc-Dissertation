/**
 * study-6-compare.ts — Study 6: Tool Alignment Analysis
 *
 * Compares accessibility findings across three tools:
 *   1. AI Accessibility Assistant (source-level analysis)
 *   2. Google Lighthouse (rendered DOM analysis)
 *   3. Deque axe-core (rendered DOM analysis)
 *
 * Findings are mapped by issue category and classified as:
 *   • SHARED: Reported by 2+ tools (high-confidence violations)
 *   • AI_ONLY: Reported only by AI system (passed to expert review)
 *   • TOOL_ONLY: Reported by Lighthouse/axe-core only (potential recall gaps for AI)
 *   • MISSED: Not reported by any tool (ground truth gap or tool limitation)
 *
 * ALIGNMENT METHODOLOGY
 * ─────────────────────
 * For each fixture:
 *   1. Collect findings from all three tools using their native output formats.
 *   2. Normalize findings to a canonical issue representation:
 *      - WCAG criterion (e.g., 1.1.1, 2.4.4)
 *      - Issue type (e.g., "missing alt", "missing label", "low contrast")
 *      - Element selector or line reference
 *   3. Cross-reference findings by WCAG criterion and issue type.
 *   4. Categorize alignment:
 *      - Shared findings → high-confidence
 *      - AI-only findings → expert review
 *      - Lighthouse/axe-core only → AI recall analysis
 *   5. Generate alignment matrix and summary statistics.
 *
 * OUTPUT
 * ──────
 * study-6-results.json:
 *   {
 *     "metadata": { fixture, aiModel, timestamp },
 *     "toolOutputs": { ai, lighthouse, axeCore },
 *     "alignmentMatrix": [ { wcag, issueType, aiFinds, lighthouseFinds, axeCoreFinds, classification } ],
 *     "statistics": {
 *       "totalShared": N,
 *       "totalAiOnly": N,
 *       "totalToolOnly": N,
 *       "agreementRate": %,
 *       "recallGaps": N
 *     }
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ToolFinding {
  wcag: string; // e.g., "1.1.1", "2.4.4"
  issueType: string; // e.g., "missing alt", "missing label"
  severity: 'error' | 'warning' | 'notice';
  description: string;
  element?: string; // selector or line reference
  toolSource: 'ai' | 'lighthouse' | 'axeCore' | 'axeLinter' | 'eslintJsxA11y' | 'webhint' | 'stylelintA11y';
}

export interface AlignmentRow {
  wcag: string;
  issueType: string;
  aiFinds: boolean;
  lighthouseFinds: boolean;
  aXeFinds: boolean;
  axeLinterFinds: boolean;
  eslintJsxA11yFinds: boolean;
  webhintFinds: boolean;
  stylelintA11yFinds: boolean;
  classification: 'SHARED' | 'AI_ONLY' | 'TOOL_ONLY' | 'LIGHTHOUSE_ONLY' | 'AXE_ONLY' | 'SUPPLEMENTARY_ONLY';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
}

export interface Study6Comparison {
  metadata: {
    fixture: string;
    errorCount: number;
    timestamp: string;
    aiModel: string;
  };
  toolOutputs: {
    ai: ToolFinding[];
    lighthouse: ToolFinding[];
    axeCore: ToolFinding[];
    axeLinter: ToolFinding[] | null;
    eslintJsxA11y: ToolFinding[] | null;
    webhint: ToolFinding[] | null;
    stylelintA11y: ToolFinding[] | null;
  };
  alignmentMatrix: AlignmentRow[];
  statistics: {
    totalUnique: number;
    totalShared: number;
    totalAiOnly: number;
    totalLighthouseOnly: number;
    totalAxeCoreOnly: number;
    totalAxeLinterOnly: number;
    totalEslintJsxA11yOnly: number;
    totalWebhintOnly: number;
    totalStylelintA11yOnly: number;
    sharedPercentage: number;
    recallGaps: number;
    // Backward-compatible aliases used by ad-hoc reporting scripts.
    aiFindings: number;
    lighthouseFindings: number;
    axeFindings: number;
    axeLinterFindings: number;
    eslintFindings: number;
    webhintFindings: number;
    stylelintFindings: number;
    totalUniqueIssues: number;
    sharedFindings: number;
    aiOnly: number;
    aiRecallGaps: number;
    perToolCounts: {
      ai: number;
      lighthouse: number;
      axeCore: number;
      axeLinter: number | null;
      eslintJsxA11y: number | null;
      webhint: number | null;
      stylelintA11y: number | null;
    };
  };
}

/**
 * Classify a finding based on which tools reported it.
 * Core tools: AI, Lighthouse, axe-core.
 * Supplementary tools: axeLinter, eslintJsxA11y, webhint, stylelintA11y.
 */
function classifyAlignment(row: AlignmentRow): string {
  const coreReported = [row.aiFinds, row.lighthouseFinds, row.aXeFinds].filter(x => x).length;
  const suppReported = [row.axeLinterFinds, row.eslintJsxA11yFinds, row.webhintFinds, row.stylelintA11yFinds].filter(x => x).length;
  const anyCore = coreReported > 0;
  const anySupp = suppReported > 0;

  // Two or more core tools agree — or AI + at least one other tool
  if (coreReported >= 2 || (row.aiFinds && (anyCore || anySupp))) {
    if (coreReported >= 2) return 'SHARED';
  }

  if (row.aiFinds && !row.lighthouseFinds && !row.aXeFinds) {
    return 'AI_ONLY';
  }

  if (row.lighthouseFinds && !row.aiFinds && !row.aXeFinds) {
    return 'LIGHTHOUSE_ONLY';
  }

  if (row.aXeFinds && !row.aiFinds && !row.lighthouseFinds) {
    return 'AXE_ONLY';
  }

  if (!anyCore && anySupp) {
    return 'SUPPLEMENTARY_ONLY';
  }

  return 'TOOL_ONLY';
}

/**
 * Assign confidence level based on agreement.
 *   HIGH: 2+ tools agree, or AI + one tool
 *   MEDIUM: single tool finds it, with plausible reason
 *   LOW: disagreement or ambiguous categorisation
 */
function assignConfidence(row: AlignmentRow): AlignmentRow['confidence'] {
  const allTools = [
    row.aiFinds, row.lighthouseFinds, row.aXeFinds,
    row.axeLinterFinds, row.eslintJsxA11yFinds, row.webhintFinds, row.stylelintA11yFinds,
  ];
  const reported = allTools.filter(x => x).length;

  if (reported >= 3) return 'HIGH';
  if (reported === 2) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build alignment matrix from all 7 tool findings.
 */
export function buildAlignmentMatrix(
  aiFindings: ToolFinding[],
  lighthouseFindings: ToolFinding[],
  axeCoreFindings: ToolFinding[],
  axeLinterFindings: ToolFinding[] | null = null,
  eslintJsxA11yFindings: ToolFinding[] | null = null,
  webhintFindings: ToolFinding[] | null = null,
  stylelintA11yFindings: ToolFinding[] | null = null,
): AlignmentRow[] {
  const resultMap = new Map<string, AlignmentRow>();

  // Helper to create unique key for grouping
  const getKey = (wcag: string, issueType: string) => `${wcag}::${issueType}`;

  // Seed from all 7 tool findings
  const allFindings = [
    ...aiFindings, ...lighthouseFindings, ...axeCoreFindings,
    ...(axeLinterFindings ?? []), ...(eslintJsxA11yFindings ?? []), ...(webhintFindings ?? []), ...(stylelintA11yFindings ?? []),
  ];
  allFindings.forEach(finding => {
    const key = getKey(finding.wcag, finding.issueType);
    if (!resultMap.has(key)) {
      resultMap.set(key, {
        wcag: finding.wcag,
        issueType: finding.issueType,
        aiFinds: false,
        lighthouseFinds: false,
        aXeFinds: false,
        axeLinterFinds: false,
        eslintJsxA11yFinds: false,
        webhintFinds: false,
        stylelintA11yFinds: false,
        classification: 'TOOL_ONLY',
        confidence: 'LOW',
        notes: '',
      });
    }
  });

  // Mark what each tool found
  const mark = (findings: ToolFinding[], field: keyof AlignmentRow) => {
    findings.forEach(f => {
      const row = resultMap.get(getKey(f.wcag, f.issueType));
      if (row) (row as any)[field] = true;
    });
  };

  mark(aiFindings, 'aiFinds');
  mark(lighthouseFindings, 'lighthouseFinds');
  mark(axeCoreFindings, 'aXeFinds');
  if (axeLinterFindings) mark(axeLinterFindings, 'axeLinterFinds');
  if (eslintJsxA11yFindings) mark(eslintJsxA11yFindings, 'eslintJsxA11yFinds');
  if (webhintFindings) mark(webhintFindings, 'webhintFinds');
  if (stylelintA11yFindings) mark(stylelintA11yFindings, 'stylelintA11yFinds');

  // Classify and assign confidence
  const rows = Array.from(resultMap.values());
  rows.forEach(row => {
    row.classification = classifyAlignment(row) as any;
    row.confidence = assignConfidence(row);
  });

  return rows;
}

/**
 * Calculate summary statistics.
 */
export function calculateStatistics(
  alignmentMatrix: AlignmentRow[],
  allToolFindings: {
    ai: ToolFinding[];
    lighthouse: ToolFinding[];
    axeCore: ToolFinding[];
    axeLinter: ToolFinding[] | null;
    eslintJsxA11y: ToolFinding[] | null;
    webhint: ToolFinding[] | null;
    stylelintA11y: ToolFinding[] | null;
  },
): Study6Comparison['statistics'] {
  const total = alignmentMatrix.length;
  const shared = alignmentMatrix.filter(r => r.classification === 'SHARED').length;
  const aiOnly = alignmentMatrix.filter(r => r.classification === 'AI_ONLY').length;
  const lighthouseOnly = alignmentMatrix.filter(r => r.classification === 'LIGHTHOUSE_ONLY').length;
  const axeCoreOnly = alignmentMatrix.filter(r => r.classification === 'AXE_ONLY').length;
  const axeLinterOnly = alignmentMatrix.filter(
    r => r.axeLinterFinds && !r.aiFinds && !r.lighthouseFinds && !r.aXeFinds,
  ).length;
  const eslintOnly = alignmentMatrix.filter(
    r => r.eslintJsxA11yFinds && !r.aiFinds && !r.lighthouseFinds && !r.aXeFinds,
  ).length;
  const webhintOnly = alignmentMatrix.filter(
    r => r.webhintFinds && !r.aiFinds && !r.lighthouseFinds && !r.aXeFinds,
  ).length;
  const stylelintOnly = alignmentMatrix.filter(
    r => r.stylelintA11yFinds && !r.aiFinds && !r.lighthouseFinds && !r.aXeFinds,
  ).length;

  // Recall gaps: issues caught by any tool but NOT by AI
  const recallGaps = alignmentMatrix.filter(r => !r.aiFinds).length;

  return {
    totalUnique: total,
    totalShared: shared,
    totalAiOnly: aiOnly,
    totalLighthouseOnly: lighthouseOnly,
    totalAxeCoreOnly: axeCoreOnly,
    totalAxeLinterOnly: axeLinterOnly,
    totalEslintJsxA11yOnly: eslintOnly,
    totalWebhintOnly: webhintOnly,
    totalStylelintA11yOnly: stylelintOnly,
    sharedPercentage: total > 0 ? Math.round((shared / total) * 100) : 0,
    recallGaps,
    aiFindings: allToolFindings.ai.length,
    lighthouseFindings: allToolFindings.lighthouse.length,
    axeFindings: allToolFindings.axeCore.length,
    axeLinterFindings: allToolFindings.axeLinter !== null ? allToolFindings.axeLinter.length : 0,
    eslintFindings: allToolFindings.eslintJsxA11y !== null ? allToolFindings.eslintJsxA11y.length : 0,
    webhintFindings: allToolFindings.webhint !== null ? allToolFindings.webhint.length : 0,
    stylelintFindings: allToolFindings.stylelintA11y !== null ? allToolFindings.stylelintA11y.length : 0,
    totalUniqueIssues: total,
    sharedFindings: shared,
    aiOnly,
    aiRecallGaps: recallGaps,
    perToolCounts: {
      ai: allToolFindings.ai.length,
      lighthouse: allToolFindings.lighthouse.length,
      axeCore: allToolFindings.axeCore.length,
      axeLinter: allToolFindings.axeLinter !== null ? allToolFindings.axeLinter.length : null,
      eslintJsxA11y: allToolFindings.eslintJsxA11y !== null ? allToolFindings.eslintJsxA11y.length : null,
      webhint: allToolFindings.webhint !== null ? allToolFindings.webhint.length : null,
      stylelintA11y: allToolFindings.stylelintA11y !== null ? allToolFindings.stylelintA11y.length : null,
    },
  };
}

/**
 * Create a comparison report object.
 */
export function createComparisonReport(
  fixture: string,
  errorCount: number,
  aiModel: string,
  aiFindings: ToolFinding[],
  lighthouseFindings: ToolFinding[],
  axeCoreFindings: ToolFinding[],
  supplementaryToolOutputs?: {
    axeLinter: ToolFinding[] | null;
    eslintJsxA11y: ToolFinding[] | null;
    webhint: ToolFinding[] | null;
    stylelintA11y: ToolFinding[] | null;
  },
): Study6Comparison {
  const axeLinter = supplementaryToolOutputs?.axeLinter ?? null;
  const eslintJsxA11y = supplementaryToolOutputs?.eslintJsxA11y ?? null;
  const webhint = supplementaryToolOutputs?.webhint ?? null;
  const stylelintA11y = supplementaryToolOutputs?.stylelintA11y ?? null;

  const alignmentMatrix = buildAlignmentMatrix(
    aiFindings, lighthouseFindings, axeCoreFindings,
    axeLinter, eslintJsxA11y, webhint, stylelintA11y,
  );

  const allToolFindings = {
    ai: aiFindings,
    lighthouse: lighthouseFindings,
    axeCore: axeCoreFindings,
    axeLinter,
    eslintJsxA11y,
    webhint,
    stylelintA11y,
  };

  const statistics = calculateStatistics(alignmentMatrix, allToolFindings);

  return {
    metadata: {
      fixture,
      errorCount,
      timestamp: new Date().toISOString(),
      aiModel,
    },
    toolOutputs: allToolFindings,
    alignmentMatrix,
    statistics,
  };
}

/**
 * Save comparison report to JSON.
 */
export function saveComparisonReport(report: Study6Comparison, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[Study 6] Saved comparison report: ${outputPath}`);
}

/**
 * Print alignment matrix to stdout.
 */
export function printAlignmentMatrix(report: Study6Comparison): void {
  console.log(`\n=== Study 6 Tool Alignment: ${report.metadata.fixture} (${report.metadata.errorCount} errors) ===\n`);
  
  console.log('WCAG\tIssue Type\t\t\tAI\tLH\tAxe\tLint\tESLint\tHint\tStylel.\tClassification\tConf.');
  console.log('─'.repeat(130));

  report.alignmentMatrix.forEach(row => {
    const ai   = row.aiFinds             ? '✓' : ' ';
    const lh   = row.lighthouseFinds     ? '✓' : ' ';
    const axe  = row.aXeFinds            ? '✓' : ' ';
    const lint = row.axeLinterFinds      ? '✓' : ' ';
    const esl  = row.eslintJsxA11yFinds  ? '✓' : ' ';
    const hint = row.webhintFinds        ? '✓' : ' ';
    const styl = row.stylelintA11yFinds  ? '✓' : ' ';
    console.log(
      `${row.wcag}\t${row.issueType.padEnd(30)}\t${ai}\t${lh}\t${axe}\t${lint}\t${esl}\t${hint}\t${styl}\t${row.classification.padEnd(20)}\t${row.confidence}`,
    );
  });

  const s = report.statistics;
  console.log('\n=== STATISTICS ===');
  console.log(`Total unique issues: ${s.totalUnique}`);
  console.log(`Shared findings (2+ core tools): ${s.totalShared} (${s.sharedPercentage}%)`);
  console.log(`AI recall gaps (not found by AI): ${s.recallGaps}`);
  console.log('');
  console.log('=== PER-TOOL FINDING COUNTS ===');
  console.log(`AI:               ${s.perToolCounts.ai}`);
  console.log(`Lighthouse:       ${s.perToolCounts.lighthouse}`);
  console.log(`axe-core:         ${s.perToolCounts.axeCore}`);
  const fmt = (v: number | null) => v === null ? 'N/A' : String(v);
  console.log(`Axe Linter (CLI): ${fmt(s.perToolCounts.axeLinter)}`);
  console.log(`ESLint jsx-a11y:  ${fmt(s.perToolCounts.eslintJsxA11y)}`);
  console.log(`Webhint:          ${fmt(s.perToolCounts.webhint)}`);
  console.log(`stylelint-a11y:   ${fmt(s.perToolCounts.stylelintA11y)}`);
  console.log('');
  console.log('=== TOOL-EXCLUSIVE FINDINGS ===');
  console.log(`AI-only:          ${s.totalAiOnly}`);
  console.log(`Lighthouse-only:  ${s.totalLighthouseOnly}`);
  console.log(`axe-core-only:    ${s.totalAxeCoreOnly}`);
  console.log(`Axe Linter-only:  ${s.totalAxeLinterOnly}`);
  console.log(`ESLint-only:      ${s.totalEslintJsxA11yOnly}`);
  console.log(`Webhint-only:     ${s.totalWebhintOnly}`);
  console.log(`stylelint-only:   ${s.totalStylelintA11yOnly}\n`);
}
