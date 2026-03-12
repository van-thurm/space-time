import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { SidebarViewProvider, SIDEBAR_VIEW_ID } from './providers/sidebarView';
import { git } from './providers/git';
import * as config from './util/config';
import * as state from './util/state';
import * as devEnvironment from './features/devEnvironment';
import * as screenshot from './features/screenshot';

function openInSystemBrowser(url: string): void {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', url] : [url];
  execFile(cmd, args, (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Failed to open browser: ${err.message}`);
    }
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const { extensionUri } = context;

  const sidebarProvider = new SidebarViewProvider(extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, sidebarProvider)
  );

  function addToRecent(item: state.RecentItem): void {
    state.addRecentItem(context, item);
    sidebarProvider.refresh();
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('designTray.openCursorBrowser', () => {
      const url = config.getDevServerUrl();
      vscode.commands.executeCommand('simpleBrowser.api.open', url);
      addToRecent({ type: 'browser', label: 'Cursor Browser', url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openExternalBrowser', () => {
      const url = config.getDevServerUrl();
      openInSystemBrowser(url);
      addToRecent({ type: 'browser', label: 'External Browser', url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openFigma', () => {
      const url = config.getFigmaUrl();
      if (!url) {
        vscode.window.showInformationMessage('Set `designTray.figmaUrl` in workspace settings.');
        return;
      }
      openInSystemBrowser(url);
      addToRecent({ type: 'figma', label: 'Open Figma', url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openSandbox', async () => {
      let url = config.getSandboxUrl();
      if (!url) {
        vscode.window.showInformationMessage('Set `designTray.sandboxUrl` in workspace settings.');
        return;
      }
      if (url.includes('{branch}')) {
        try {
          const branch = await git(['branch', '--show-current']);
          if (!branch) {
            vscode.window.showWarningMessage('Cannot resolve {branch}: detached HEAD state.');
            return;
          }
          url = url.replace(/\{branch\}/g, branch);
        } catch {
          vscode.window.showWarningMessage('Could not detect git branch for sandbox URL.');
          return;
        }
      }
      openInSystemBrowser(url);
      addToRecent({ type: 'sandbox', label: 'Sandbox', url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openProjectLink', (url: string) => {
      openInSystemBrowser(url);
      const link = config.getProjectLinks().find(l => l.url === url);
      addToRecent({ type: 'link', label: link?.label ?? url, url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openPR', (url: string) => {
      openInSystemBrowser(url);
    }),

    vscode.commands.registerCommand('designTray.startDev', async () => {
      if (devEnvironment.isRunning()) {
        devEnvironment.stopDevEnvironment();
      } else {
        await devEnvironment.startDevEnvironment();
      }
      sidebarProvider.refresh();
    }),

    vscode.commands.registerCommand('designTray.screenshot', () => {
      screenshot.captureAndAnnotate(context);
    }),

    vscode.commands.registerCommand('designTray.gitSwitchBranch', async () => {
      try {
        await vscode.commands.executeCommand('git.checkout');
        sidebarProvider.refresh();
        try {
          const branch = await git(['branch', '--show-current']);
          if (branch) {
            addToRecent({ type: 'branch', label: branch, url: '', timestamp: Date.now() });
          }
        } catch {
          // recent tracking is non-critical
        }
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}. Are you in a git repository?`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitNewBranch', async () => {
      const name = await vscode.window.showInputBox({ prompt: 'Branch name' });
      if (!name) return;
      try {
        await git(['checkout', '-b', name]);
        sidebarProvider.refresh();
        addToRecent({ type: 'branch', label: name, url: '', timestamp: Date.now() });
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}. Are you in a git repository?`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitCommit', async () => {
      try {
        const statusOutput = await git(['status', '--porcelain']);
        if (!statusOutput) {
          vscode.window.showInformationMessage('Nothing to commit — working tree clean.');
          return;
        }

        const files = statusOutput.split('\n').map(line => {
          const code = line.substring(0, 2);
          const filePath = line.substring(3);
          const statusLabel = code === '??' ? 'untracked'
            : code.includes('M') ? 'modified'
            : code.includes('A') ? 'added'
            : code.includes('D') ? 'deleted'
            : code.includes('R') ? 'renamed'
            : code.trim();
          return { label: filePath, description: statusLabel, picked: true };
        });

        const selected = await vscode.window.showQuickPick(files, {
          canPickMany: true,
          title: 'Select files to commit',
          placeHolder: `${files.length} changed file${files.length === 1 ? '' : 's'} — uncheck any you want to skip`,
        });
        if (!selected || selected.length === 0) return;

        const message = await vscode.window.showInputBox({
          prompt: 'Commit message',
          placeHolder: 'Describe your changes…',
          validateInput: (v) => v.trim() ? null : 'Commit message is required',
        });
        if (!message) return;

        await git(['add', ...selected.map(f => f.label)]);
        await git(['commit', '-m', message]);
        vscode.window.showInformationMessage(`Committed ${selected.length} file${selected.length === 1 ? '' : 's'}.`);
        sidebarProvider.refresh();
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitPush', async () => {
      try {
        const branch = await git(['branch', '--show-current']);
        if (!branch) {
          vscode.window.showErrorMessage('Cannot push: detached HEAD state.');
          return;
        }

        let commitLines: string[] = [];
        try {
          const logOutput = await git(['log', '--oneline', '@{push}..HEAD']);
          if (logOutput) commitLines = logOutput.split('\n');
        } catch {
          try {
            const logOutput = await git(['log', '--oneline', '-10']);
            if (logOutput) commitLines = logOutput.split('\n');
          } catch { /* no commits */ }
        }

        if (commitLines.length === 0) {
          vscode.window.showInformationMessage('Nothing to push — already up to date.');
          return;
        }

        const n = commitLines.length;
        const confirm = await vscode.window.showWarningMessage(
          `Push branch "${branch}" to remote?\n\nThis will publish your commits so the team can see them. Make sure everything looks right first.\n\n${n} commit${n === 1 ? '' : 's'} to push:\n\n${commitLines.join('\n')}`,
          { modal: true },
          'Push',
        );
        if (confirm !== 'Push') return;

        await git(['push']);
        vscode.window.showInformationMessage(`Pushed "${branch}" to remote.`);
        sidebarProvider.refresh();
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitCreatePR', () => {
      const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      execFile('gh', ['pr', 'create', '--web'], { cwd }, (err: Error | null) => {
        if (err && err.message.includes('ENOENT')) {
          vscode.window.showErrorMessage('Install the GitHub CLI to create PRs: https://cli.github.com');
        } else if (err) {
          vscode.window.showErrorMessage(`Git error: ${err.message}. Are you in a git repository?`);
        }
      });
    }),

    vscode.tasks.onDidEndTask((event) => {
      devEnvironment.onTaskEnd(event);
      sidebarProvider.refresh();
    }),

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('designTray')) {
        sidebarProvider.refresh();
      }
    }),
  );
}

export function deactivate(): void {}
