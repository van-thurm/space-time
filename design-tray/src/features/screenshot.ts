import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export function captureAndAnnotate(context: vscode.ExtensionContext): void {
  if (process.platform !== 'darwin') {
    vscode.window.showInformationMessage(
      'Screenshot capture is only supported on macOS. On other platforms, paste a screenshot manually.'
    );
    return;
  }

  // Interactive region select → clipboard
  exec('screencapture -c -s', async (err: Error & { code?: number } | null) => {
    if (err) {
      // User cancelled (exit 1 with no stderr) or real failure
      if (err.code !== 1) {
        vscode.window.showErrorMessage(
          'Screenshot failed. Grant screen recording permission in System Settings > Privacy & Security > Screen Recording.'
        );
      }
      return;
    }

    // Read PNG from clipboard via AppleScript
    const tmpFile = path.join(context.globalStorageUri.fsPath, `screenshot-tmp-${Date.now()}.png`);
    try {
      fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
    } catch {
      // directory may already exist
    }

    exec(
      `osascript -e 'set png_data to the clipboard as «class PNGf»' -e 'set f to open for access POSIX file "${tmpFile}" with write permission' -e 'write png_data to f' -e 'close access f'`,
      (scriptErr: Error | null) => {
        if (scriptErr) {
          vscode.window.showErrorMessage(
            'Could not read screenshot from clipboard. Make sure screen recording permission is granted.'
          );
          return;
        }

        let dataUrl: string;
        try {
          const buf = fs.readFileSync(tmpFile);
          dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
          fs.unlinkSync(tmpFile);
        } catch {
          vscode.window.showErrorMessage('Failed to read captured screenshot.');
          return;
        }

        openAnnotatePanel(context, dataUrl);
      }
    );
  });
}

function openAnnotatePanel(context: vscode.ExtensionContext, dataUrl: string): void {
  const panel = vscode.window.createWebviewPanel(
    'designTray.annotate',
    'Annotate',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview')],
    }
  );

  const htmlPath = path.join(context.extensionUri.fsPath, 'webview', 'annotate.html');
  panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

  let imageDelivered = false;

  panel.webview.onDidReceiveMessage(async (msg: { type: string; dataUrl: string }) => {
    if (msg.type === 'ready' && !imageDelivered) {
      imageDelivered = true;
      panel.webview.postMessage({ type: 'image', dataUrl });
      return;
    }

    if (msg.type === 'save') {
      const imgBuf = dataUrlToBuffer(msg.dataUrl);
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(`screenshot-${Date.now()}.png`),
        filters: { Images: ['png'] },
      });
      if (uri) {
        fs.writeFileSync(uri.fsPath, imgBuf);
        vscode.window.showInformationMessage(`Saved to ${uri.fsPath}`);
      }
    } else if (msg.type === 'copy') {
      const imgBuf = dataUrlToBuffer(msg.dataUrl);
      const tmp = path.join(context.globalStorageUri.fsPath, `screenshot-copy-${Date.now()}.png`);
      try {
        fs.writeFileSync(tmp, imgBuf);
        exec(
          `osascript -e 'set the clipboard to (read (POSIX file "${tmp}") as «class PNGf»)'`,
          (err: Error | null) => {
            try { fs.unlinkSync(tmp); } catch { /* ignore */ }
            if (err) {
              vscode.window.showErrorMessage('Failed to copy image to clipboard.');
            } else {
              vscode.window.showInformationMessage('Screenshot copied to clipboard.');
            }
          }
        );
      } catch {
        vscode.window.showErrorMessage('Failed to copy image to clipboard.');
      }
    }
  }, undefined, context.subscriptions);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dataUrlToBuffer(dataUrl: string): any {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  // Buffer is a Node.js global — available at runtime but not in TS without @types/node
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).Buffer.from(base64, 'base64');
}
