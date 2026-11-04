// excerptBuilder.ts — sends the full numbered file to the model for a complete scan

import * as vscode from "vscode";
import { RAG_CONFIG } from "../rag/rag";

// Send the entire file with every line numbered so the model can do a full scan.
// Falls back to truncation only when the file exceeds maxExcerptChars.
export function buildRelevantExcerpt(doc: vscode.TextDocument): string {
  const maxChars = RAG_CONFIG.maxExcerptChars;
  const lines = doc.getText().split(/\r?\n/);

  let out = `// Full file — ${lines.length} lines total\n`;
  for (let i = 0; i < lines.length; i++) {
    const next = `${i + 1}: ${lines[i]}\n`;
    if (out.length + next.length > maxChars) {
      out += `// ... truncated at line ${i + 1} (${maxChars} char limit)\n`;
      break;
    }
    out += next;
  }
  return out;
}
