# Design Tray

A VS Code / Cursor extension that puts your most-used design tools one click away from the Activity Bar. Open your dev server, Figma file, or sandbox without leaving the editor; manage branches; run your dev environment startup; capture and annotate screenshots — all from a single panel.

## Setup

1. Install the VSIX: open Cursor → `Cmd+Shift+P` → **Extensions: Install from VSIX…** → select `design-tray-0.1.0.vsix` → reload window.
2. Click the Design Tray icon in the Activity Bar (stacked-layers icon).
3. Add workspace settings (see below) to configure your URLs and commands.

## Settings

Add these to your workspace `.vscode/settings.json`:

| Setting | Type | Default | Example |
|---------|------|---------|---------|
| `designTray.devServerUrl` | string | `http://localhost:3000` | `"http://localhost:3001"` |
| `designTray.figmaUrl` | string | `""` | `"https://figma.com/file/abc123/MyProject"` |
| `designTray.sandboxUrl` | string | `""` | `"https://branch-main.sandbox.internal.samsara.com"` |
| `designTray.projectLinks` | array | `[]` | `[{ "label": "Storybook", "url": "http://localhost:6006" }]` |
| `designTray.startupCommands` | array | `[]` | `[{ "label": "Frontend", "command": "taskrunner frontend/only" }]` |

Settings are read live — changes take effect immediately without reloading.

## Sidebar

The entire panel is a custom webview with cards, badges, and status indicators.

**Quick Actions** — 3-column card grid: Browser, Figma (shows MCP badge when detected), Screenshot & Annotate, Sandbox, Dev Environment (shows running state), External Browser.

**Git** — Branch display with switch/create, Commit (shows live change count, file picker, message input), Push (confirmation modal with commit list and warning text, live ahead count), Create PR (opens `gh pr create --web`). Open PRs section lists your PRs from GitHub, sorted by last updated.

**Links** — Custom links from `designTray.projectLinks`, each tracked in Recent.

**Recent** — Last 20 items opened via Design Tray with relative timestamps.

**Status Bar** — Sticky footer showing current branch, change count, and MCP status.
