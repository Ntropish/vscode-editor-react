// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "chat-completion" is now active!'
  );

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      "chatView",
      new ChatCompletionEditorProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );
}

class ChatCompletionEditorProvider implements vscode.CustomTextEditorProvider {
  private readonly _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    // Set the webview's initial html content
    webviewPanel.webview.html = await this._getHtmlForWebview(
      webviewPanel.webview
    );

    // Handle messages from the webview
    webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        switch (
          message.command
          // Handle different message commands, e.g., request chat completion
        ) {
        }
      },
      undefined,
      this._context.subscriptions
    );

    // Add logic to manage chat messages and request chat completions
  }

  private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    // Read the generated HTML file
    const htmlFilePath = path.join(
      this._context.extensionPath,
      "dist",
      "vite",
      "index.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    // Generate a nonce
    const nonce = this.getNonce();

    // Update the CSP
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}' ${webview.cspSource}; style-src ${webview.cspSource};">`;
    htmlContent = htmlContent.replace(/<head>/, `<head>${csp}`);

    // Insert the base tag
    const baseHref = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "dist", "vite")
    );
    const baseTag = `<base href="${baseHref}/">`;
    htmlContent = htmlContent.replace(/<head>/, `<head>${baseTag}`);

    // Add nonce to the script tags
    htmlContent = htmlContent.replace(/<script /g, `<script nonce="${nonce}" `);

    return htmlContent;
  }

  private getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
