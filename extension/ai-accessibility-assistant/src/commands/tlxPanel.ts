// tlxPanel.ts — NASA TLX cognitive workload analysis pipeline
// Runs both models in parallel (Promise.all), waits for both to finish,
// merges by confidence-weighted average, then outputs the full result at once.
// This matches the Phase 4 evaluation harness (tlx-from-llm.ts) approach.

import * as vscode from "vscode";
import {
  FIXED_MODEL,
  SECONDARY_MODEL,
  ollamaGenerateStream,
} from "../utils/llm/ollama";
import { ragRetrieve, formatRagContext, RAG_CONFIG, ragCache } from "../utils/rag/rag";
import { buildTlxRagQuery } from "../utils/rag/ragQueryBuilder";
import { TLX_SYSTEM_PROMPT, buildTlxPrompt } from "../utils/prompts/tlxPrompt";
import { buildRelevantExcerpt } from "../utils/code/excerptBuilder";
import { getExtensionConfig } from "../utils/config";
import type { PanelLogger } from "../webview/panelLogger";

export async function analyseFileForTlx(
  logger: PanelLogger
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("Open a file first, then run TLX Analysis.");
    return;
  }

  const doc = editor.document;
  const text = doc.getText();
  const { ollamaHost, ragEndpoint } = getExtensionConfig();
  const model = FIXED_MODEL;
  const qwenModel = SECONDARY_MODEL;

  logger.log("═══ NASA TLX Cognitive Workload Analysis ═══");
  logger.log(`File: ${doc.fileName}`);
  logger.log(`Language: ${doc.languageId}  |  Lines: ${doc.lineCount}  |  Chars: ${text.length}`);
  logger.log(`Models: ${model} + ${qwenModel}  |  RAG: ${ragEndpoint}`);
  logger.log("");

  try {
    const excerpt = buildRelevantExcerpt(doc);
    const ragQuery = buildTlxRagQuery(doc.languageId, excerpt);
    const cacheKey = `tlx::${doc.languageId}::${ragQuery}::${excerpt.length}`;

    const cached = ragCache.get(cacheKey);
    let contextBlock: string;

    if (cached && Date.now() - cached.at < RAG_CONFIG.cacheTimeMs) {
      contextBlock = cached.context;
      logger.log("RAG: cache hit (TLX knowledge)");
    } else {
      const t0 = Date.now();
      const rag = await ragRetrieve(ragEndpoint, ragQuery, RAG_CONFIG.topK, "tlx");
      contextBlock = formatRagContext(rag.chunks);
      ragCache.set(cacheKey, { at: Date.now(), context: contextBlock });
      logger.log(`RAG: ${rag.chunks.length} chunk(s) in ${Date.now() - t0} ms`);
    }

    if (!contextBlock || contextBlock === "(no context)") {
      logger.log("⚠ No NASA-TLX knowledge chunks retrieved.");
    }

    const prompt = buildTlxPrompt(doc.languageId, excerpt, contextBlock);
    logger.log(`Running ${model} + ${qwenModel} in parallel — waiting for both…`);

    const t0 = Date.now();

    // Both models run fully in parallel — no streaming, wait for both to finish
    let kimiResponse = "";
    let qwenResponse = "";

    const [, ] = await Promise.all([
      ollamaGenerateStream(
        ollamaHost, model, prompt,
        (chunk) => { kimiResponse += chunk; },
        TLX_SYSTEM_PROMPT
      ).catch((err: Error) => { logger.log(`  ⚠ ${model} error: ${err?.message ?? err}`); }),
      ollamaGenerateStream(
        ollamaHost, qwenModel, prompt,
        (chunk) => { qwenResponse += chunk; },
        TLX_SYSTEM_PROMPT
      ).catch((err: Error) => { logger.log(`  ⚠ ${qwenModel} error: ${err?.message ?? err}`); }),
    ]);

    logger.log(`Completed in ${Date.now() - t0} ms`);

    // Parse both responses
    const kimiDimensions = extractTlxDimensions(kimiResponse);
    const qwenDimensions = extractTlxDimensions(qwenResponse);
    const merged = mergeTlxDimensions(kimiDimensions, qwenDimensions);

    logger.log(`${model}: ${kimiDimensions.length} dimension(s)  |  ${qwenModel}: ${qwenDimensions.length} dimension(s)  |  Merged: ${merged.length}`);

    if (merged.length === 0) {
      logger.log("  (Could not parse TLX dimensions from either model response)");
      return;
    }

    // Output the merged reasoning text — strip <think> blocks from both, combine
    const stripThink = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const kimiClean = stripThink(kimiResponse);
    const qwenClean = stripThink(qwenResponse);

    // Extract just the Dimension: blocks from each
    const extractDimensionText = (t: string) => {
      const idx = t.search(/Dimension:/i);
      return idx >= 0 ? t.slice(idx).trim() : t.trim();
    };

    const combinedText =
      `### ${model} Analysis\n\n${extractDimensionText(kimiClean)}\n\n` +
      `---\n\n### ${qwenModel} Analysis\n\n${extractDimensionText(qwenClean)}`;

    logger.postMessage({ type: "streamStart" });
    logger.streamChunk(combinedText);
    logger.postMessage({ type: "streamEnd" });

    // Summary table uses the merged (confidence-weighted) dimensions
    const avgRating = merged.reduce((sum, d) => sum + d.rating, 0) / merged.length;
    logger.postMessage({
      type: "tlxSummary",
      dimensions: merged,
      overall: parseFloat(avgRating.toFixed(1)),
    });

  } catch (e: any) {
    const msg = String(e?.message ?? e);
    logger.log(`\nERROR: ${msg}`);

    if (e?.cause) {
      const cause = e.cause;
      const detail = cause?.code
        ? `${cause.code}: ${cause.message ?? cause}`
        : String(cause?.message ?? cause);
      logger.log(`  Cause: ${detail}`);
    }

    if (msg.includes("connection failed") || msg.includes("ECONNREFUSED")) {
      logger.log("  → Is Ollama running? Try: ollama serve");
    } else if (msg.includes("timed out")) {
      logger.log("  → Model too slow — try the Quick profile preset.");
    } else if (msg.includes("ECONNRESET") || msg.includes("socket hang up")) {
      logger.log("  → Ollama closed the connection (likely OOM).");
    } else if (msg.includes("HTTP 404")) {
      logger.log(`  → Fixed model not found: ${model}`);
    } else if (msg.includes("HTTP 5")) {
      logger.log("  → Ollama server error. Check Ollama logs.");
    }

    logger.log("Failed to complete TLX analysis.");
  }
}

