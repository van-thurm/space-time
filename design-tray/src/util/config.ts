import * as vscode from 'vscode';

function cfg() {
  return vscode.workspace.getConfiguration('designTray');
}

export function getDevServerUrl(): string {
  return cfg().get<string>('devServerUrl', 'http://localhost:3000');
}

export function getFigmaUrl(): string {
  return cfg().get<string>('figmaUrl', '');
}

export function getSandboxUrl(): string {
  return cfg().get<string>('sandboxUrl', '');
}

export function getProjectLinks(): { label: string; url: string }[] {
  return cfg().get<{ label: string; url: string }[]>('projectLinks', []);
}

export function getStartupCommands(): { label: string; command: string }[] {
  return cfg().get<{ label: string; command: string }[]>('startupCommands', []);
}
