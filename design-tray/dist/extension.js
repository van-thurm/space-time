"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode6 = __toESM(require("vscode"));
var import_child_process4 = require("child_process");

// src/providers/sidebarView.ts
var vscode3 = __toESM(require("vscode"));
var import_child_process = require("child_process");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/features/devEnvironment.ts
var vscode2 = __toESM(require("vscode"));

// src/util/config.ts
var vscode = __toESM(require("vscode"));
function cfg() {
  return vscode.workspace.getConfiguration("designTray");
}
function getDevServerUrl() {
  return cfg().get("devServerUrl", "http://localhost:3000");
}
function getFigmaUrl() {
  return cfg().get("figmaUrl", "");
}
function getSandboxUrl() {
  return cfg().get("sandboxUrl", "");
}
function getProjectLinks() {
  return cfg().get("projectLinks", []);
}
function getStartupCommands() {
  return cfg().get("startupCommands", []);
}

// src/features/devEnvironment.ts
var activeTasks = [];
function isRunning() {
  return activeTasks.length > 0;
}
async function startDevEnvironment() {
  const commands3 = getStartupCommands();
  if (commands3.length === 0) {
    vscode2.window.showInformationMessage("Set designTray.startupCommands in your workspace settings.");
    return;
  }
  for (const entry of commands3) {
    const task = new vscode2.Task(
      { type: "shell" },
      vscode2.TaskScope.Workspace,
      entry.label,
      "Design Tray",
      new vscode2.ShellExecution(entry.command)
    );
    const execution = await vscode2.tasks.executeTask(task);
    activeTasks.push(execution);
  }
}
function stopDevEnvironment() {
  for (const execution of activeTasks) {
    execution.terminate();
  }
  activeTasks.length = 0;
}
function onTaskEnd(event) {
  const idx = activeTasks.indexOf(event.execution);
  if (idx !== -1) {
    activeTasks.splice(idx, 1);
  }
}

// src/providers/sidebarView.ts
var SIDEBAR_VIEW_ID = "designTray.sidebar";
function runGit(args) {
  return new Promise((resolve, reject) => {
    const cwd = vscode3.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd) {
      reject(new Error("No workspace"));
      return;
    }
    (0, import_child_process.execFile)("git", args, { cwd }, (err, stdout) => {
      if (err)
        reject(err);
      else
        resolve(stdout.trim());
    });
  });
}
function isFigmaMcpConnected() {
  try {
    const mcpServers = vscode3.workspace.getConfiguration("mcp").get("servers", {});
    if (Object.keys(mcpServers).some((k) => k.toLowerCase().includes("figma"))) {
      return true;
    }
    const cwd = vscode3.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (cwd) {
      const mcpJsonPath = path.join(cwd, ".cursor", "mcp.json");
      if (fs.existsSync(mcpJsonPath)) {
        const content = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
        const servers = content["mcpServers"] ?? content["servers"] ?? {};
        return Object.keys(servers).some((k) => k.toLowerCase().includes("figma"));
      }
    }
  } catch {
  }
  return false;
}
var SidebarViewProvider = class {
  constructor(extensionUri, context) {
    this.extensionUri = extensionUri;
    this.context = context;
  }
  resolveWebviewView(webviewView, _context, _token) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    const htmlPath = path.join(this.extensionUri.fsPath, "webview", "sidebar.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    webviewView.webview.html = html;
    this._view = webviewView;
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.type === "command" && message.command) {
        const args = message.args ?? [];
        vscode3.commands.executeCommand(message.command, ...args);
      } else if (message.type === "ready") {
        this.refresh();
      }
    });
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
  }
  refresh() {
    if (!this._view)
      return;
    const cwd = vscode3.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const branchP = runGit(["branch", "--show-current"]).catch(() => "(unknown)");
    const changeCountP = runGit(["status", "--porcelain"]).then((out) => out ? out.split("\n").filter((l) => l.length > 0).length : 0).catch(() => 0);
    const aheadCountP = runGit(["rev-list", "--count", "@{push}..HEAD"]).then((out) => parseInt(out, 10) || 0).catch(() => 0);
    const openPrsP = cwd ? new Promise((resolve) => {
      (0, import_child_process.execFile)(
        "gh",
        ["pr", "list", "--author", "@me", "--state", "open", "--json", "number,title,url,updatedAt", "--limit", "30"],
        { cwd, timeout: 8e3 },
        (err, stdout) => {
          if (err) {
            resolve([]);
            return;
          }
          try {
            const prs = JSON.parse(stdout);
            prs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            resolve(prs);
          } catch {
            resolve([]);
          }
        }
      );
    }) : Promise.resolve([]);
    const projectLinks = vscode3.workspace.getConfiguration("designTray").get("projectLinks", []);
    const recentItems = this.context.workspaceState.get("recentItems", []);
    const devServerRunning = isRunning();
    const figmaMcpConnected = isFigmaMcpConnected();
    Promise.allSettled([branchP, changeCountP, aheadCountP, openPrsP]).then(([branchR, changeR, aheadR, prsR]) => {
      const branch = branchR.status === "fulfilled" ? branchR.value : "(unknown)";
      const changeCount = changeR.status === "fulfilled" ? changeR.value : 0;
      const aheadCount = aheadR.status === "fulfilled" ? aheadR.value : 0;
      const openPrs = prsR.status === "fulfilled" ? prsR.value : [];
      this._view?.webview.postMessage({
        type: "state",
        data: {
          branch,
          changeCount,
          aheadCount,
          openPrs,
          projectLinks,
          recentItems,
          devServerRunning,
          figmaMcpConnected
        }
      });
    });
  }
};

