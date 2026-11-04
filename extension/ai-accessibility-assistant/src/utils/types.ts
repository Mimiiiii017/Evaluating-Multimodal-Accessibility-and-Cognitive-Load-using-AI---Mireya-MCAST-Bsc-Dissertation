// types.ts — defines the shared AiIssue type used across the analysis pipeline
export type AiIssue = {
  severity?: "low" | "med" | "high";
  title?: string;
  explanation?: string;
  fix?: string;
  lineHint?: number; // Single line (when combining same issue across multiple lines, use lineHints)
  lineHints?: number[]; // Multiple lines (when same problem appears on multiple lines)
  evidence?: { contextIds?: string[] };
};
