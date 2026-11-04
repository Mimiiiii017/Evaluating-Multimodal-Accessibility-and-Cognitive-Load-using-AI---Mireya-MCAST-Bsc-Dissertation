/**
 * replay.ts  —  regenerate the formatted report from a saved JSON file
 *
 * Usage:
 *   node_modules/.bin/ts-node replay.ts <path-to-json>
 *   node_modules/.bin/ts-node replay.ts results/cloud-llm-preliminary-xyz.json --save
 *
 * Options:
 *   --save    Also write llm-report-<ts>.txt to the same directory as the JSON
 *   --help
 */

import * as fs   from 'fs';
import * as path from 'path';
import { ModelRunResult } from '../benchmark/benchmark';
import { printReport, saveReport } from './reporter';
import { AnalysisPresetId } from
  '../../extension/ai-accessibility-assistant/src/utils/llm/ollama';

const args = process.argv.slice(2);

if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node_modules/.bin/ts-node replay.ts <path-to-json> [--save]

  <path-to-json>   Path to a JSON file produced by the LLM benchmark
  --save           Write llm-report-<ts>.txt alongside the JSON
`);
  process.exit(0);
}

const jsonArg = args.find(a => !a.startsWith('--'));
const doSave  = args.includes('--save');

if (!jsonArg) {
  console.error('Error: provide the path to a benchmark JSON file.');
  process.exit(1);
}

const jsonPath = path.resolve(jsonArg);
if (!fs.existsSync(jsonPath)) {
  console.error(`File not found: ${jsonPath}`);
  process.exit(1);
}

const results: ModelRunResult[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
if (!Array.isArray(results) || !results.length) {
  console.error('JSON file appears empty or invalid.');
  process.exit(1);
}

const models   = [...new Set(results.map(r => r.modelId))];
const presetId = (results[0].presetId ?? 'balanced') as AnalysisPresetId;

printReport(results, models, presetId);

if (doSave) {
  const outDir = path.dirname(jsonPath);
  const reportPath = saveReport(results, models, presetId, outDir);
  console.log(`  Report saved → ${reportPath}`);
  console.log('');
}
