// panelLogger.ts — shared interface for sending messages to the webview panel
// Abstracts the webview messaging so command logic doesn't depend on the panel directly.

/** Callback interface the panel passes to command handlers. */
export interface PanelLogger {
  /** Append a log line to the output area. */
  log(text: string): void;
  /** Append a chunk of streamed AI text. */
  streamChunk(text: string): void;
  /** Send an arbitrary message to the webview. */
  postMessage(msg: Record<string, unknown>): void;
}
