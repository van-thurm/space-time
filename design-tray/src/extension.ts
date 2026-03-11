import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { QuickActionsProvider } from './providers/quickActions';
import { GitProvider, git } from './providers/git';
import { ProjectLinksProvider } from './providers/projectLinks';
import { RecentProvider } from './providers/recent';
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

  const quickActionsProvider = new QuickActionsProvider(extensionUri);
  const gitProvider = new GitProvider();
  const projectLinksProvider = new ProjectLinksProvider();
  const recentProvider = new RecentProvider(context, extensionUri);

  vscode.window.registerTreeDataProvider('designTray.quickActions', quickActionsProvider);
  vscode.window.registerTreeDataProvider('designTray.git', gitProvider);
  vscode.window.registerTreeDataProvider('designTray.projectLinks', projectLinksProvider);
  vscode.window.registerTreeDataProvider('designTray.recent', recentProvider);

  queueMicrotask(() => {
    quickActionsProvider.refresh();
    gitProvider.refresh();
    projectLinksProvider.refresh();
    recentProvider.refresh();
  });

  function addToRecent(item: state.RecentItem): void {
    state.addRecentItem(context, item);
    recentProvider.refresh();
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

    vscode.commands.registerCommand('designTray.openSandbox', () => {
      const url = config.getSandboxUrl();
      if (!url) {
        vscode.window.showInformationMessage('Set `designTray.sandboxUrl` in workspace settings.');
        return;
      }
      openInSystemBrowser(url);
      addToRecent({ type: 'sandbox', label: 'Sandbox', url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.openProjectLink', (url: string) => {
      openInSystemBrowser(url);
      const link = config.getProjectLinks().find(l => l.url === url);
      addToRecent({ type: 'link', label: link?.label ?? url, url, timestamp: Date.now() });
    }),

    vscode.commands.registerCommand('designTray.startDev', async () => {
      if (devEnvironment.isRunning()) {
        devEnvironment.stopDevEnvironment();
      } else {
        await devEnvironment.startDevEnvironment();
      }
      quickActionsProvider.refresh();
    }),

    vscode.commands.registerCommand('designTray.screenshot', () => {
      screenshot.captureAndAnnotate(context);
    }),

    vscode.commands.registerCommand('designTray.gitSwitchBranch', async () => {
      await vscode.commands.executeCommand('git.checkout');
      gitProvider.refresh();
      try {
        const branch = await git(['branch', '--show-current']);
        if (branch) {
          addToRecent({ type: 'branch', label: branch, url: '', timestamp: Date.now() });
        }
      } catch {
        // branch tracking is non-critical
      }
    }),

    vscode.commands.registerCommand('designTray.gitNewBranch', async () => {
      const name = await vscode.window.showInputBox({ prompt: 'Branch name' });
      if (!name) return;
      try {
        await git(['checkout', '-b', name]);
        gitProvider.refresh();
        addToRecent({ type: 'branch', label: name, url: '', timestamp: Date.now() });
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}. Are you in a git repository?`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitPush', async () => {
      try {
        await git(['push']);
        vscode.window.showInformationMessage('Pushed successfully.');
      } catch (err) {
        vscode.window.showErrorMessage(`Git error: ${(err as Error).message}`);
      }
    }),

    vscode.commands.registerCommand('designTray.gitCreatePR', () => {
      const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      execFile('gh', ['pr', 'create', '--web'], { cwd }, (err: Error | null) => {
        if (err && err.message.includes('ENOENT')) {
          vscode.window.showErrorMessage('Install the GitHub CLI (gh) to use this feature.');
        } else if (err) {
          vscode.window.showErrorMessage(`gh error: ${err.message}`);
        }
      });
    }),

    vscode.tasks.onDidEndTask((event) => {
      devEnvironment.onTaskEnd(event);
      quickActionsProvider.refresh();
    }),
  );
}

export function deactivate(): void {}
