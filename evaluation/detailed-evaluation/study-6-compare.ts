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
  toolSource: 'ai' | 'lighthouse' | 'axeCore';
}

export interface AlignmentRow {
  wcag: string;
  issueType: string;
  aiFinds: boolean;
  lighthouseFinds: boolean;
  aXeFinds: boolean;
  classification: 'SHARED' | 'AI_ONLY' | 'TOOL_ONLY' | 'LIGHTHOUSE_ONLY' | 'AXE_ONLY';
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
  };
  alignmentMatrix: AlignmentRow[];
  statistics: {
    totalUnique: number;
    totalShared: number;
    totalAiOnly: number;
    totalLighthouseOnly: number;
    totalAxeCoreOnly: number;
    sharedPercentage: number;
    recallGaps: number;
  };
}

/**
 * Classify how many tools reported each finding.
 */
function classifyAlignment(row: AlignmentRow): string {
  const reported = [row.aiFinds, row.lighthouseFinds, row.aXeFinds].filter(x => x).length;
  
  if (reported === 2 || reported === 3) {
    return 'SHARED';
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
  
  return 'TOOL_ONLY'; // fallback for multi-tool (non-AI)
}

/**
 * Assign confidence level based on agreement.
 *   HIGH: 2+ tools agree, or AI + one tool
 *   MEDIUM: single tool finds it, with plausible reason
 *   LOW: disagreement or ambiguous categorisation
 */
function assignConfidence(row: AlignmentRow): string {
  const reported = [row.aiFinds, row.lighthouseFinds, row.aXeFinds].filter(x => x).length;
  
  if (reported >= 2) {
    return 'HIGH';
  }
  if (reported === 1) {
    return 'LOW'; // Single tool reports → lower confidence without corroboration
  }
  
  return 'LOW';
}

/**
 * Build alignment matrix from tool findings.
 */
export function buildAlignmentMatrix(
  aiFindings: ToolFinding[],
  lighthouseFindings: ToolFinding[],
  axeCoreFindings: ToolFinding[],
): AlignmentRow[] {
  const resultMap = new Map<string, AlignmentRow>();
  
  // Helper to create unique key for grouping
  const getKey = (wcag: string, issueType: string) => `${wcag}::${issueType}`;
  
  // Collect all findings
  [...aiFindings, ...lighthouseFindings, ...axeCoreFindings].forEach(finding => {
    const key = getKey(finding.wcag, finding.issueType);
    if (!resultMap.has(key)) {
      resultMap.set(key, {
        wcag: finding.wcag,
        issueType: finding.issueType,
        aiFinds: false,
        lighthouseFinds: false,
        aXeFinds: false,
        classification: 'TOOL_ONLY',
        confidence: 'LOW',
        notes: '',
      });
    }
  });
  
  // Mark what each tool found
  aiFindings.forEach(f => {
    const row = resultMap.get(getKey(f.wcag, f.issueType));
    if (row) row.aiFinds = true;
  });
  lighthouseFindings.forEach(f => {
    const row = resultMap.get(getKey(f.wcag, f.issueType));
    if (row) row.lighthouseFinds = true;
  });
  axeCoreFindings.forEach(f => {
    const row = resultMap.get(getKey(f.wcag, f.issueType));
    if (row) row.aXeFinds = true;
  });
  
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
export function calculateStatistics(alignmentMatrix: AlignmentRow[]): Study6Comparison['statistics'] {
  const total = alignmentMatrix.length;
  const shared = alignmentMatrix.filter(r => r.classification === 'SHARED').length;
  const aiOnly = alignmentMatrix.filter(r => r.classification === 'AI_ONLY').length;
  const lighthouseOnly = alignmentMatrix.filter(r => r.classification === 'LIGHTHOUSE_ONLY').length;
  const axeCoreOnly = alignmentMatrix.filter(r => r.classification === 'AXE_ONLY').length;
  const recallGaps = lighthouseOnly + axeCoreOnly; // Issues AI missed
  
  return {
    totalUnique: total,
    totalShared: shared,
    totalAiOnly: aiOnly,
    totalLighthouseOnly: lighthouseOnly,
    totalAxeCoreOnly: axeCoreOnly,
    sharedPercentage: total > 0 ? Math.round((shared / total) * 100) : 0,
    recallGaps: recallGaps,
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
): Study6Comparison {
  const alignmentMatrix = buildAlignmentMatrix(aiFindings, lighthouseFindings, axeCoreFindings);
  const statistics = calculateStatistics(alignmentMatrix);
  
  return {
    metadata: {
      fixture,
      errorCount,
      timestamp: new Date().toISOString(),
      aiModel,
    },
    toolOutputs: {
      ai: aiFindings,
      lighthouse: lighthouseFindings,
      axeCore: axeCoreFindings,
    },
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
  
  console.log('WCAG\tIssue Type\t\t\tAI\tLH\tAxe\tClassification\tConfidence');
  console.log('─'.repeat(110));
  
  report.alignmentMatrix.forEach(row => {
    const ai = row.aiFinds ? '✓' : ' ';
    const lh = row.lighthouseFinds ? '✓' : ' ';
    const axe = row.aXeFinds ? '✓' : ' ';
    console.log(
      `${row.wcag}\t${row.issueType.padEnd(30)}\t${ai}\t${lh}\t${axe}\t${row.classification.padEnd(15)}\t${row.confidence}`,
    );
  });
  
  console.log('\n=== STATISTICS ===');
  console.log(`Total unique issues: ${report.statistics.totalUnique}`);
  console.log(`Shared findings: ${report.statistics.totalShared} (${report.statistics.sharedPercentage}%)`);
  console.log(`AI-only findings: ${report.statistics.totalAiOnly}`);
  console.log(`Lighthouse-only: ${report.statistics.totalLighthouseOnly}`);
  console.log(`axe-core-only: ${report.statistics.totalAxeCoreOnly}`);
  console.log(`Potential recall gaps (AI missed): ${report.statistics.recallGaps}\n`);
}
