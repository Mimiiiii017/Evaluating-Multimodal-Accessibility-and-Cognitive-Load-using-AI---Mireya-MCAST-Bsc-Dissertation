import * as vscode from "vscode";
import {
  AccessibilityPanelProvider,
  VIEW_ID,
} from "./webview/AccessibilityPanel";

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection(
    "ai-accessibility-assistant"
  );

  const panelProvider = new AccessibilityPanelProvider(
    context.extensionUri,
    diagnostics
  );

  const viewDisposable = vscode.window.registerWebviewViewProvider(
    VIEW_ID,
    panelProvider,
    { webviewOptions: { retainContextWhenHidden: true } }
  );

  // Commands still work from the Command Palette — they delegate to the panel
  const analyseDisposable = vscode.commands.registerCommand(
    "ai-accessibility-assistant.analyseFile",
    () => panelProvider.analyseFromCommand()
  );

  const tlxDisposable = vscode.commands.registerCommand(
    "ai-accessibility-assistant.tlxAnalysis",
    () => panelProvider.tlxFromCommand()
  );

  context.subscriptions.push(
    diagnostics,
    viewDisposable,
    analyseDisposable,
    tlxDisposable
  );
}

export function deactivate() {}
