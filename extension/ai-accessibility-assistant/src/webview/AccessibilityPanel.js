"use strict";
// AccessibilityPanel.ts — sidebar webview panel that hosts the extension's UI
// Thin shell that wires the webview to the command handlers.
// All analysis logic lives in commands/analysePanel.ts.
// All profile-selection logic lives in commands/selectModelPanel.ts.
// Used by: extension.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityPanelProvider = exports.VIEW_ID = void 0;
const vscode = __importStar(require("vscode"));
const analysePanel_1 = require("../commands/analysePanel");
const tlxPanel_1 = require("../commands/tlxPanel");
const selectModelPanel_1 = require("../commands/selectModelPanel");
const ollama_1 = require("../utils/llm/ollama");
exports.VIEW_ID = "aiAccessibilityAssistant.panel";
class AccessibilityPanelProvider {
    _extensionUri;
    _view;
    _diagnostics;
    _isAnalysing = false;
    _isTlxAnalysing = false;
    constructor(_extensionUri, diagnostics) {
        this._extensionUri = _extensionUri;
        this._diagnostics = diagnostics;
    }
    // WebviewViewProvider
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtml();
        // Warm up both models as soon as the panel is ready
        this._warmupModels();
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.type) {
                case "analyseFile":
                    await this._runAnalysis();
                    break;
                case "tlxFile":
                    await this._runTlxAnalysis();
                    break;
                case "clear": break; // handled client-side
            }
        });
    }
    // Public API (command palette)
    async analyseFromCommand() {
        this._view?.show?.(true);
        await this._runAnalysis();
    }
    async tlxFromCommand() {
        this._view?.show?.(true);
        await this._runTlxAnalysis();
    }
    // Private wrappers
    async _runAnalysis() {
        if (this._isAnalysing) {
            vscode.window.showWarningMessage("Analysis already in progress.");
            return;
        }
        this._isAnalysing = true;
        this._postMessage({ type: "analysisStart" });
        try {
            await (0, analysePanel_1.analyseFileForPanel)(this._logger(), this._diagnostics);
        }
        finally {
            this._isAnalysing = false;
            this._postMessage({ type: "analysisEnd" });
        }
    }
    async _runTlxAnalysis() {
        if (this._isTlxAnalysing) {
            vscode.window.showWarningMessage("TLX analysis already in progress.");
            return;
        }
        this._isTlxAnalysing = true;
        this._postMessage({ type: "tlxStart" });
        try {
            await (0, tlxPanel_1.analyseFileForTlx)(this._logger());
        }
        finally {
            this._isTlxAnalysing = false;
            this._postMessage({ type: "tlxEnd" });
        }
    }
    async _warmupModels() {
        await (0, selectModelPanel_1.fetchPresetsForPanel)(this._logger());
    }
    // Logger factory
    _logger() {
        return {
            log: (text) => this._postMessage({ type: "log", text }),
            streamChunk: (text) => this._postMessage({ type: "stream", text }),
            postMessage: (msg) => this._postMessage(msg),
        };
    }
    _postMessage(msg) {
        this._view?.webview.postMessage(msg);
    }
    // Webview HTML
    _getHtml() {
        const webview = this._view.webview;
        const mediaUri = vscode.Uri.joinPath(this._extensionUri, "media");
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, "panel.css"));
        const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, "panel.js"));
        const nonce = getNonce();
        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} https://fonts.googleapis.com;
                 font-src https://fonts.gstatic.com;
                 script-src 'nonce-${nonce}';" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${cssUri}" />
</head>
<body>
  <div class="header">
    <div class="model-row">
      <span class="model-badge">
        <span class="dot"></span>
        <span id="modelName">${ollama_1.FIXED_MODEL}</span>
      </span>
    </div>
  </div>

  <div class="actions">
    <button id="btnAnalyse" title="Analyse the currently open file for accessibility issues">
      ▶  Analyse File
    </button>
    <button id="btnTlx" title="Analyze the file for NASA TLX cognitive workload">
      ▶  TLX Analysis
    </button>
  </div>

  <div class="toolbar">
    <button id="btnClear" title="Clear output">✕ Clear</button>
  </div>

  <div class="output-area" id="output">
  </div>

  <div class="status-bar">
    <span class="spinner" id="spinner"></span>
    <span id="statusText">Idle</span>
  </div>

  <script nonce="${nonce}" src="${jsUri}"></script>
</body>
</html>`;
    }
}
exports.AccessibilityPanelProvider = AccessibilityPanelProvider;
function getNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 32; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}
//# sourceMappingURL=AccessibilityPanel.js.map