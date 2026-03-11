import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as devEnvironment from '../features/devEnvironment';

export class QuickActionsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly extensionUri: vscode.Uri) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const figmaItem = new vscode.TreeItem('Open Figma');
    figmaItem.iconPath = {
      light: vscode.Uri.joinPath(this.extensionUri, 'resources', 'figma-dark.svg'),
      dark: vscode.Uri.joinPath(this.extensionUri, 'resources', 'figma-dark.svg'),
    };
    figmaItem.command = { command: 'designTray.openFigma', title: 'Open Figma' };
    if (this.isFigmaMcpConfigured()) {
      figmaItem.description = 'MCP';
    }

    return [
      this.makeItem('Cursor Browser', 'browser', 'designTray.openCursorBrowser'),
      this.makeItem('External Browser', 'link-external', 'designTray.openExternalBrowser'),
      figmaItem,
      this.makeItem('Sandbox', 'beaker', 'designTray.openSandbox'),
      this.makeDevEnvItem(),
      this.makeItem('Screenshot & Annotate', 'device-camera', 'designTray.screenshot'),
    ];
  }

  private makeDevEnvItem(): vscode.TreeItem {
    const item = new vscode.TreeItem('Dev Environment');
    item.command = { command: 'designTray.startDev', title: 'Dev Environment' };
    if (devEnvironment.isRunning()) {
      item.iconPath = new vscode.ThemeIcon('debug-start', new vscode.ThemeColor('testing.iconPassed'));
      item.description = 'running';
    } else {
      item.iconPath = new vscode.ThemeIcon('rocket');
    }
    return item;
  }

  private makeItem(label: string, icon: string, commandId: string): vscode.TreeItem {
    const item = new vscode.TreeItem(label);
    item.iconPath = new vscode.ThemeIcon(icon);
    item.command = { command: commandId, title: label };
    return item;
  }

  private isFigmaMcpConfigured(): boolean {
    try {
      const mcpConfig = vscode.workspace.getConfiguration('mcp');
      const servers = mcpConfig.get<Record<string, unknown>>('servers', {});
      if (Object.keys(servers).some(k => k.toLowerCase().includes('figma'))) {
        return true;
      }

      const folders = vscode.workspace.workspaceFolders;
      if (folders && folders.length > 0) {
        const mcpJsonPath = path.join(folders[0].uri.fsPath, '.cursor', 'mcp.json');
        if (fs.existsSync(mcpJsonPath)) {
          const content = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8')) as Record<string, unknown>;
          const mcpServers = (content['mcpServers'] ?? content['servers'] ?? {}) as Record<string, unknown>;
          return Object.keys(mcpServers).some(k => k.toLowerCase().includes('figma'));
        }
      }
    } catch {
      // fail silently — badge is non-critical
    }
    return false;
  }
}
