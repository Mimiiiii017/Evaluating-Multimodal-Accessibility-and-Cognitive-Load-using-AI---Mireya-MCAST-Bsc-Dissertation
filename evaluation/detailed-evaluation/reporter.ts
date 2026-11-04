/**
 * reporter.ts  —  LLM Benchmark Reporter
 *
 * Renders three views:
 *   1. OVERALL RANKING — composite score (80 % F1 + 20 % speed), plus raw metrics
 *   2. DETAIL BY FIXTURE — how each model performed on each file
 *   3. FALSE POSITIVE ANALYSIS — what each model hallucinated on clean files
 *   4. FALSE NEGATIVE ANALYSIS — which real issues every model consistently missed
 *
 * Also writes JSON (full data) and CSV (summary) to disk.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ModelRunResult,
  ModelAggregateStats,
  aggregateByModel,
  applyCompositeScores,
  percentile,
  shortName,
  computeParetoFrontier,
  computeVulnerabilityAnalysis,
} from '../benchmark/benchmark';
import { AnalysisPresetId, ANALYSIS_PRESETS } from
  '../../extension/ai-accessibility-assistant/src/utils/llm/ollama';

// ─── ANSI helpers ─────────────────────────────────────────────────────────

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  green:   '\x1b[32m',
  bgreen:  '\x1b[92m',  // bright green
  yellow:  '\x1b[33m',
  byellow: '\x1b[93m',  // bright yellow
  red:     '\x1b[31m',
  bred:    '\x1b[91m',  // bright red
  cyan:    '\x1b[36m',
  bcyan:   '\x1b[96m',  // bright cyan
  magenta: '\x1b[35m',
  bmagenta:'\x1b[95m',
  white:   '\x1b[37m',
  bwhite:  '\x1b[97m',
  bg: {
    dark:  '\x1b[48;5;236m',
    green: '\x1b[48;5;22m',
    reset: '\x1b[49m',
  },
};

const W = 110; // report width

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function ms(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${Math.round(n)}ms`;
}

function pad(s: string | number, w: number, left = false): string {
  const str = String(s);
  const diff = w - str.length;
  if (diff <= 0) return str;
  return left ? str + ' '.repeat(diff) : ' '.repeat(diff) + str;
}

/** pad that accounts for invisible ANSI escape sequences */
function padAnsi(s: string, w: number, left = false): string {
  // eslint-disable-next-line no-control-regex
  const visible = s.replace(/\x1b\[[0-9;]*m/g, '').length;
  const diff = w - visible;
  if (diff <= 0) return s;
  return left ? s + ' '.repeat(diff) : ' '.repeat(diff) + s;
}

function hr(char = '─', width = W): string {
  return char.repeat(width);
}

/** Full-width section banner */
function section(title: string): void {
  console.log('');
  const inner = `  ${title}  `;
  const padW  = Math.max(0, W - inner.length);
  const left  = Math.floor(padW / 2);
  const right = padW - left;
  console.log(C.bold + C.bcyan + '▐' + '░'.repeat(left) + inner + '░'.repeat(right) + '▌' + C.reset);
  console.log('');
}

/** Thin rule with optional label */
function rule(label = '', char = '─'): void {
  if (!label) { console.log(C.dim + hr(char) + C.reset); return; }
  const side = Math.max(0, Math.floor((W - label.length - 2) / 2));
  console.log(C.dim + char.repeat(side) + ' ' + label + ' ' + char.repeat(Math.max(0, W - side - label.length - 2)) + C.reset);
}

const MEDALS = ['🥇', '🥈', '🥉'];
function medal(rank: number): string {
  return MEDALS[rank] ?? ` ${rank + 1}.`;
}

function scoreBar(score: number, width = 16): string {
  const filled = Math.max(0, Math.min(width, Math.round(score * width)));
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const col = score >= 0.7 ? C.bgreen : score >= 0.5 ? C.byellow : C.bred;
  return col + bar + C.reset;
}

/** Draws a box around an array of pre-formatted lines */
function box(lines: string[], title = ''): void {
  const innerW = W - 4; // 2 border chars + 2 spaces padding each side
  const top = title
    ? `╔══ ${C.bold}${title}${C.reset}${C.dim} ${'═'.repeat(Math.max(0, innerW - title.length - 4))}╗${C.reset}`
    : C.dim + '╔' + '═'.repeat(innerW + 2) + '╗' + C.reset;
  console.log('  ' + top);
  for (const line of lines) {
    // eslint-disable-next-line no-control-regex
    const visLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
    const pad2   = Math.max(0, innerW - visLen);
    console.log('  ' + C.dim + '║' + C.reset + ' ' + line + ' '.repeat(pad2) + ' ' + C.dim + '║' + C.reset);
  }
  console.log('  ' + C.dim + '╚' + '═'.repeat(innerW + 2) + '╝' + C.reset);
}

// ─── Main report ──────────────────────────────────────────────────────────

export function printReport(
  results: ModelRunResult[],
  models: string[],
  presetId: AnalysisPresetId
): void {
  const rawStats = models.map(m => aggregateByModel(results, m, presetId));
  const stats = applyCompositeScores(rawStats);
  const ranked = [...stats].sort((a, b) => b.compositeScore - a.compositeScore);
  const presetLabel = ANALYSIS_PRESETS[presetId]?.label ?? presetId;
  const runsPerCombo = results.filter(
    r => r.modelId === models[0] && r.fixtureId === results[0]?.fixtureId
  ).length;
  const now = new Date().toLocaleString();

  // ╔══════════════════════════════════════════════════════════╗
  // ║  HEADER                                                  ║
  // ╚══════════════════════════════════════════════════════════╝
  console.log('');
  console.log(C.bold + C.bcyan + '╔' + '═'.repeat(W - 2) + '╗' + C.reset);
  const title = 'Cloud-LLM-Preliminary  ·  Accessibility Auditing Quality';
  const titlePad = Math.max(0, W - 4 - title.length);
  console.log(C.bold + C.bcyan + '║' + C.reset + C.bold + C.bwhite + '  ' + title + ' '.repeat(titlePad) + '  ' + C.bcyan + '║' + C.reset);
  console.log(C.bold + C.bcyan + '╠' + '═'.repeat(W - 2) + '╣' + C.reset);

  const meta = [
    `${C.dim}Preset${C.reset}   ${C.cyan}${presetLabel}${C.reset}  ${C.dim}(fixed — only model differs)${C.reset}`,
    `${C.dim}Models${C.reset}   ${C.bwhite}${models.length}${C.reset}`,
    `${C.dim}Runs/combo${C.reset} ${C.bwhite}${runsPerCombo}${C.reset}`,
    `${C.dim}Scoring${C.reset}  ${C.bwhite}80% F1  +  20% speed${C.reset}  ${C.dim}(higher = better)${C.reset}`,
    `${C.dim}Run at${C.reset}   ${C.dim}${now}${C.reset}`,
  ];
  for (const line of meta) {
    // eslint-disable-next-line no-control-regex
    const vis = line.replace(/\x1b\[[0-9;]*m/g, '').length;
    console.log(C.bcyan + '║' + C.reset + '  ' + line + ' '.repeat(Math.max(0, W - 4 - vis)) + '  ' + C.bcyan + '║' + C.reset);
  }
  console.log(C.bold + C.bcyan + '╚' + '═'.repeat(W - 2) + '╝' + C.reset);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  OVERALL RANKING                                         ║
  // ╚══════════════════════════════════════════════════════════╝
  section('① OVERALL RANKING');

  // column widths
  const COL = { rank: 4, name: 32, score: 7, bar: 16, f1: 7, prec: 7, rec: 8, tp: 4, fn: 4, fp: 4, time: 8, err: 4 };

  const hdr = [
    pad('',          COL.rank),
    pad('Model',     COL.name, true),
    pad('Score',     COL.score),
    pad('',          COL.bar),
    pad('F1',        COL.f1),
    pad('Prec',      COL.prec),
    pad('Recall',    COL.rec),
    pad('TP', COL.tp), pad('FN', COL.fn), pad('FP', COL.fp),
    pad('AvgTime',   COL.time),
    pad('Err', COL.err),
  ].join(' ');
  console.log('  ' + C.bold + hdr + C.reset);
  rule('', '─');
  console.log(`  ${C.dim}TP = correctly found issues  ·  FN = missed issues  ·  FP = hallucinated issues  ·  F1 = harmonic mean of Prec & Recall${C.reset}`);
  console.log('');

  for (let i = 0; i < ranked.length; i++) {
    const s   = ranked[i];
    const name = shortName(s.modelId);
    const rowBg  = i === 0 ? C.bg.dark : '';
    const f1Col  = s.avgF1 >= 0.7 ? C.bgreen : s.avgF1 >= 0.5 ? C.byellow : C.bred;
    const fpCol  = s.totalFP === 0 ? C.bgreen : s.totalFP <= 3 ? C.byellow : C.bred;
    const fnCol  = s.totalFN === 0 ? C.bgreen : s.totalFN <= 3 ? C.byellow : C.bred;
    const row = [
      pad(medal(i), COL.rank),
      padAnsi(C.bwhite + pad(name, COL.name, true) + C.reset, COL.name, true),
      pad(pct(s.compositeScore), COL.score),
      scoreBar(s.compositeScore, COL.bar),
      f1Col  + pad(pct(s.avgF1),        COL.f1)   + C.reset,
               pad(pct(s.avgPrecision), COL.prec),
               pad(pct(s.avgRecall),    COL.rec),
      C.bgreen + pad(s.totalTP, COL.tp) + C.reset,
      fnCol  + pad(s.totalFN, COL.fn) + C.reset,
      fpCol  + pad(s.totalFP, COL.fp) + C.reset,
               pad(ms(s.avgResponseMs), COL.time),
      s.errorCount > 0 ? C.bred + pad(s.errorCount, COL.err) + C.reset : C.dim + pad(0, COL.err) + C.reset,
    ].join(' ');
    console.log('  ' + rowBg + row + C.bg.reset);
    if (i === 2 && ranked.length > 3) console.log('  ' + C.dim + '·'.repeat(W - 2) + C.reset);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  HIGHLIGHTS                                              ║
  // ╚══════════════════════════════════════════════════════════╝
  const best        = ranked[0];
  const bestF1      = ranked.reduce((a, b) => a.avgF1       > b.avgF1       ? a : b);
  const bestAcc     = ranked.reduce((a, b) => a.avgAccuracy > b.avgAccuracy ? a : b);
  const bestMCC     = ranked.reduce((a, b) => a.avgMCC      > b.avgMCC      ? a : b);
  const bestSpeed   = ranked.filter(s => s.avgResponseMs > 0).reduce((a, b) => a.avgResponseMs < b.avgResponseMs ? a : b);
  const fewestFP    = ranked.reduce((a, b) => a.totalFP < b.totalFP ? a : b);
  const fewestFN    = ranked.reduce((a, b) => a.totalFN < b.totalFN ? a : b);
  const mostConsist = ranked.filter(s => s.f1StdDev >= 0).reduce((a, b) => a.f1StdDev < b.f1StdDev ? a : b);

  section('② HIGHLIGHTS');

  const hlLines = [
    `  🏆  ${C.bold}Best overall${C.reset}         ${C.bgreen}${shortName(best.modelId)}${C.reset}   composite=${C.bold}${pct(best.compositeScore)}${C.reset}`,
    `  🎯  ${C.bold}Best F1 (accuracy)${C.reset}   ${C.bcyan}${shortName(bestF1.modelId)}${C.reset}   F1=${pct(bestF1.avgF1)}`,
    `  📊  ${C.bold}Best overall Acc${C.reset}     ${C.bcyan}${shortName(bestAcc.modelId)}${C.reset}   Acc=${pct(bestAcc.avgAccuracy)}`,
    `  🔬  ${C.bold}Best MCC${C.reset}             ${C.bcyan}${shortName(bestMCC.modelId)}${C.reset}   MCC=${bestMCC.avgMCC.toFixed(3)}  ${C.dim}(Matthews Correlation Coefficient — closer to 1 is better)${C.reset}`,
    `  ⚡  ${C.bold}Fastest${C.reset}              ${C.bcyan}${shortName(bestSpeed.modelId)}${C.reset}   avg=${ms(bestSpeed.avgResponseMs)}  p95=${ms(bestSpeed.p95ResponseMs)}`,
    `  ✅  ${C.bold}Fewest hallucinations${C.reset} ${C.bcyan}${shortName(fewestFP.modelId)}${C.reset}   ${fewestFP.totalFP} false positive${fewestFP.totalFP !== 1 ? 's' : ''}`,
    `  🔍  ${C.bold}Fewest missed issues${C.reset} ${C.bcyan}${shortName(fewestFN.modelId)}${C.reset}   ${fewestFN.totalFN} false negative${fewestFN.totalFN !== 1 ? 's' : ''}`,
  ];
  if (mostConsist.f1StdDev > 0)
    hlLines.push(`  🎲  ${C.bold}Most consistent${C.reset}      ${C.bcyan}${shortName(mostConsist.modelId)}${C.reset}   F1 σ=${mostConsist.f1StdDev.toFixed(3)}`);

  box(hlLines, 'HIGHLIGHTS');

  // ╔══════════════════════════════════════════════════════════╗
  // ║  EXTENDED CONFUSION-MATRIX METRICS                      ║
  // ╚══════════════════════════════════════════════════════════╝
  section('③ EXTENDED METRICS  (confusion-matrix detail)');

  console.log(`  ${C.dim}TP = correctly found issues  ·  TN = correctly skipped non-issues  ·  FP = hallucinations  ·  FN = missed issues${C.reset}`);
  console.log(`  ${C.dim}Acc = overall accuracy  ·  BalAcc = (TPR+TNR)/2  ·  MCC = Matthews Correlation Coefficient (−1 worst · 0 random · +1 perfect)${C.reset}`);
  console.log(`  ${C.dim}Specif = specificity = TN/(TN+FP) i.e. how well the model avoids hallucinations  ·  NPV = TN/(TN+FN) i.e. how reliable a "no issue" verdict is${C.reset}`);
  console.log('');

  const EC = { rank: 4, name: 32, acc: 7, bal: 8, mcc: 7, spec: 8, npv: 7, tp: 5, tn: 6, fp: 5, fn: 5 };
  const ehdr = [
    pad('',          EC.rank),
    pad('Model',     EC.name, true),
    pad('Acc',       EC.acc),
    pad('BalAcc',    EC.bal),
    pad('MCC',       EC.mcc),
    pad('Specif',    EC.spec),
    pad('NPV',       EC.npv),
    pad('TP', EC.tp), pad('TN', EC.tn), pad('FP', EC.fp), pad('FN', EC.fn),
  ].join(' ');
  console.log('  ' + C.bold + ehdr + C.reset);
  rule('', '─');

  for (let i = 0; i < ranked.length; i++) {
    const s = ranked[i];
    const accCol = s.avgAccuracy >= 0.8 ? C.bgreen : s.avgAccuracy >= 0.6 ? C.byellow : C.bred;
    const mccCol = s.avgMCC     >= 0.6 ? C.bgreen : s.avgMCC     >= 0.3 ? C.byellow : C.bred;
    const fpCol  = s.totalFP === 0 ? C.bgreen : s.totalFP <= 3 ? C.byellow : C.bred;
    const fnCol  = s.totalFN === 0 ? C.bgreen : s.totalFN <= 3 ? C.byellow : C.bred;
    const erow = [
      pad(medal(i), EC.rank),
      padAnsi(C.bwhite + pad(shortName(s.modelId), EC.name, true) + C.reset, EC.name, true),
      accCol + pad(pct(s.avgAccuracy),       EC.acc)  + C.reset,
               pad(pct(s.avgBalancedAccuracy), EC.bal),
      mccCol + pad(s.avgMCC.toFixed(3),      EC.mcc)  + C.reset,
               pad(pct(s.avgSpecificity),    EC.spec),
               pad(pct(s.avgNPV),            EC.npv),
      C.bgreen + pad(s.totalTP, EC.tp) + C.reset,
      C.dim    + pad(s.totalTN, EC.tn) + C.reset,
      fpCol    + pad(s.totalFP, EC.fp) + C.reset,
      fnCol    + pad(s.totalFN, EC.fn) + C.reset,
    ].join(' ');
    console.log('  ' + erow);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  RESPONSE TIME ANALYSIS                                  ║
  // ╚══════════════════════════════════════════════════════════╝
  section('④ RESPONSE TIME');
  console.log(`  ${C.dim}Avg / Median (p50) / 95th-percentile across all successful runs${C.reset}`);
  console.log('');

  const TC = { rank: 4, name: 32, avg: 9, p50: 9, p95: 9, iss: 11 };
  const thdr = [
    pad('',         TC.rank),
    pad('Model',    TC.name, true),
    pad('Avg',      TC.avg),
    pad('p50',      TC.p50),
    pad('p95',      TC.p95),
    pad('Issues/run', TC.iss),
  ].join(' ');
  console.log('  ' + C.bold + thdr + C.reset);
  rule('', '─');

  const bySpeed = [...ranked].sort((a, b) => a.avgResponseMs - b.avgResponseMs);
  for (let i = 0; i < bySpeed.length; i++) {
    const s = bySpeed[i];
    const speedCol = i === 0 ? C.bgreen : i === bySpeed.length - 1 ? C.bred : C.reset;

    // Mini response-time bar (relative to slowest)
    const maxMs = bySpeed[bySpeed.length - 1].avgResponseMs || 1;
    const barW  = 12;
    const filled = Math.round((s.avgResponseMs / maxMs) * barW);
    const timeBar = (i === 0 ? C.bgreen : i === bySpeed.length - 1 ? C.bred : C.byellow)
      + '▓'.repeat(filled) + C.dim + '░'.repeat(barW - filled) + C.reset;

    const trow = [
      pad(` ${i + 1}.`, TC.rank),
      padAnsi(C.bwhite + pad(shortName(s.modelId), TC.name, true) + C.reset, TC.name, true),
      speedCol + pad(ms(s.avgResponseMs), TC.avg)  + C.reset,
               pad(ms(s.p50ResponseMs),  TC.p50),
               pad(ms(s.p95ResponseMs),  TC.p95),
               pad(s.avgIssuesFound.toFixed(1), TC.iss),
      timeBar,
    ].join(' ');
    console.log('  ' + trow);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  CONSISTENCY (only when runs > 1)                        ║
  // ╚══════════════════════════════════════════════════════════╝
  const hasMultipleRuns = results.some(
    r => results.filter(x => x.modelId === r.modelId && x.fixtureId === r.fixtureId).length > 1
  );
  if (hasMultipleRuns) {
    section('⑤ CONSISTENCY  (F1 across repeated runs)');
    console.log(`  ${C.dim}Lower σ = more reproducible.  Bar shows consistency: full █ = perfectly stable.${C.reset}`);
    console.log('');

    const CC = { rank: 4, name: 32, sd: 7, bar: 16, min: 8, max: 8 };
    const chdr = [pad('', CC.rank), pad('Model', CC.name, true), pad('F1 σ', CC.sd), pad('Consistency', CC.bar), pad('Min F1', CC.min), pad('Max F1', CC.max)].join(' ');
    console.log('  ' + C.bold + chdr + C.reset);
    rule('', '─');

    const byConsistency = [...ranked].sort((a, b) => a.f1StdDev - b.f1StdDev);
    for (let i = 0; i < byConsistency.length; i++) {
      const s    = byConsistency[i];
      const runs = results.filter(r => r.modelId === s.modelId && !r.errorOccurred);
      const f1s  = runs.map(r => r.f1);
      const minF1 = f1s.length ? Math.min(...f1s) : 0;
      const maxF1 = f1s.length ? Math.max(...f1s) : 0;
      const consistScore = 1 - Math.min(s.f1StdDev * 4, 1);
      const cCol = s.f1StdDev <= 0.05 ? C.bgreen : s.f1StdDev <= 0.15 ? C.byellow : C.bred;
      const crow = [
        pad(` ${i + 1}.`, CC.rank),
        padAnsi(C.bwhite + pad(shortName(s.modelId), CC.name, true) + C.reset, CC.name, true),
        cCol + pad(s.f1StdDev.toFixed(3), CC.sd) + C.reset,
        scoreBar(consistScore, CC.bar),
        pad(pct(minF1), CC.min),
        pad(pct(maxF1), CC.max),
      ].join(' ');
      console.log('  ' + crow);
    }
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  DETAIL BY FIXTURE                                       ║
  // ╚══════════════════════════════════════════════════════════╝
  const sectionNum = hasMultipleRuns ? '⑥' : '⑤';
  section(`${sectionNum} DETAIL BY FIXTURE`);

  const fixtureIds = [...new Set(results.map(r => r.fixtureId))];

  for (const fixtureId of fixtureIds) {
    const fixResults = results.filter(r => r.fixtureId === fixtureId);
    const firstResult = fixResults[0];
    const isCleanFixture = firstResult && firstResult.missedIds.length === 0
      && firstResult.fn === 0 && !firstResult.issuesFound.length;

    const fixtureTag = isCleanFixture
      ? `  ${C.bold}${C.bcyan}${fixtureId}${C.reset}  ${C.bg.dark}${C.byellow} false-positive test — no real issues exist ${C.bg.reset}${C.reset}`
      : `  ${C.bold}${C.bcyan}${fixtureId}${C.reset}  ${C.dim}(issues-present fixture)${C.reset}`;
    console.log(fixtureTag);
    console.log('');

    const FC = { name: 30, found: 6, tp: 4, tn: 4, fp: 4, fn: 4, f1: 7, acc: 6, mcc: 6, time: 8 };
    const fHdr = [
      pad('Model',                FC.name, true),
      pad('Found',                FC.found),
      pad('TP✓',                  FC.tp),
      pad('TN✓',                  FC.tn),
      pad('FP✗',                  FC.fp),
      pad('FN✗',                  FC.fn),
      pad('F1%',                  FC.f1),
      pad('Acc%',                 FC.acc),
      pad('MCC',                  FC.mcc),
      pad('Time',                 FC.time),
      'Notes',
    ].join('  ');
    console.log('  ' + C.bold + fHdr + C.reset);
    console.log('  ' + C.dim + hr('─', 120) + C.reset);

    const modelOrder = models
      .map(m => {
        const runs = fixResults.filter(r => r.modelId === m);
        const avgF1 = runs.length ? runs.reduce((s, r) => s + r.f1, 0) / runs.length : 0;
        return { modelId: m, avgF1 };
      })
      .sort((a, b) => b.avgF1 - a.avgF1);

    for (const { modelId } of modelOrder) {
      const runs = fixResults.filter(r => r.modelId === modelId && !r.errorOccurred);
      if (runs.length === 0) {
        const errRun = fixResults.find(r => r.modelId === modelId && r.errorOccurred);
        const row = [
          pad(shortName(modelId), FC.name, true),
          pad('-', FC.found), pad('-', FC.tp), pad('-', FC.tn), pad('-', FC.fp), pad('-', FC.fn),
          C.bred + pad('ERR', FC.f1) + C.reset,
          pad('-', FC.acc), pad('-', FC.mcc), pad('-', FC.time),
          `${C.bred}✖ ERROR:${C.reset} ${errRun?.errorMessage ?? 'unknown'}`,
        ].join('  ');
        console.log('  ' + row);
        continue;
      }

      const avg = (key: keyof ModelRunResult) => runs.reduce((s, r) => s + (r[key] as number), 0) / runs.length;
      const avgF1   = avg('f1');
      const avgTP   = avg('tp');
      const avgTN   = avg('tn');
      const avgFN   = avg('fn');
      const avgFP   = avg('fp');
      const avgAcc  = avg('accuracy');
      const avgMCC  = avg('mcc');
      const avgMs   = avg('responseTimeMs');
      const found   = avg('issuesFound' as any);  // length handled below
      const foundN  = runs.reduce((s, r) => s + r.issuesFound.length, 0) / runs.length;

      const firstRun = runs[0];
      let notes: string;
      if (avgFN === 0 && avgFP === 0) {
        notes = `${C.bgreen}✓ PERFECT${C.reset}  ${C.dim}TP:${avgTP.toFixed(0)} correct finds  TN:${avgTN.toFixed(0)} correct skips${C.reset}`;
      } else {
        const parts: string[] = [];
        parts.push(`${C.bgreen}TP:${avgTP.toFixed(0)}✓${C.reset}`);
        parts.push(`${C.dim}TN:${avgTN.toFixed(0)}✓${C.reset}`);
        if (firstRun.fpTitles.length)
          parts.push(`${C.byellow}FP(hallucinated):${C.reset} ${firstRun.fpTitles.slice(0, 2).map(t => `"${t}"`).join(', ')}${firstRun.fpTitles.length > 2 ? ` +${firstRun.fpTitles.length - 2} more` : ''}`);
        if (firstRun.missedIds.length)
          parts.push(`${C.bred}FN(missed):${C.reset} [${firstRun.missedIds.join(', ')}]`);
        notes = parts.join('  ');
      }

      const f1Col  = avgF1  >= 0.8 ? C.bgreen : avgF1  >= 0.5 ? C.byellow : C.bred;
      const accCol = avgAcc >= 0.8 ? C.bgreen : avgAcc >= 0.6 ? C.byellow : C.bred;
      const mccCol = avgMCC >= 0.6 ? C.bgreen : avgMCC >= 0.3 ? C.byellow : C.bred;
      const fpCol  = avgFP  === 0  ? C.bgreen : avgFP  <= 2   ? C.byellow : C.bred;
      const fnCol  = avgFN  === 0  ? C.bgreen : avgFN  <= 2   ? C.byellow : C.bred;

      const row = [
        padAnsi(C.bwhite + pad(shortName(modelId), FC.name, true) + C.reset, FC.name, true),
        pad(Math.round(foundN),      FC.found),
        C.bgreen + pad(avgTP.toFixed(0), FC.tp) + C.reset,
        C.dim    + pad(avgTN.toFixed(0), FC.tn) + C.reset,
        fpCol    + pad(avgFP.toFixed(0), FC.fp) + C.reset,
        fnCol    + pad(avgFN.toFixed(0), FC.fn) + C.reset,
        f1Col    + pad(pct(avgF1),       FC.f1) + C.reset,
        accCol   + pad(pct(avgAcc),      FC.acc) + C.reset,
        mccCol   + pad(avgMCC.toFixed(2), FC.mcc) + C.reset,
        pad(ms(avgMs), FC.time),
        notes,
      ].join('  ');
      console.log('  ' + row);
    }
    console.log('');
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  FALSE POSITIVE ANALYSIS                                 ║
  // ╚══════════════════════════════════════════════════════════╝
  const fpSectionNum = hasMultipleRuns ? '⑦' : '⑥';
  section(`${fpSectionNum} FALSE POSITIVE ANALYSIS  (hallucinations on clean files)`);
  console.log(`  ${C.dim}Every issue listed below was found by the model on a fixture that has NO real accessibility problems.${C.reset}`);
  console.log(`  ${C.dim}These are hallucinations — the model invented problems that don't exist.${C.reset}`);
  console.log('');

  const fpResults = results.filter(r => r.fp > 0 && !r.errorOccurred);
  let anyFP = false;
  for (const modelId of models) {
    const modelFPs = fpResults.filter(r => r.modelId === modelId);
    const name = shortName(modelId);
    if (modelFPs.length === 0) {
      console.log(`  ${C.bgreen}✓${C.reset}  ${name}`);
      continue;
    }
    anyFP = true;
    const totalFP = modelFPs.reduce((s, r) => s + r.fp, 0);
    console.log(`  ${C.bred}✖${C.reset}  ${C.bwhite}${name}${C.reset}  ${C.bred}${totalFP} hallucination${totalFP !== 1 ? 's' : ''}${C.reset}`);
    for (const r of modelFPs) {
      for (const title of r.fpTitles) {
        console.log(`      ${C.dim}[${r.fixtureId}]${C.reset}  ${C.yellow}"${title}"${C.reset}`);
      }
    }
  }
  if (!anyFP) {
    console.log('');
    console.log(`  ${C.bgreen}${C.bold}All models produced zero hallucinations on clean fixtures.${C.reset}`);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  FALSE NEGATIVE ANALYSIS                                 ║
  // ╚══════════════════════════════════════════════════════════╝
  const fnSectionNum = hasMultipleRuns ? '⑧' : '⑦';
  section(`${fnSectionNum} FALSE NEGATIVE ANALYSIS  (real issues missed on error-present fixtures)`);
  console.log(`  ${C.dim}Every concept ID below was a real accessibility issue that the model failed to find (false negative).${C.reset}`);
  console.log(`  ${C.dim}Part A ranks concepts by how many models missed them — the higher the bar, the harder the issue.${C.reset}`);
  console.log(`  ${C.dim}Part B lists per-model breakdowns identical in style to the FP section above.${C.reset}`);
  console.log('');

  const modelCount = models.length;

  // ── Part A: hardest concepts (missed by most models) ─────────────────
  // Build a map: "fixtureId::conceptId" -> set of model IDs that missed it
  const missMap = new Map<string, Set<string>>();
  for (const r of results.filter(rr => !rr.errorOccurred)) {
    for (const id of r.missedIds) {
      const key = `${r.fixtureId}::${id}`;
      if (!missMap.has(key)) missMap.set(key, new Set());
      missMap.get(key)!.add(r.modelId);
    }
  }

  // Group by fixture, sort within each fixture by miss count desc
  const byFixtureFN = new Map<string, { id: string; count: number }[]>();
  for (const [key, modelSet] of missMap) {
    const sep = key.indexOf('::');
    const fixtureId = key.slice(0, sep);
    const conceptId = key.slice(sep + 2);
    if (!byFixtureFN.has(fixtureId)) byFixtureFN.set(fixtureId, []);
    byFixtureFN.get(fixtureId)!.push({ id: conceptId, count: modelSet.size });
  }

  // Print fixture-by-fixture heatmap
  let anyFNIssues = false;
  for (const [fixtureId, concepts] of byFixtureFN) {
    concepts.sort((a, b) => b.count - a.count);
    console.log(`  ${C.bcyan}${fixtureId}${C.reset}`);
    console.log(`  ${C.dim}${'concept-id'.padEnd(42)} missed-by   bar${C.reset}`);
    console.log(`  ${C.dim}${hr('─', W - 2)}${C.reset}`);
    for (const { id, count } of concepts) {
      anyFNIssues = true;
      const ratio     = count / modelCount;
      const barLen    = Math.round(ratio * 20);
      const bar       = '█'.repeat(barLen) + '░'.repeat(20 - barLen);
      const colour    = count === modelCount
        ? C.bred
        : ratio >= 0.75 ? C.byellow
        : ratio >= 0.5  ? C.yellow
        : C.dim;
      const label     = `${count}/${modelCount}  ${pct(ratio)}`;
      console.log(`    ${colour}${id.padEnd(42)}${C.reset}  ${colour}${label.padEnd(12)} ${bar}${C.reset}`);
    }
    console.log('');
  }
  if (!anyFNIssues) {
    console.log(`  ${C.bgreen}${C.bold}All models found every expected issue — no false negatives.${C.reset}`);
    console.log('');
  }

  // ── Part B: per-model breakdown ───────────────────────────────────────
  rule('per model');
  console.log('');

  let anyFN = false;
  for (const modelId of models) {
    const modelMisses = results.filter(r => r.modelId === modelId && !r.errorOccurred && r.missedIds.length > 0);
    const name = shortName(modelId);
    if (modelMisses.length === 0) {
      console.log(`  ${C.bgreen}✓${C.reset}  ${name}`);
      continue;
    }
    anyFN = true;
    const totalFN = modelMisses.reduce((s, r) => s + r.missedIds.length, 0);
    console.log(`  ${C.bred}✖${C.reset}  ${C.bwhite}${name}${C.reset}  ${C.bred}${totalFN} missed issue${totalFN !== 1 ? 's' : ''}${C.reset}`);
    for (const r of modelMisses) {
      for (const id of r.missedIds) {
        console.log(`      ${C.dim}[${r.fixtureId}]${C.reset}  ${C.red}${id}${C.reset}`);
      }
    }
  }
  if (!anyFN) {
    console.log('');
    console.log(`  ${C.bgreen}${C.bold}All models found every expected issue on error-present fixtures.${C.reset}`);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  COMPLEXITY REGRESSION ANALYSIS                          ║
  // ╚══════════════════════════════════════════════════════════╝

  // Check if we have complexity tier data
  const hasComplexityData = results.some(r => r.complexityTier !== undefined);

  if (hasComplexityData) {
    const complexSectionNum = hasMultipleRuns ? '⑨' : '⑧';
    section(`${complexSectionNum} COMPLEXITY REGRESSION ANALYSIS`);
    console.log(`  ${C.dim}Measures how model performance degrades as code complexity increases.${C.reset}`);
    console.log(`  ${C.dim}Lower degradation slope = more robust model. Graceful degradation preferred over cliff drops.${C.reset}`);
    console.log('');

    // Calculate F1 for each (modelId, tier) pair
    interface TierMetrics {
      f1: number;
      avgResponseMs: number;
      count: number;
    }

    const tierMetrics = new Map<string, Map<string, TierMetrics>>();
    for (const modelId of models) {
      const tierMap = new Map<string, TierMetrics>();
      for (const tier of ['low', 'medium', 'high']) {
        const tierResults = results.filter(
          r => r.modelId === modelId && r.complexityTier === tier && !r.errorOccurred
        );
        if (tierResults.length > 0) {
          const f1Sum = tierResults.reduce((s, r) => s + r.f1, 0);
          const timeSum = tierResults.reduce((s, r) => s + r.responseTimeMs, 0);
          tierMap.set(tier, {
            f1: f1Sum / tierResults.length,
            avgResponseMs: timeSum / tierResults.length,
            count: tierResults.length,
          });
        }
      }
      if (tierMap.size > 0) {
        tierMetrics.set(modelId, tierMap);
      }
    }

    // Calculate degradation slopes
    interface DegradationData {
      modelId: string;
      f1Low: number;
      f1Med: number;
      f1High: number;
      degradationSlope: number;
      robustnessScore: number;
    }

    const degradations: DegradationData[] = [];
    for (const [modelId, tierMap] of tierMetrics) {
      const f1Low = tierMap.get('low')?.f1 ?? 0;
      const f1High = tierMap.get('high')?.f1 ?? 0;
      const f1Med = tierMap.get('medium')?.f1 ?? 0;

      if (f1Low > 0) {
        const degradationSlope = (f1Low - f1High) / f1Low;
        // Clamp slope to [0, 1]: negative means model improves on harder fixtures
        // (best case = 0 slope); cap at 1 so robustnessScore never goes below 0.
        const robustnessScore = 1 - Math.min(Math.max(degradationSlope, 0), 1);
        degradations.push({
          modelId,
          f1Low, f1Med, f1High,
          degradationSlope,
          robustnessScore,
        });
      }
    }

    // Sort by robustness (lowest slope = best)
    degradations.sort((a, b) => a.degradationSlope - b.degradationSlope);

    // Print degradation table
    const COMP = { rank: 4, name: 20 + C.bwhite.length, f1Low: 7, f1Med: 7, f1High: 7, slope: 10, robust: 8 };

    const compHdr = [
      pad('Rank', COMP.rank),
      padAnsi(C.bwhite + 'Model' + C.reset, COMP.name, true),
      pad('F1(Low)', COMP.f1Low),
      pad('F1(Med)', COMP.f1Med),
      pad('F1(High)', COMP.f1High),
      pad('Degradation', COMP.slope),
      pad('Robustness', COMP.robust),
    ].join(' ');
    console.log('  ' + C.dim + compHdr + C.reset);
    rule('  ', '─');

    for (let i = 0; i < degradations.length; i++) {
      const d = degradations[i];
      const name = shortName(d.modelId);
      const slopeCol = d.degradationSlope <= 0.15 ? C.bgreen : d.degradationSlope <= 0.35 ? C.byellow : C.bred;
      const robustScore = scoreBar(d.robustnessScore, 12);

      const compRow = [
        pad(`${i + 1}.`, COMP.rank),
        padAnsi(C.bwhite + pad(name, COMP.name - C.bwhite.length, true) + C.reset, COMP.name, true),
        pad(pct(d.f1Low), COMP.f1Low),
        pad(pct(d.f1Med), COMP.f1Med),
        pad(pct(d.f1High), COMP.f1High),
        slopeCol + pad((d.degradationSlope * 100).toFixed(1) + '%', COMP.slope) + C.reset,
        robustScore,
      ].join(' ');
      console.log('  ' + compRow);
    }

    console.log('');
    console.log(`  ${C.dim}Interpretation: Slope = (F1_low - F1_high) / F1_low. Lower slope = graceful degradation. 0% = no degradation, 100% = complete failure on complex code.${C.reset}`);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  STREAMING QUALITY ANALYSIS                             ║
  // ╚══════════════════════════════════════════════════════════╝

  // Check if we have streaming data
  const hasStreamingData = results.some(r => r.streamingMetrics?.at50percent);

  if (hasStreamingData) {
    const streamingSectionNum = hasComplexityData ? '⑩' : '⑨';
    section(`${streamingSectionNum} STREAMING QUALITY ANALYSIS`);
    console.log(`  ${C.dim}Measures how model quality evolves as partial responses are generated.${C.reset}`);
    console.log(`  ${C.dim}Early-stopping is viable if F1 plateaus before 100% token count.${C.reset}`);
    console.log('');

    // Aggregate streaming metrics by model
    interface StreamingAgg {
      modelId: string;
      f1At25: number[];
      f1At50: number[];
      f1At75: number[];
      f1At100: number[];
      plateauPercent: number; // % at which F1 reaches 90% of final value
    }

    const streamingByModel = new Map<string, StreamingAgg>();
    for (const modelId of models) {
      const streamingByModel_data: StreamingAgg = {
        modelId,
        f1At25: [],
        f1At50: [],
        f1At75: [],
        f1At100: [],
        plateauPercent: 100,
      };

      const modelResults = results.filter(r => r.modelId === modelId && !r.errorOccurred && r.streamingMetrics);
      for (const result of modelResults) {
        const sm = result.streamingMetrics!;
        if (sm.at25percent) streamingByModel_data.f1At25.push(sm.at25percent.f1);
        if (sm.at50percent) streamingByModel_data.f1At50.push(sm.at50percent.f1);
        if (sm.at75percent) streamingByModel_data.f1At75.push(sm.at75percent.f1);
        streamingByModel_data.f1At100.push(sm.at100percent.f1);
      }

      if (streamingByModel_data.f1At100.length > 0) {
        const avgF1At100 = streamingByModel_data.f1At100.reduce((a, b) => a + b, 0) / streamingByModel_data.f1At100.length;
        const threshold90 = avgF1At100 * 0.9;

        // Find earliest point where avg F1 >= 90% of final
        if (streamingByModel_data.f1At25.length > 0) {
          const avgF1At25 = streamingByModel_data.f1At25.reduce((a, b) => a + b, 0) / streamingByModel_data.f1At25.length;
          if (avgF1At25 >= threshold90) {
            streamingByModel_data.plateauPercent = 25;
          }
        }
        if (streamingByModel_data.plateauPercent === 100 && streamingByModel_data.f1At50.length > 0) {
          const avgF1At50 = streamingByModel_data.f1At50.reduce((a, b) => a + b, 0) / streamingByModel_data.f1At50.length;
          if (avgF1At50 >= threshold90) {
            streamingByModel_data.plateauPercent = 50;
          }
        }
        if (streamingByModel_data.plateauPercent === 100 && streamingByModel_data.f1At75.length > 0) {
          const avgF1At75 = streamingByModel_data.f1At75.reduce((a, b) => a + b, 0) / streamingByModel_data.f1At75.length;
          if (avgF1At75 >= threshold90) {
            streamingByModel_data.plateauPercent = 75;
          }
        }

        streamingByModel.set(modelId, streamingByModel_data);
      }
    }

    // Print streaming table
    const SSC = { rank: 4, name: 20 + C.bwhite.length, f1_25: 7, f1_50: 7, f1_75: 7, f1_100: 7, plateau: 10 };

    const streamingHdr = [
      pad('Rank', SSC.rank),
      padAnsi(C.bwhite + 'Model' + C.reset, SSC.name, true),
      pad('F1@25%', SSC.f1_25),
      pad('F1@50%', SSC.f1_50),
      pad('F1@75%', SSC.f1_75),
      pad('F1@100%', SSC.f1_100),
      pad('Plateau', SSC.plateau),
    ].join(' ');
    console.log('  ' + C.dim + streamingHdr + C.reset);
    rule('  ', '─');

    let streamingRank = 1;
    for (const [, streamingData] of streamingByModel) {
      const name = shortName(streamingData.modelId);
      const f1_25 = streamingData.f1At25.length > 0 ? streamingData.f1At25.reduce((a, b) => a + b, 0) / streamingData.f1At25.length : 0;
      const f1_50 = streamingData.f1At50.length > 0 ? streamingData.f1At50.reduce((a, b) => a + b, 0) / streamingData.f1At50.length : 0;
      const f1_75 = streamingData.f1At75.length > 0 ? streamingData.f1At75.reduce((a, b) => a + b, 0) / streamingData.f1At75.length : 0;
      const f1_100 = streamingData.f1At100.reduce((a, b) => a + b, 0) / streamingData.f1At100.length;

      const plateauCol = streamingData.plateauPercent < 100 ? C.bgreen : C.byellow;
      const trajectoryBar = scoreBar(f1_100, 14);

      const streamingRow = [
        pad(`${streamingRank}.`, SSC.rank),
        padAnsi(C.bwhite + pad(name, SSC.name - C.bwhite.length, true) + C.reset, SSC.name, true),
        pad(pct(f1_25), SSC.f1_25),
        pad(pct(f1_50), SSC.f1_50),
        pad(pct(f1_75), SSC.f1_75),
        pad(pct(f1_100), SSC.f1_100),
        plateauCol + pad(streamingData.plateauPercent + '%', SSC.plateau) + C.reset,
      ].join(' ');
      console.log('  ' + streamingRow);
      streamingRank++;
    }

    console.log('');
    console.log(`  ${C.dim}Plateau = earliest % of tokens where F1 reaches 90% of final value.${C.reset}`);
    console.log(`  ${C.dim}Green = early plateau (early stopping possible).${C.reset}`);
    console.log(`  ${C.dim}Yellow = full response needed for optimal quality.${C.reset}`);
  }

  // ╔══════════════════════════════════════════════════════════╗
  // ║  PARETO FRONTIER ANALYSIS                               ║
  // ╚══════════════════════════════════════════════════════════╝

  const paretoSectionNum = hasStreamingData ? (hasComplexityData ? '⑪' : '⑩') : (hasComplexityData ? '⑩' : '⑨');
  section(`${paretoSectionNum} PARETO FRONTIER ANALYSIS  (Quality vs. Latency Tradeoff)`);
  console.log(`  ${C.dim}Identifies optimal models on the F1 vs. latency tradeoff curve.${C.reset}`);
  console.log(`  ${C.dim}Pareto-optimal models have no competitor that is both faster AND more accurate.${C.reset}`);
  console.log('');

  const paretoClassified = computeParetoFrontier(stats);
  const paretoOptimal = paretoClassified.filter(p => p.isParetoOptimal);
  const paretoNonOptimal = paretoClassified.filter(p => !p.isParetoOptimal);

  // Print Pareto frontier table
  const PC = { rank: 4, name: 20 + C.bwhite.length, f1: 7, latency: 9, status: 15 };

  const paretoHdr = [
    pad('Rank', PC.rank),
    padAnsi(C.bwhite + 'Model' + C.reset, PC.name, true),
    pad('F1', PC.f1),
    pad('Latency', PC.latency),
    pad('Status', PC.status),
  ].join(' ');
  console.log('  ' + C.dim + paretoHdr + C.reset);
  rule('  ', '─');

  // Print Pareto-optimal first (in green)
  let rank = 1;
  for (const p of paretoOptimal) {
    const name = shortName(p.modelId);
    const paretoRow = [
      pad(`${rank}.`, PC.rank),
      padAnsi(C.bwhite + pad(name, PC.name - C.bwhite.length, true) + C.reset, PC.name, true),
      pad(pct(p.f1), PC.f1),
      pad(ms(p.latencyMs), PC.latency),
      C.bgreen + pad('⭐ PARETO-OPTIMAL', PC.status) + C.reset,
    ].join(' ');
    console.log('  ' + paretoRow);
    rank++;
  }

  // Print non-optimal (in yellow/red with reason)
  if (paretoNonOptimal.length > 0) {
    rule('  ', '·');
    for (const p of paretoNonOptimal) {
      const name = shortName(p.modelId);
      const domBy = p.dominatedBy?.map(m => shortName(m)).join(', ') ?? 'unknown';
      const statusCol = C.byellow + 'Dominated by' + C.reset;
      const paretoRow = [
        pad(`${rank}.`, PC.rank),
        padAnsi(C.bwhite + pad(name, PC.name - C.bwhite.length, true) + C.reset, PC.name, true),
        pad(pct(p.f1), PC.f1),
        pad(ms(p.latencyMs), PC.latency),
        `${statusCol} ${C.dim}${domBy}${C.reset}`,
      ].join(' ');
      console.log('  ' + paretoRow);
      rank++;
    }
  }

  console.log('');

  // ASCII scatter plot: F1 vs. Latency
  console.log(`  ${C.dim}ASCII scatter: F1 (vertical) vs. Latency (horizontal)${C.reset}`);
  console.log(`  Pareto optimal models marked with ${C.bgreen}●${C.reset}, others with ${C.dim}○${C.reset}`);
  console.log('');

  // Find bounds for the plot
  const f1Values = paretoClassified.map(p => p.f1);
  const latencyValues = paretoClassified.map(p => p.latencyMs);
  const f1Min = Math.max(0, Math.min(...f1Values) - 0.05);
  const f1Max = Math.min(1, Math.max(...f1Values) + 0.05);
  const latencyMin = 0;
  const latencyMax = Math.max(...latencyValues) * 1.1;

  const plotWidth = 60;
  const plotHeight = 15;

  // Normalize coordinates for plot
  const norm = (val: number, min: number, max: number) => 
    (val - min) / (max - min);

  // Create plot grid
  const grid: string[][] = Array(plotHeight)
    .fill(null)
    .map(() => Array(plotWidth).fill(' '));

  // Plot each model
  for (const p of paretoClassified) {
    const x = Math.round(norm(p.latencyMs, latencyMin, latencyMax) * (plotWidth - 1));
    const y = Math.round((1 - norm(p.f1, f1Min, f1Max)) * (plotHeight - 1));

    if (x >= 0 && x < plotWidth && y >= 0 && y < plotHeight) {
      const marker = p.isParetoOptimal ? C.bgreen + '●' + C.reset : C.dim + '○' + C.reset;
      grid[y][x] = marker;
    }
  }

  // Print grid with axis labels
  for (let y = 0; y < plotHeight; y++) {
    const f1Label = (f1Max - (f1Max - f1Min) * (y / plotHeight)).toFixed(2);
    const rowStr = grid[y].join('');
    console.log(`  ${C.dim}${f1Label}${C.reset}  ${rowStr}`);
  }

  // X-axis
  console.log(`  ${C.dim}0.00${C.reset}  ` + C.dim + '─'.repeat(plotWidth) + C.reset);
  console.log(`        ${latencyMin.toFixed(0)}ms${' '.repeat(Math.max(0, plotWidth - 15))}${latencyMax.toFixed(0)}ms`);

  console.log('');
  console.log(`  ${C.dim}Conclusion: ${paretoOptimal.length} model${paretoOptimal.length !== 1 ? 's' : ''} on Pareto frontier.${C.reset}`);
  if (paretoOptimal.length > 0) {
    console.log(`  ${C.dim}Choose based on your needs: faster models (left) or more accurate (top).${C.reset}`);
  }

  console.log('');
  console.log(C.dim + hr('═') + C.reset);

  // ╔══════════════════════════════════════════════════════════╗
  // ║  SECTION ⑫: VULNERABILITY ANALYSIS (Adversarial Tests)  ║
  // ╚══════════════════════════════════════════════════════════╝

  section(`⑫ ADVERSARIAL BLIND SPOTS  (Step 6: Vulnerability Analysis)`);

  const vulnerabilityStats = models.map(m => computeVulnerabilityAnalysis(m, results));
  const byStrength = vulnerabilityStats.sort((a, b) => {
    // Sort by: fewest critical blind spots, then fewest weak areas, then strongest areas
    if (a.criticalBlindSpots !== b.criticalBlindSpots) return a.criticalBlindSpots - b.criticalBlindSpots;
    if (a.weakAreas !== b.weakAreas) return a.weakAreas - b.weakAreas;
    return b.strongAreas - a.strongAreas;
  });

  // ── Summary table ────────────────────────────────────────────────────────

  console.log(`  ${C.bold}Each model's known weak spots:${C.reset}`);
  console.log('');
  console.log(
    `  ${C.bold}${pad('Model', 25)}${'Critical'.padEnd(11)}${'Weak'.padEnd(8)}${'Good'.padEnd(8)}${C.reset}`
  );
  console.log(`  ${C.dim}${hr('─', 55)}${C.reset}`);

  for (const vuln of byStrength) {
    const nameStr = shortName(vuln.modelId).substring(0, 25).padEnd(25);
    const critCol =
      vuln.criticalBlindSpots > 0
        ? C.bred + vuln.criticalBlindSpots.toString().padEnd(11) + C.reset
        : C.bgreen + vuln.criticalBlindSpots.toString().padEnd(11) + C.reset;
    const weakCol =
      vuln.weakAreas > 0
        ? C.byellow + vuln.weakAreas.toString().padEnd(8) + C.reset
        : C.bgreen + vuln.weakAreas.toString().padEnd(8) + C.reset;
    const goodCol = C.bgreen + vuln.strongAreas.toString().padEnd(8) + C.reset;

    console.log(`  ${nameStr}${critCol}${weakCol}${goodCol}`);
  }
  console.log('');

  // ── Detailed blind spots ──────────────────────────────────────────────────

  console.log(`  ${C.bold}Critical blind spots (< 25% detection):${C.reset}`);
  console.log('');

  const criticalByModel = new Map<string, string[]>();
  for (const vuln of vulnerabilityStats) {
    const critical = vuln.profiles.filter(p => p.blindSpot === 'critical');
    if (critical.length > 0) {
      criticalByModel.set(vuln.modelId, critical.map(c => c.violation));
    }
  }

  if (criticalByModel.size === 0) {
    console.log(`  ${C.bgreen}✓ No critical blind spots detected across any model.${C.reset}`);
  } else {
    for (const [modelId, violations] of criticalByModel) {
      const name = shortName(modelId).substring(0, 40);
      console.log(`  ${C.bred}${name}${C.reset}`);
      for (const v of violations) {
        console.log(`    • ${v}`);
      }
      console.log('');
    }
  }

  // ── Conclusions ───────────────────────────────────────────────────────

  console.log(`  ${C.bold}Summary:${C.reset}`);
  console.log('');

  const bestRobust = byStrength[0];
  const worstRobust = byStrength[byStrength.length - 1];

  console.log(`  ${C.bgreen}✓ Most robust model:${C.reset} ${shortName(bestRobust.modelId)}`);
  console.log(`    • Catches ${bestRobust.strongAreas} violation types fully`);
  if (bestRobust.weakAreas > 0) {
    console.log(`    • Partially catches ${bestRobust.weakAreas} types`);
  }
  if (bestRobust.criticalBlindSpots > 0) {
    console.log(`    • ${C.bred}Misses ${bestRobust.criticalBlindSpots} types entirely${C.reset}`);
  }
  console.log('');

  console.log(`  ${C.bred}✗ Weakest robustness:${C.reset} ${shortName(worstRobust.modelId)}`);
  console.log(`    • Catches ${worstRobust.strongAreas} violation types fully`);
  if (worstRobust.weakAreas > 0) {
    console.log(`    • Partially catches ${worstRobust.weakAreas} types`);
  }
  if (worstRobust.criticalBlindSpots > 0) {
    console.log(`    • ${C.bred}Misses ${worstRobust.criticalBlindSpots} types entirely${C.reset}`);
  }
  console.log('');

  console.log(`  ${C.cyan}💡 Key insight:${C.reset} No single model perfectly catches all violation types.`);
  console.log(`     Combine results or use models in sequence to maximize coverage.`);

  console.log('');
  console.log(C.dim + hr('═') + C.reset);
  console.log('');
}

// ─── Save JSON ────────────────────────────────────────────────────────────

export function saveJson(results: ModelRunResult[], outDir: string, label?: string): string {
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = label ? `-${label}` : '';
  const filePath = path.join(outDir, `cloud-llm-preliminary${suffix}-${ts}.json`);
  // Strip rawResponse to keep the file manageable — preserve everything else
  const stripped = results.map(r => ({ ...r, rawResponse: undefined }));
  fs.writeFileSync(filePath, JSON.stringify(stripped, null, 2), 'utf8');
  return filePath;
}

// ─── Save CSV ─────────────────────────────────────────────────────────────
// Mirrors every section of the .txt report but in structured CSV format.
// Sections are separated by a blank row + a "# SECTION NAME" comment row so
// the file can be imported into Excel / pandas and filtered by section.

export function saveCsv(
  results: ModelRunResult[],
  models: string[],
  outDir: string,
  label?: string
): string {
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = label ? `-${label}` : '';
  const filePath = path.join(outDir, `cloud-llm-preliminary-summary${suffix}-${ts}.csv`);

  const rows: string[][] = [];
  const c = (v: string | number) => String(v);

  const rawStats = models.map(m => aggregateByModel(results, m, results[0]?.presetId ?? 'balanced'));
  const stats = applyCompositeScores(rawStats).sort((a, b) => b.compositeScore - a.compositeScore);

  // ── § 1  OVERALL RANKING ───────────────────────────────────────────────
  rows.push(['# OVERALL RANKING  (80% F1 + 20% speed composite score)']);
  rows.push(['rank', 'model', 'short_name', 'composite_score', 'f1', 'precision', 'recall', 'total_tp', 'total_fn', 'total_fp', 'avg_response_s', 'errors']);
  stats.forEach((s, i) => {
    rows.push([
      c(i + 1), s.modelId, shortName(s.modelId),
      (s.compositeScore * 100).toFixed(1) + '%',
      (s.avgF1 * 100).toFixed(1) + '%',
      (s.avgPrecision * 100).toFixed(1) + '%',
      (s.avgRecall * 100).toFixed(1) + '%',
      c(s.totalTP), c(s.totalFN), c(s.totalFP),
      (s.avgResponseMs / 1000).toFixed(1) + 's',
      c(s.errorCount),
    ]);
  });

  // ── § 2  EXTENDED METRICS ──────────────────────────────────────────────
  rows.push([]);
  rows.push(['# EXTENDED METRICS  (full confusion-matrix detail)']);
  rows.push(['rank', 'model', 'short_name', 'accuracy', 'balanced_accuracy', 'mcc', 'specificity', 'npv', 'total_tp', 'total_tn', 'total_fp', 'total_fn']);
  stats.forEach((s, i) => {
    rows.push([
      c(i + 1), s.modelId, shortName(s.modelId),
      (s.avgAccuracy * 100).toFixed(1) + '%',
      (s.avgBalancedAccuracy * 100).toFixed(1) + '%',
      s.avgMCC.toFixed(3),
      (s.avgSpecificity * 100).toFixed(1) + '%',
      (s.avgNPV * 100).toFixed(1) + '%',
      c(s.totalTP), c(s.totalTN), c(s.totalFP), c(s.totalFN),
    ]);
  });

  // ── § 3  RESPONSE TIME ─────────────────────────────────────────────────
  rows.push([]);
  rows.push(['# RESPONSE TIME']);
  rows.push(['rank', 'model', 'short_name', 'avg_s', 'p50_s', 'p95_s', 'avg_issues_per_run']);
  [...stats].sort((a, b) => a.avgResponseMs - b.avgResponseMs).forEach((s, i) => {
    rows.push([
      c(i + 1), s.modelId, shortName(s.modelId),
      (s.avgResponseMs / 1000).toFixed(1) + 's',
      (s.p50ResponseMs / 1000).toFixed(1) + 's',
      (s.p95ResponseMs / 1000).toFixed(1) + 's',
      s.avgIssuesFound.toFixed(1),
    ]);
  });

  // ── § 4  DETAIL BY FIXTURE ─────────────────────────────────────────────
  rows.push([]);
  rows.push(['# DETAIL BY FIXTURE  (each run listed individually, then aggregate average)']);
  rows.push(['fixture', 'model', 'short_name', 'run', 'issues_found', 'tp', 'tn', 'fp', 'fn', 'f1', 'accuracy', 'mcc', 'response_s', 'hallucinated_titles', 'missed_concept_ids']);
  // Group per fixture, sorted by fixture then by F1 desc
  const fixtures = [...new Set(results.map(r => r.fixtureId))];
  for (const fixtureId of fixtures) {
    for (const modelId of models) {
      const runs = results.filter(r => r.fixtureId === fixtureId && r.modelId === modelId && !r.errorOccurred)
        .sort((a, b) => a.runIndex - b.runIndex);
      if (runs.length === 0) continue;
      // Individual run rows
      for (const r of runs) {
        rows.push([
          fixtureId, r.modelId, shortName(r.modelId),
          c(r.runIndex + 1),
          c(r.issuesFound.length),
          c(r.tp), c(r.tn), c(r.fp), c(r.fn),
          (r.f1 * 100).toFixed(1) + '%',
          (r.accuracy * 100).toFixed(1) + '%',
          r.mcc.toFixed(2),
          (r.responseTimeMs / 1000).toFixed(1) + 's',
          r.fpTitles.join(' | '),
          r.missedIds.join(' | '),
        ]);
      }
      // Aggregate row (average across all runs)
      if (runs.length > 1) {
        const avg = (key: keyof ModelRunResult) =>
          runs.reduce((s, r) => s + (r[key] as number), 0) / runs.length;
        const firstRun = runs[0];
        rows.push([
          fixtureId, modelId, shortName(modelId),
          'AVG',
          (runs.reduce((s, r) => s + r.issuesFound.length, 0) / runs.length).toFixed(1),
          avg('tp').toFixed(1), avg('tn').toFixed(1), avg('fp').toFixed(1), avg('fn').toFixed(1),
          (avg('f1') * 100).toFixed(1) + '%',
          (avg('accuracy') * 100).toFixed(1) + '%',
          avg('mcc').toFixed(2),
          (avg('responseTimeMs') / 1000).toFixed(1) + 's',
          firstRun.fpTitles.join(' | '),
          firstRun.missedIds.join(' | '),
        ]);
      }
    }
  }

  // ── § 5  FALSE POSITIVE DETAIL ────────────────────────────────────────
  rows.push([]);
  rows.push(['# FALSE POSITIVE DETAIL  (hallucinated issues on fixtures with no real problems)']);
  rows.push(['model', 'short_name', 'fixture', 'hallucinated_title']);
  for (const r of results.filter(rr => !rr.errorOccurred && rr.fp > 0)) {
    for (const title of r.fpTitles) {
      rows.push([r.modelId, shortName(r.modelId), r.fixtureId, title]);
    }
  }

  // ── § 6  FALSE NEGATIVE DETAIL ────────────────────────────────────────
  rows.push([]);
  rows.push(['# FALSE NEGATIVE DETAIL  (real issues the model failed to detect)']);
  rows.push(['model', 'short_name', 'fixture', 'missed_concept_id']);
  for (const modelId of models) {
    for (const r of results.filter(rr => rr.modelId === modelId && !rr.errorOccurred && rr.missedIds.length > 0)) {
      for (const id of r.missedIds) {
        rows.push([r.modelId, shortName(r.modelId), r.fixtureId, id]);
      }
    }
  }

  // ── § 7  CONCEPT MISS HEATMAP ─────────────────────────────────────────
  rows.push([]);
  rows.push(['# CONCEPT MISS HEATMAP  (how many models missed each expected issue — higher = harder to detect)']);
  rows.push(['fixture', 'concept_id', 'models_that_missed', 'total_models', 'miss_rate_pct']);
  const missMap = new Map<string, Set<string>>();
  for (const r of results.filter(rr => !rr.errorOccurred)) {
    for (const id of r.missedIds) {
      const key = `${r.fixtureId}::${id}`;
      if (!missMap.has(key)) missMap.set(key, new Set());
      missMap.get(key)!.add(r.modelId);
    }
  }
  const modelCount = models.length;
  const heatRows: [string, string, number][] = [];
  for (const [key, modelSet] of missMap) {
    const sep = key.indexOf('::');
    heatRows.push([key.slice(0, sep), key.slice(sep + 2), modelSet.size]);
  }
  heatRows.sort((a, b) => a[0].localeCompare(b[0]) || b[2] - a[2]);
  for (const [fixtureId, conceptId, count] of heatRows) {
    rows.push([fixtureId, conceptId, c(count), c(modelCount), ((count / modelCount) * 100).toFixed(1) + '%']);
  }

  // ── § 8  COMPLEXITY REGRESSION ────────────────────────────────────────
  rows.push([]);
  rows.push(['# COMPLEXITY REGRESSION  (F1 degradation across low / medium / high fixtures)']);
  rows.push(['model', 'short_name', 'f1_low', 'f1_medium', 'f1_high', 'degradation_slope', 'robustness_score']);
  for (const s of stats) {
    const runsLow    = results.filter(r => r.modelId === s.modelId && r.complexityTier === 'low'    && !r.errorOccurred);
    const runsMedium = results.filter(r => r.modelId === s.modelId && r.complexityTier === 'medium' && !r.errorOccurred);
    const runsHigh   = results.filter(r => r.modelId === s.modelId && r.complexityTier === 'high'   && !r.errorOccurred);
    if (runsLow.length === 0 && runsMedium.length === 0 && runsHigh.length === 0) continue;
    const avg = (arr: ModelRunResult[]) => arr.length ? arr.reduce((s, r) => s + r.f1, 0) / arr.length : NaN;
    const f1Low    = avg(runsLow);
    const f1Medium = avg(runsMedium);
    const f1High   = avg(runsHigh);
    const slope = (!isNaN(f1Low) && !isNaN(f1High) && f1Low > 0)
      ? (f1Low - f1High) / f1Low : NaN;
    rows.push([
      s.modelId, shortName(s.modelId),
      isNaN(f1Low)    ? 'N/A' : (f1Low    * 100).toFixed(1) + '%',
      isNaN(f1Medium) ? 'N/A' : (f1Medium * 100).toFixed(1) + '%',
      isNaN(f1High)   ? 'N/A' : (f1High   * 100).toFixed(1) + '%',
      isNaN(slope)    ? 'N/A' : (slope     * 100).toFixed(1) + '%',
      isNaN(slope)    ? 'N/A' : ((1 - slope) * 100).toFixed(1) + '%',
    ]);
  }

  // ── § 9  STREAMING QUALITY ─────────────────────────────────────────────
  rows.push([]);
  rows.push(['# STREAMING QUALITY  (F1 at partial token percentages — plateau = earliest % reaching 90% of final F1)']);
  rows.push(['model', 'short_name', 'f1_at_25pct', 'f1_at_50pct', 'f1_at_75pct', 'f1_at_100pct', 'plateau_point']);
  for (const s of stats) {
    const withStreaming = results.filter(r => r.modelId === s.modelId && r.streamingMetrics && !r.errorOccurred);
    if (withStreaming.length === 0) continue;
    const avgPct = (getter: (m: NonNullable<ModelRunResult['streamingMetrics']>) => number | undefined) => {
      const vals = withStreaming.map(r => getter(r.streamingMetrics!)).filter((v): v is number => v !== undefined);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN;
    };
    const f1at25  = avgPct(m => m.at25percent?.f1);
    const f1at50  = avgPct(m => m.at50percent?.f1);
    const f1at75  = avgPct(m => m.at75percent?.f1);
    const f1at100 = avgPct(m => m.at100percent.f1);
    let plateau = '100%';
    if (!isNaN(f1at25) && f1at25 >= f1at100 * 0.9) plateau = '25%';
    else if (!isNaN(f1at50) && f1at50 >= f1at100 * 0.9) plateau = '50%';
    else if (!isNaN(f1at75) && f1at75 >= f1at100 * 0.9) plateau = '75%';
    rows.push([
      s.modelId, shortName(s.modelId),
      isNaN(f1at25)  ? 'N/A' : (f1at25  * 100).toFixed(1) + '%',
      isNaN(f1at50)  ? 'N/A' : (f1at50  * 100).toFixed(1) + '%',
      isNaN(f1at75)  ? 'N/A' : (f1at75  * 100).toFixed(1) + '%',
      isNaN(f1at100) ? 'N/A' : (f1at100 * 100).toFixed(1) + '%',
      plateau,
    ]);
  }

  // ── § 10  PARETO FRONTIER ─────────────────────────────────────────────
  rows.push([]);
  rows.push(['# PARETO FRONTIER  (models where no competitor has both better F1 and lower latency)']);
  rows.push(['model', 'short_name', 'f1', 'avg_latency_s', 'pareto_optimal', 'dominated_by']);
  const paretoData = computeParetoFrontier(stats);
  paretoData.sort((a, b) => b.f1 - a.f1).forEach(p => {
    rows.push([
      p.modelId, shortName(p.modelId),
      (p.f1 * 100).toFixed(1) + '%',
      (p.latencyMs / 1000).toFixed(1) + 's',
      p.isParetoOptimal ? 'YES' : 'NO',
      (p.dominatedBy ?? []).join(' | '),
    ]);
  });

  // ── § 11  ADVERSARIAL VULNERABILITY ───────────────────────────────────
  rows.push([]);
  rows.push(['# ADVERSARIAL VULNERABILITY  (detection rate per violation type on adversarial fixtures)']);
  rows.push(['model', 'short_name', 'violation', 'category', 'detected', 'total', 'detection_rate', 'blind_spot']);
  for (const s of stats) {
    const vuln = computeVulnerabilityAnalysis(s.modelId, results);
    for (const p of vuln.profiles) {
      rows.push([
        s.modelId, shortName(s.modelId),
        p.violation, p.category,
        c(p.detectionCount), c(p.totalFixtures),
        (p.detectionRate * 100).toFixed(1) + '%',
        p.blindSpot,
      ]);
    }
  }

  const csv = rows
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  fs.writeFileSync(filePath, csv, 'utf8');
  return filePath;
}

// ─── Save plain-text report ───────────────────────────────────────────────

/** Strip ANSI escape codes so the text file is readable in any editor. */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Capture the console output of printReport() and save it as a .txt file
 * (ANSI codes stripped).  Returns the file path.
 */
export function saveReport(
  results: ModelRunResult[],
  models: string[],
  presetId: AnalysisPresetId,
  outDir: string,
  label?: string
): string {
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = label ? `-${label}` : '';
  const filePath = path.join(outDir, `cloud-llm-preliminary-report${suffix}-${ts}.txt`);

  // Capture stdout
  const lines: string[] = [];
  const origWrite = process.stdout.write.bind(process.stdout);
  (process.stdout.write as any) = (chunk: string | Buffer) => {
    lines.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return origWrite(chunk);   // still print to terminal
  };

  printReport(results, models, presetId);

  // Restore stdout
  (process.stdout.write as any) = origWrite;

  const text = stripAnsi(lines.join(''));
  fs.writeFileSync(filePath, text, 'utf8');
  return filePath;
}