// src/providers/git.ts
var vscode4 = __toESM(require("vscode"));
var import_child_process2 = require("child_process");
function git(args) {
  return new Promise((resolve, reject) => {
    const cwd = vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd) {
      reject(new Error("No workspace folder open"));
      return;
    }
    (0, import_child_process2.execFile)("git", args, { cwd }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr.trim() || err.message));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// src/util/state.ts
function getRecentItems(context) {
  return context.workspaceState.get("recentItems", []);
}
function addRecentItem(context, item) {
  const existing = getRecentItems(context);
  const deduped = existing.filter((i) => i.url !== item.url);
  context.workspaceState.update("recentItems", [item, ...deduped].slice(0, 20));
}

// src/features/screenshot.ts
var vscode5 = __toESM(require("vscode"));
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var import_child_process3 = require("child_process");
function captureAndAnnotate(context) {
  if (process.platform !== "darwin") {
    vscode5.window.showInformationMessage(
      "Screenshot capture is only supported on macOS. On other platforms, paste a screenshot manually."
    );
    return;
  }
  (0, import_child_process3.exec)("screencapture -c -s", async (err) => {
    if (err) {
      if (err.code !== 1) {
        vscode5.window.showErrorMessage(
          "Screenshot failed. Grant screen recording permission in System Settings > Privacy & Security > Screen Recording."
        );
      }
      return;
    }
    const tmpFile = path2.join(context.globalStorageUri.fsPath, `screenshot-tmp-${Date.now()}.png`);
    try {
      fs2.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
    } catch {
    }
    (0, import_child_process3.exec)(
      `osascript -e 'set png_data to the clipboard as \xABclass PNGf\xBB' -e 'set f to open for access POSIX file "${tmpFile}" with write permission' -e 'write png_data to f' -e 'close access f'`,
      (scriptErr) => {
        if (scriptErr) {
          vscode5.window.showErrorMessage(
            "Could not read screenshot from clipboard. Make sure screen recording permission is granted."
          );
          return;
        }
        let dataUrl;
        try {
          const buf = fs2.readFileSync(tmpFile);
          dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
          fs2.unlinkSync(tmpFile);
        } catch {
          vscode5.window.showErrorMessage("Failed to read captured screenshot.");
          return;
        }
        openAnnotatePanel(context, dataUrl);
      }
    );
  });
}
function openAnnotatePanel(context, dataUrl) {
  const panel = vscode5.window.createWebviewPanel(
    "designTray.annotate",
    "Annotate",
    vscode5.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode5.Uri.joinPath(context.extensionUri, "webview")]
    }
  );
  const htmlPath = path2.join(context.extensionUri.fsPath, "webview", "annotate.html");
  panel.webview.html = fs2.readFileSync(htmlPath, "utf8");
  let imageDelivered = false;
  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg.type === "ready" && !imageDelivered) {
      imageDelivered = true;
      panel.webview.postMessage({ type: "image", dataUrl });
      return;
    }
    if (msg.type === "save") {
      const imgBuf = dataUrlToBuffer(msg.dataUrl);
      const uri = await vscode5.window.showSaveDialog({
        defaultUri: vscode5.Uri.file(`screenshot-${Date.now()}.png`),
        filters: { Images: ["png"] }
      });
      if (uri) {
        fs2.writeFileSync(uri.fsPath, imgBuf);
        vscode5.window.showInformationMessage(`Saved to ${uri.fsPath}`);
      }
    } else if (msg.type === "copy") {
      const imgBuf = dataUrlToBuffer(msg.dataUrl);
      const tmp = path2.join(context.globalStorageUri.fsPath, `screenshot-copy-${Date.now()}.png`);
      try {
        fs2.writeFileSync(tmp, imgBuf);
        (0, import_child_process3.exec)(
          `osascript -e 'set the clipboard to (read (POSIX file "${tmp}") as \xABclass PNGf\xBB)'`,
          (err) => {
            try {
              fs2.unlinkSync(tmp);
            } catch {
            }
            if (err) {
              vscode5.window.showErrorMessage("Failed to copy image to clipboard.");
            } else {
              vscode5.window.showInformationMessage("Screenshot copied to clipboard.");
            }
          }
        );
      } catch {
        vscode5.window.showErrorMessage("Failed to copy image to clipboard.");
      }
    }
  }, void 0, context.subscriptions);
}
function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return globalThis.Buffer.from(base64, "base64");
}

