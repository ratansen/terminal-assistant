import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'ta-sidebar-view',
            new taSidebarProvider(context)
        )
    );
}

class taSidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionContext: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'submit':
                        const terminal = vscode.window.createTerminal(`TA's Terminal`);
                        terminal.show();
                        terminal.sendText(message.text);
                        break;
                }
            }
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal Assistant</title>
</head>
<body>
    <h1></h1>
    <input id="inputField" type="text" style="width: 100%;">
    <button onclick="submitInput()">Submit</button>
    <script>
        const vscode = acquireVsCodeApi();
        function submitInput() {
            const inputField = document.getElementById('inputField');
            vscode.postMessage({
                command: 'submit',
                text: inputField.value
            });
        }
    </script>
</body>
</html>`;
    }
}

export function deactivate() {}