// Helper: merge two sets of TLX dimensions.
// Per dimension: take the rating from whichever model has higher confidence.
// If confidence is equal, average both ratings.
// If one model returned no results, fall back to the other entirely.
function mergeTlxDimensions(
  primary: Array<{ name: string; rating: number; confidence: number }>,
  secondary: Array<{ name: string; rating: number; confidence: number }>
): Array<{ name: string; rating: number; confidence: number }> {
  if (secondary.length === 0) { return primary; }
  if (primary.length === 0) { return secondary; }

  const secondaryMap = new Map(secondary.map(d => [d.name, d]));
  return primary.map(p => {
    const s = secondaryMap.get(p.name);
    if (!s) { return p; }
    if (p.confidence > s.confidence) { return p; }
    if (s.confidence > p.confidence) { return { name: p.name, rating: s.rating, confidence: s.confidence }; }
    // Equal confidence — average the ratings
    return { name: p.name, rating: Math.round((p.rating + s.rating) / 2), confidence: p.confidence };
  });
}

// Helper: extract TLX dimension ratings from response text
function extractTlxDimensions(text: string): Array<{ name: string; rating: number; confidence: number }> {
  const dimensions: Array<{ name: string; rating: number; confidence: number }> = [];
  
  const dimensionNames = [
    "Mental Demand",
    "Physical Demand",
    "Temporal Demand",
    "Performance",
    "Effort",
    "Frustration",
  ];

  for (const name of dimensionNames) {
    const regex = new RegExp(
      `Dimension:\\s*${name}\\s+Rating:\\s*(\\d+)\\s+Confidence:\\s*(\\d+)`,
      "i"
    );
    const match = text.match(regex);
    if (match) {
      dimensions.push({
        name,
        rating: parseInt(match[1], 10),
        confidence: parseInt(match[2], 10),
      });
    }
  }

  return dimensions;
}
