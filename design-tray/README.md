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

## Sections

**Quick Actions** — One-click buttons: open dev server in Cursor's Simple Browser or your system browser, open Figma, open your sandbox, start/stop your dev environment, and capture a screenshot for annotation.

**Git** — Shows your current branch. Buttons to switch branch (uses VS Code's built-in branch picker), create a new branch, push, and open a GitHub PR creation form in the browser (requires the [GitHub CLI](https://cli.github.com)).

**Project Links** — Custom links loaded from `designTray.projectLinks`. Each entry opens in your system browser and is tracked in Recent.

**Recent** — Auto-populated list of the last 20 items opened via Design Tray, with relative timestamps.
