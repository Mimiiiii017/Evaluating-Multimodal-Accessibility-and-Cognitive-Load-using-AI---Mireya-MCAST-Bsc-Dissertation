# Change Log

All notable changes to the AI Accessibility Assistant extension are documented here.

## [1.0.0] — 2026-05-16

### Added
- Sidebar webview panel with accessibility analysis UI.
- **Analyse File** command: runs AI-powered accessibility analysis on the active file (HTML, CSS, JS, TSX).
- **NASA TLX Analysis** command: predicts NASA-TLX cognitive load scores for the active file.
- **Select Analysis Profile** command: choose between balanced, strict, thorough, and quick presets.
- RAG (Retrieval-Augmented Generation) integration via local FastAPI/Chroma service.
- Ollama LLM backend integration with streaming response support.
- Diagnostic collection: findings surfaced inline in the VS Code Problems panel.
- Support for HTML, CSS, JavaScript, and TypeScript/TSX file analysis.
- Configurable Ollama host and RAG endpoint via VS Code settings.