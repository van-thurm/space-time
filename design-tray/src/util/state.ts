import * as vscode from 'vscode';

export interface RecentItem {
  type: 'figma' | 'browser' | 'sandbox' | 'branch' | 'link';
  label: string;
  url: string;
  timestamp: number;
}

export function getRecentItems(context: vscode.ExtensionContext): RecentItem[] {
  return context.workspaceState.get<RecentItem[]>('recentItems', []);
}

export function addRecentItem(context: vscode.ExtensionContext, item: RecentItem): void {
  const existing = getRecentItems(context);
  const deduped = existing.filter(i => i.url !== item.url);
  context.workspaceState.update('recentItems', [item, ...deduped].slice(0, 20));
}
