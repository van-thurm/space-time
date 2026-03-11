import * as vscode from 'vscode';
import { execFile } from 'child_process';

function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export function git(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cwd = getWorkspaceRoot();
    if (!cwd) {
      reject(new Error('No workspace folder open'));
      return;
    }
    execFile('git', args, { cwd }, (err: Error | null, stdout: string, stderr: string) => {
      if (err) {
        reject(new Error(stderr.trim() || err.message));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export class GitProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    let branchName = '(unknown)';
    try {
      branchName = await git(['branch', '--show-current']);
      if (!branchName) branchName = '(detached HEAD)';
    } catch {
      branchName = '(no git repo)';
    }

    const branchItem = new vscode.TreeItem(branchName);
    branchItem.iconPath = new vscode.ThemeIcon('git-branch');
    branchItem.description = 'current';
    branchItem.command = { command: 'designTray.gitSwitchBranch', title: 'Switch Branch' };

    const newBranchItem = new vscode.TreeItem('New Branch');
    newBranchItem.iconPath = new vscode.ThemeIcon('add');
    newBranchItem.command = { command: 'designTray.gitNewBranch', title: 'New Branch' };

    const pushItem = new vscode.TreeItem('Push');
    pushItem.iconPath = new vscode.ThemeIcon('cloud-upload');
    pushItem.command = { command: 'designTray.gitPush', title: 'Push' };

    const prItem = new vscode.TreeItem('Create PR');
    prItem.iconPath = new vscode.ThemeIcon('git-pull-request');
    prItem.command = { command: 'designTray.gitCreatePR', title: 'Create PR' };

    return [branchItem, newBranchItem, pushItem, prItem];
  }
}
