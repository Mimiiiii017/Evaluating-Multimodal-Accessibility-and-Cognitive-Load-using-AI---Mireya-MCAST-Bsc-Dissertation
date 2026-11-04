// selectModelPanel.ts — model warmup logic for the webview panel

import * as vscode from "vscode";
import {
  FIXED_MODEL,
  SECONDARY_MODEL,
  ollamaWarmup,
} from "../utils/llm/ollama";
import { getExtensionConfig } from "../utils/config";
import type { PanelLogger } from "../webview/panelLogger";

/**
 * Warm up both models and log the active configuration.
 * Called when the panel is first opened so first-analysis latency is lower.
 */
export async function fetchPresetsForPanel(logger: PanelLogger): Promise<void> {
  const { ollamaHost } = getExtensionConfig();

  logger.log(`Stage 1 model: ${FIXED_MODEL}`);
  logger.log(`Stage 2 model: ${SECONDARY_MODEL}`);
  logger.log("Warming up models…");

  await Promise.allSettled([
    ollamaWarmup(ollamaHost, FIXED_MODEL),
    ollamaWarmup(ollamaHost, SECONDARY_MODEL),
  ]);
  logger.log("Models ready.");
}

/**
 * No-op — model and parameter selection is fixed.
 * Kept for interface compatibility with AccessibilityPanel.ts.
 */
export async function applyPresetForPanel(
  _logger: PanelLogger,
  _presetId: string
): Promise<void> {
  // Models are fixed to kimi-k2.5 + qwen3.5:397b — nothing to apply.
}
