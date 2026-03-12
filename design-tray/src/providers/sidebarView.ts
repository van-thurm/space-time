import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { isRunning } from '../features/devEnvironment';

export const SIDEBAR_VIEW_ID = 'designTray.sidebar';

interface PrEntry {
  number: number;
  title: string;
  url: string;
  updatedAt: string;
}

function runGit(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd) {
      reject(new Error('No workspace'));
      return;
    }
    execFile('git', args, { cwd }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.trim());
    });
  });
}

function isFigmaMcpConnected(): boolean {
  try {
    const mcpServers = vscode.workspace.getConfiguration('mcp').get<Record<string, unknown>>('servers', {});
    if (Object.keys(mcpServers).some((k) => k.toLowerCase().includes('figma'))) {
      return true;
    }
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (cwd) {
      const mcpJsonPath = path.join(cwd, '.cursor', 'mcp.json');
      if (fs.existsSync(mcpJsonPath)) {
        const content = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8')) as Record<string, unknown>;
        const servers = (content['mcpServers'] ?? content['servers'] ?? {}) as Record<string, unknown>;
        return Object.keys(servers).some((k) => k.toLowerCase().includes('figma'));
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export class SidebarViewProvider implements vscode.WebviewViewProvider {
  private _view: vscode.WebviewView | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    const htmlPath = path.join(this.extensionUri.fsPath, 'webview', 'sidebar.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    webviewView.webview.html = html;

    this._view = webviewView;

    webviewView.webview.onDidReceiveMessage((message: { type: string; command?: string; args?: unknown[] }) => {
      if (message.type === 'command' && message.command) {
        const args = message.args ?? [];
        vscode.commands.executeCommand(message.command, ...args);
      } else if (message.type === 'ready') {
        this.refresh();
      }
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
  }

  refresh(): void {
    if (!this._view) return;

    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    const branchP = runGit(['branch', '--show-current']).catch(() => '(unknown)');
    const changeCountP = runGit(['status', '--porcelain'])
      .then((out) => (out ? out.split('\n').filter((l) => l.length > 0).length : 0))
      .catch(() => 0);
    const aheadCountP = runGit(['rev-list', '--count', '@{push}..HEAD'])
      .then((out) => parseInt(out, 10) || 0)
      .catch(() => 0);
    const openPrsP =
      cwd
        ? new Promise<PrEntry[]>((resolve) => {
            execFile(
              'gh',
              ['pr', 'list', '--author', '@me', '--state', 'open', '--json', 'number,title,url,updatedAt', '--limit', '30'],
              { cwd, timeout: 8000 },
              (err, stdout) => {
                if (err) {
                  resolve([]);
                  return;
                }
                try {
                  const prs = JSON.parse(stdout) as PrEntry[];
                  prs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
                  resolve(prs);
                } catch {
                  resolve([]);
                }
              }
            );
          })
        : Promise.resolve([]);

    const projectLinks = vscode.workspace.getConfiguration('designTray').get<{ label: string; url: string }[]>('projectLinks', []);
    const recentItems = this.context.workspaceState.get<unknown[]>('recentItems', []);
    const devServerRunning = isRunning();
    const figmaMcpConnected = isFigmaMcpConnected();

    Promise.allSettled([branchP, changeCountP, aheadCountP, openPrsP]).then(([branchR, changeR, aheadR, prsR]) => {
      const branch = branchR.status === 'fulfilled' ? branchR.value : '(unknown)';
      const changeCount = changeR.status === 'fulfilled' ? changeR.value : 0;
      const aheadCount = aheadR.status === 'fulfilled' ? aheadR.value : 0;
      const openPrs = prsR.status === 'fulfilled' ? prsR.value : [];

      this._view?.webview.postMessage({
        type: 'state',
        data: {
          branch,
          changeCount,
          aheadCount,
          openPrs,
          projectLinks,
          recentItems,
          devServerRunning,
          figmaMcpConnected,
        },
      });
    });
  }
}
