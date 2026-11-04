/**
 * study-6-run.ts — Study 6: Supplementary Tool Comparison Orchestrator
 *
 * Coordinates accessibility analysis across three tools for Study 6:
 *   1. AI Accessibility Assistant (source-level)
 *   2. Google Lighthouse (rendered DOM)
 *   3. Deque axe-core (rendered DOM)
 *
 * WORKFLOW
 * ────────
 *   For each fixture (html-medium, html-high):
 *     1. Query AI system for findings (reuse extension analysis pipeline)
 *     2. Spin up local server and render page for Lighthouse and axe-core
 *     3. Run Lighthouse audit via Chrome DevTools Protocol
 *     4. Run axe-core via puppeteer or axe-core Node API
 *     5. Collect all findings, normalize format, and store
 *     6. Generate alignment matrix and comparison report
 *
 * CLI USAGE
 * ─────────
 *   npm run study6:compare
 *   npm run study6:compare -- --fixture html-medium --ai-model ollama.mistral
 *   npm run study6:compare -- --all-fixtures --output ./results/study-6.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import puppeteer, { Browser, Page } from 'puppeteer';
import { STUDY_6_FIXTURES, loadFixtureHtml, Study6Fixture } from './study-6-fixtures';
import {
  createComparisonReport,
  printAlignmentMatrix,
  saveComparisonReport,
  ToolFinding,
} from './study-6-compare';

const execAsync = promisify(exec);

interface Study6Options {
  fixture?: string;
  allFixtures?: boolean;
  aiModel?: string;
  outputDir?: string;
  concurrency?: number;
  serverPort?: number;
  headless?: boolean;
}

/**
 * Parse command-line arguments.
 */
function parseArgs(): Study6Options {
  const args = process.argv.slice(2);
  const opts: Study6Options = {
    allFixtures: false,
    aiModel: 'ollama.mistral', // default local model
    outputDir: './results/study-6',
    concurrency: 1,
    serverPort: 3456,
    headless: true,
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fixture':
        opts.fixture = args[++i];
        break;
      case '--all-fixtures':
        opts.allFixtures = true;
        break;
      case '--ai-model':
        opts.aiModel = args[++i];
        break;
      case '--output':
        opts.outputDir = args[++i];
        break;
      case '--port':
        opts.serverPort = parseInt(args[++i], 10);
        break;
      case '--no-headless':
        opts.headless = false;
        break;
    }
  }
  
  return opts;
}

/**
 * Query the AI system for accessibility findings.
 * Reuses the extension's analysis pipeline.
 */
async function analyzeWithAI(htmlContent: string, aiModel: string): Promise<ToolFinding[]> {
  // This function would integrate with the actual extension analysis pipeline.
  // For now, it's a stub that demonstrates the expected interface.
  
  console.log(`[AI Analysis] Analyzing HTML with ${aiModel}...`);
  
  // Import the actual analysis functions from extension
  const { buildAiPrompt } = require('../../extension/ai-accessibility-assistant/src/utils/analysis/parser');
  const { ragRetrieve, formatRagContext } = require('../../extension/ai-accessibility-assistant/src/utils/rag/rag');
  
  // Build multi-query RAG context (same as benchmark.ts)
  const queries = [
    'link accessible name aria-label non-descriptive text "click here" "read more" nav landmark',
    'button accessible name aria-expanded toggle disclosure',
    'form input label accessible name autocomplete',
    'image alt attribute missing non-text content table header scope heading',
    'aria-labelledby aria-describedby aria-controls broken reference id',
  ];
  
  let ragContext = '';
  for (const query of queries) {
    try {
      const chunks = await ragRetrieve(query, 10, 0.5);
      const formatted = formatRagContext(chunks);
      ragContext += formatted + '\n';
    } catch (err) {
      console.log(`[AI Analysis] RAG query failed (non-fatal): ${err}`);
    }
  }
  
  // Build prompt
  const prompt = buildAiPrompt(htmlContent, ragContext);
  
  // Query AI system (via Ollama or cloud endpoint)
  // This is a stub; actual implementation depends on your LLM integration
  console.log(`[AI Analysis] Calling ${aiModel}...`);
  
  // For now, return empty findings (to be populated by actual LLM call)
  return [];
}

/**
 * Serve HTML locally and wait for server readiness.
 */
function startLocalServer(htmlContent: string, port: number): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    server.listen(port, () => {
      console.log(`[Server] Started on http://localhost:${port}`);
      resolve(server);
    });
    
    server.on('error', reject);
  });
}

/**
 * Run Lighthouse audit via CLI.
 */
