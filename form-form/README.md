# form form

A visual form builder that exports Google Apps Script files. Design forms with themes, question types, and live preview — then download ready-to-deploy `form.html` and `Code.gs` files.

Installable as a PWA on mobile and desktop.

**live:** [van-thurm.github.io/space-time/form-form](https://van-thurm.github.io/space-time/form-form/)

Deployed automatically via GitHub Actions on push to `main`.

## install on your phone

Once deployed, open the URL on your phone:

- **iOS Safari**: Tap the share button > **Add to Home Screen**
- **Android Chrome**: Tap the menu > **Install app** or **Add to Home Screen**

It launches in standalone mode (no browser chrome) and works offline.

## local development

Just open `index.html` in a browser. No build step, no dependencies.

For service worker testing, use a local server:

```bash
npx serve .
```

## customize it

Fork this repo and use your AI coding assistant to customize themes, add fields, or extend functionality. Everything lives in a single `index.html`, no build step required.

- **Themes**: add or modify color palettes in the `THEMES` object
- **Lists**: lists support custom fields per list — add categories like "Email", "Team", "City", or anything you need
- **Persistence**: data is stored in `localStorage` by default. For persistent local storage across sessions, you can add a lightweight local server (e.g. a Python script that reads/writes a JSON file). form-form will automatically sync with a server at `/api/lists` if one is running.

## files

| file | purpose |
|------|---------|
| `index.html` | The form builder app (self-contained) |
| `manifest.json` | PWA manifest for install prompts |
| `sw.js` | Service worker for offline caching |
| `icon.svg` | Vector app icon |
| `icon-192.png` | App icon (192x192) |
| `icon-512.png` | App icon (512x512) |
