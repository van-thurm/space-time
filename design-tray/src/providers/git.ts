import * as vscode from 'vscode';
import { execFile } from 'child_process';

export function git(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
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
