// config.ts — reads and centralises all VS Code workspace settings for the extension

import * as vscode from "vscode";

export interface ExtensionConfig {
  ollamaHost: string;     // Base URL of the Ollama server
  ragEndpoint: string;    // Base URL of the RAG retrieval service
}

export function getExtensionConfig(): ExtensionConfig {
  const cfg = vscode.workspace.getConfiguration("aiAccessibilityAssistant");
  return {
    ollamaHost:  String(cfg.get("ollamaHost", "http://localhost:11434")).replace(/\/$/, ""),
    ragEndpoint: String(cfg.get("ragEndpoint", "http://127.0.0.1:8000")).replace(/\/$/, ""),
  };
}