// src/extension.ts
function openInSystemBrowser(url) {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", url] : [url];
  (0, import_child_process4.execFile)(cmd, args, (err) => {
    if (err) {
      vscode6.window.showErrorMessage(`Failed to open browser: ${err.message}`);
    }
  });
}
function activate(context) {
  const { extensionUri } = context;
  const sidebarProvider = new SidebarViewProvider(extensionUri, context);
  context.subscriptions.push(
    vscode6.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, sidebarProvider)
  );
  function addToRecent(item) {
    addRecentItem(context, item);
    sidebarProvider.refresh();
  }
  context.subscriptions.push(
    vscode6.commands.registerCommand("designTray.openCursorBrowser", () => {
      const url = getDevServerUrl();
      vscode6.commands.executeCommand("simpleBrowser.api.open", url);
      addToRecent({ type: "browser", label: "Cursor Browser", url, timestamp: Date.now() });
    }),
    vscode6.commands.registerCommand("designTray.openExternalBrowser", () => {
      const url = getDevServerUrl();
      openInSystemBrowser(url);
      addToRecent({ type: "browser", label: "External Browser", url, timestamp: Date.now() });
    }),
    vscode6.commands.registerCommand("designTray.openFigma", () => {
      const url = getFigmaUrl();
      if (!url) {
        vscode6.window.showInformationMessage("Set `designTray.figmaUrl` in workspace settings.");
        return;
      }
      openInSystemBrowser(url);
      addToRecent({ type: "figma", label: "Open Figma", url, timestamp: Date.now() });
    }),
    vscode6.commands.registerCommand("designTray.openSandbox", () => {
      const url = getSandboxUrl();
      if (!url) {
        vscode6.window.showInformationMessage("Set `designTray.sandboxUrl` in workspace settings.");
        return;
      }
      openInSystemBrowser(url);
      addToRecent({ type: "sandbox", label: "Sandbox", url, timestamp: Date.now() });
    }),
    vscode6.commands.registerCommand("designTray.openProjectLink", (url) => {
      openInSystemBrowser(url);
      const link = getProjectLinks().find((l) => l.url === url);
      addToRecent({ type: "link", label: link?.label ?? url, url, timestamp: Date.now() });
    }),
    vscode6.commands.registerCommand("designTray.openPR", (url) => {
      openInSystemBrowser(url);
    }),
    vscode6.commands.registerCommand("designTray.startDev", async () => {
      if (isRunning()) {
        stopDevEnvironment();
      } else {
        await startDevEnvironment();
      }
      sidebarProvider.refresh();
    }),
    vscode6.commands.registerCommand("designTray.screenshot", () => {
      captureAndAnnotate(context);
    }),
    vscode6.commands.registerCommand("designTray.gitSwitchBranch", async () => {
      try {
        await vscode6.commands.executeCommand("git.checkout");
        sidebarProvider.refresh();
        try {
          const branch = await git(["branch", "--show-current"]);
          if (branch) {
            addToRecent({ type: "branch", label: branch, url: "", timestamp: Date.now() });
          }
        } catch {
        }
      } catch (err) {
        vscode6.window.showErrorMessage(`Git error: ${err.message}. Are you in a git repository?`);
      }
    }),
    vscode6.commands.registerCommand("designTray.gitNewBranch", async () => {
      const name = await vscode6.window.showInputBox({ prompt: "Branch name" });
      if (!name)
        return;
      try {
        await git(["checkout", "-b", name]);
        sidebarProvider.refresh();
        addToRecent({ type: "branch", label: name, url: "", timestamp: Date.now() });
      } catch (err) {
        vscode6.window.showErrorMessage(`Git error: ${err.message}. Are you in a git repository?`);
      }
    }),
    vscode6.commands.registerCommand("designTray.gitCommit", async () => {
      try {
        const statusOutput = await git(["status", "--porcelain"]);
        if (!statusOutput) {
          vscode6.window.showInformationMessage("Nothing to commit \u2014 working tree clean.");
          return;
        }
        const files = statusOutput.split("\n").map((line) => {
          const code = line.substring(0, 2);
          const filePath = line.substring(3);
          const statusLabel = code === "??" ? "untracked" : code.includes("M") ? "modified" : code.includes("A") ? "added" : code.includes("D") ? "deleted" : code.includes("R") ? "renamed" : code.trim();
          return { label: filePath, description: statusLabel, picked: true };
        });
        const selected = await vscode6.window.showQuickPick(files, {
          canPickMany: true,
          title: "Select files to commit",
          placeHolder: `${files.length} changed file${files.length === 1 ? "" : "s"} \u2014 uncheck any you want to skip`
        });
        if (!selected || selected.length === 0)
          return;
        const message = await vscode6.window.showInputBox({
          prompt: "Commit message",
          placeHolder: "Describe your changes\u2026",
          validateInput: (v) => v.trim() ? null : "Commit message is required"
        });
        if (!message)
          return;
        await git(["add", ...selected.map((f) => f.label)]);
        await git(["commit", "-m", message]);
        vscode6.window.showInformationMessage(`Committed ${selected.length} file${selected.length === 1 ? "" : "s"}.`);
        sidebarProvider.refresh();
      } catch (err) {
        vscode6.window.showErrorMessage(`Git error: ${err.message}`);
      }
    }),
    vscode6.commands.registerCommand("designTray.gitPush", async () => {
      try {
        const branch = await git(["branch", "--show-current"]);
        if (!branch) {
          vscode6.window.showErrorMessage("Cannot push: detached HEAD state.");
          return;
        }
        let commitLines = [];
        try {
          const logOutput = await git(["log", "--oneline", "@{push}..HEAD"]);
          if (logOutput)
            commitLines = logOutput.split("\n");
        } catch {
          try {
            const logOutput = await git(["log", "--oneline", "-10"]);
            if (logOutput)
              commitLines = logOutput.split("\n");
          } catch {
          }
        }
        if (commitLines.length === 0) {
          vscode6.window.showInformationMessage("Nothing to push \u2014 already up to date.");
          return;
        }
        const n = commitLines.length;
        const confirm = await vscode6.window.showWarningMessage(
          `Push branch "${branch}" to remote?

This will publish your commits so the team can see them. Make sure everything looks right first.

${n} commit${n === 1 ? "" : "s"} to push:

${commitLines.join("\n")}`,
          { modal: true },
          "Push"
        );
        if (confirm !== "Push")
          return;
        await git(["push"]);
        vscode6.window.showInformationMessage(`Pushed "${branch}" to remote.`);
        sidebarProvider.refresh();
      } catch (err) {
        vscode6.window.showErrorMessage(`Git error: ${err.message}`);
      }
    }),
    vscode6.commands.registerCommand("designTray.gitCreatePR", () => {
      const cwd = vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath;
      (0, import_child_process4.execFile)("gh", ["pr", "create", "--web"], { cwd }, (err) => {
        if (err && err.message.includes("ENOENT")) {
          vscode6.window.showErrorMessage("Install the GitHub CLI to create PRs: https://cli.github.com");
        } else if (err) {
          vscode6.window.showErrorMessage(`Git error: ${err.message}. Are you in a git repository?`);
        }
      });
    }),
    vscode6.tasks.onDidEndTask((event) => {
      onTaskEnd(event);
      sidebarProvider.refresh();
    }),
    vscode6.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("designTray")) {
        sidebarProvider.refresh();
      }
    })
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
