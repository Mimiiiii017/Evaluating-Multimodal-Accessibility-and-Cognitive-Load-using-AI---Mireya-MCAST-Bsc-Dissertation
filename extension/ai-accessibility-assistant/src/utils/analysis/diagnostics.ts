// diagnostics.ts — converts structured AiIssue objects into VS Code Problems panel entries

import * as vscode from "vscode";
import { type AiIssue } from "../types";

export function aiIssueToDiagnostic(doc: vscode.TextDocument, issue: AiIssue): vscode.Diagnostic[] {
  const severity =
    issue.severity === "high"
      ? vscode.DiagnosticSeverity.Error
      : issue.severity === "med"
        ? vscode.DiagnosticSeverity.Warning
        : vscode.DiagnosticSeverity.Information;

  const evidence = issue.evidence?.contextIds?.length
    ? `Evidence: ${issue.evidence.contextIds.join(", ")}`
    : "Evidence: (none)";

  const title = issue.title || "Accessibility issue";
  const explanation = issue.explanation || "";
  const fix = issue.fix || "No fix provided";
  const linesLabel = issue.lineHints && issue.lineHints.length > 0
    ? `Lines: ${issue.lineHints.join(", ")}`
    : issue.lineHint
      ? `Line: ${issue.lineHint}`
      : "Line: unknown";

  const parts = [title, linesLabel, explanation, `Fix: ${fix}`, evidence].filter(Boolean);
  const message = parts.join("\n");

  const primaryLine = issue.lineHints && issue.lineHints.length > 0
    ? issue.lineHints[0]
    : issue.lineHint;

  const range = bestEffortRange(doc, primaryLine);
  const d = new vscode.Diagnostic(range, message, severity);
  d.source = "AI Accessibility Assistant (RAG+Ollama)";
  return [d];
}

function bestEffortRange(doc: vscode.TextDocument, lineHint?: number): vscode.Range {
  if (lineHint && lineHint > 0 && lineHint <= doc.lineCount) {
    const line = doc.lineAt(lineHint - 1);
    return new vscode.Range(line.range.start, line.range.end);
  }
  const first = doc.lineAt(0);
  return new vscode.Range(first.range.start, first.range.end);
}
