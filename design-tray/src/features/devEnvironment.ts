import * as vscode from 'vscode';
import * as config from '../util/config';

const activeTasks: vscode.TaskExecution[] = [];

export function isRunning(): boolean {
  return activeTasks.length > 0;
}

export async function startDevEnvironment(): Promise<void> {
  const commands = config.getStartupCommands();
  if (commands.length === 0) {
    vscode.window.showInformationMessage('Set designTray.startupCommands in your workspace settings.');
    return;
  }
  for (const entry of commands) {
    const task = new vscode.Task(
      { type: 'shell' },
      vscode.TaskScope.Workspace,
      entry.label,
      'Design Tray',
      new vscode.ShellExecution(entry.command)
    );
    const execution = await vscode.tasks.executeTask(task);
    activeTasks.push(execution);
  }
}

export function stopDevEnvironment(): void {
  for (const execution of activeTasks) {
    execution.terminate();
  }
  activeTasks.length = 0;
}

export function onTaskEnd(event: vscode.TaskEndEvent): void {
  const idx = activeTasks.indexOf(event.execution);
  if (idx !== -1) {
    activeTasks.splice(idx, 1);
  }
}