async function runLighthouse(url: string, outputPath: string): Promise<ToolFinding[]> {
  console.log(`[Lighthouse] Running audit on ${url}...`);
  
  try {
    const cmd = `lighthouse ${url} --form=json --output-path=${outputPath} --chrome-flags="--headless"`;
    await execAsync(cmd);
    
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    const findings: ToolFinding[] = [];
    
    // Extract accessibility issues from Lighthouse report
    if (report.audits && report.audits['accessibility']) {
      const audit = report.audits['accessibility'];
      if (audit.details && audit.details.items) {
        audit.details.items.forEach((item: any) => {
          findings.push({
            wcag: item.wcagCriteria?.[0] || 'unknown',
            issueType: item.description || item.id,
            severity: item.severity || 'error',
            description: item.snippet || item.description,
            element: item.web_component_path || item.element,
            toolSource: 'lighthouse',
          });
        });
      }
    }
    
    console.log(`[Lighthouse] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.error(`[Lighthouse] Error: ${err}`);
    return [];
  }
}

/**
 * Run axe-core audit via puppeteer.
 */
async function runAxeCore(browser: Browser, url: string): Promise<ToolFinding[]> {
  console.log(`[axe-core] Running audit on ${url}...`);
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Inject and run axe-core
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        (window as any).axe.run((err: any, results: any) => {
          resolve(results);
        });
      });
    });
    
    await page.close();
    
    const findings: ToolFinding[] = [];
    
    // Extract violations and incomplete issues
    if ((results as any).violations) {
      ((results as any).violations as any[]).forEach(violation => {
        violation.nodes?.forEach((node: any) => {
          findings.push({
            wcag: (violation.tags?.[0] || '').replace('wcag', '').replace('wcag2', '').trim() || 'unknown',
            issueType: violation.impact ? `${violation.id} (${violation.impact})` : violation.id,
            severity: violation.impact === 'critical' ? 'error' : 'warning',
            description: violation.description,
            element: node.target?.[0] || node.html?.substring(0, 50),
            toolSource: 'axeCore',
          });
        });
      });
    }
    
    console.log(`[axe-core] Found ${findings.length} issues`);
    return findings;
  } catch (err) {
    console.error(`[axe-core] Error: ${err}`);
    return [];
  }
}

/**
 * Run comparison analysis for a single fixture.
 */
async function analyzeFixture(
  fixture: Study6Fixture,
  opts: Study6Options,
): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYZING: ${fixture.name} (${fixture.errorCount} errors)`);
  console.log(`${'='.repeat(80)}\n`);
  
  const htmlContent = loadFixtureHtml(fixture);
  
  // 1. AI Analysis (source-level)
  const aiFindings = await analyzeWithAI(htmlContent, opts.aiModel!);
  
  // 2. Start local server and run browser-based tools
  const server = await startLocalServer(htmlContent, opts.serverPort!);
  const url = `http://localhost:${opts.serverPort}`;
  
  // 3. Lighthouse (rendered DOM)
  const lighthouseOutputPath = path.join(opts.outputDir!, `lighthouse-${fixture.name}.json`);
  const lighthouseFindings = await runLighthouse(url, lighthouseOutputPath);
  
  // 4. axe-core (rendered DOM)
  const browser = await puppeteer.launch({ headless: opts.headless });
  const axeCoreFindings = await runAxeCore(browser, url);
  await browser.close();
  
  // 5. Stop server
  server.close();
  
  // 6. Generate comparison report
  const report = createComparisonReport(
    fixture.name,
    fixture.errorCount,
    opts.aiModel!,
    aiFindings,
    lighthouseFindings,
    axeCoreFindings,
  );
  
  // 7. Save and print results
  const reportPath = path.join(opts.outputDir!, `${fixture.name}-comparison.json`);
  saveComparisonReport(report, reportPath);
  printAlignmentMatrix(report);
}

/**
 * Main entry point.
 */
async function main() {
  const opts = parseArgs();
  
  // Ensure output directory exists
  if (!fs.existsSync(opts.outputDir!)) {
    fs.mkdirSync(opts.outputDir, { recursive: true });
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  Study 6: Supplementary Tool Comparison                    ║
║ Comparing AI Accessibility Assistant vs Lighthouse vs axe-core             ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
  
  try {
    const fixturesToRun = opts.allFixtures
      ? STUDY_6_FIXTURES
      : [STUDY_6_FIXTURES.find(f => f.name === opts.fixture) || STUDY_6_FIXTURES[0]];
    
    for (const fixture of fixturesToRun) {
      await analyzeFixture(fixture, opts);
    }
    
    console.log(`\n✓ Study 6 analysis complete. Results saved to ${opts.outputDir}`);
  } catch (err) {
    console.error(`✗ Error during analysis: ${err}`);
    process.exit(1);
  }
}

main();
