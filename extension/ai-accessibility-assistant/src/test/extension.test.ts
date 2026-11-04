import * as assert from 'assert';
import * as vscode from 'vscode';

suite('AI Accessibility Assistant — Extension Tests', () => {

  test('Extension activates successfully', async () => {
    const ext = vscode.extensions.getExtension('dissertation-local.ai-accessibility-assistant');
    assert.ok(ext, 'Extension should be registered');
    await ext!.activate();
    assert.ok(ext!.isActive, 'Extension should be active after activate()');
  });

  test('analyseFile command is registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('ai-accessibility-assistant.analyseFile'),
      'analyseFile command should be registered'
    );
  });

  test('tlxAnalysis command is registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('ai-accessibility-assistant.tlxAnalysis'),
      'tlxAnalysis command should be registered'
    );
  });



  test('Default Ollama host config is set', () => {
    const cfg = vscode.workspace.getConfiguration('aiAccessibilityAssistant');
    const host = cfg.get<string>('ollamaHost');
    assert.ok(host && host.startsWith('http'), 'ollamaHost should be a valid URL');
  });

  test('Default RAG endpoint config is set', () => {
    const cfg = vscode.workspace.getConfiguration('aiAccessibilityAssistant');
    const endpoint = cfg.get<string>('ragEndpoint');
    assert.ok(endpoint && endpoint.startsWith('http'), 'ragEndpoint should be a valid URL');
  });

});
