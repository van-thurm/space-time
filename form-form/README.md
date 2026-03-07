# form form

A visual form builder that exports Google Apps Script files. Design forms with themes, question types, and live preview — then download ready-to-deploy `form.html` and `Code.gs` files.

Installable as a PWA on mobile and desktop.

**Live:** [van-thurm.github.io/space-time/form-form](https://van-thurm.github.io/space-time/form-form/)

Deployed automatically via GitHub Actions on push to `main`.

## Install on your phone

Once deployed, open the URL on your phone:

- **iOS Safari**: Tap the share button > **Add to Home Screen**
- **Android Chrome**: Tap the menu > **Install app** or **Add to Home Screen**

It launches in standalone mode (no browser chrome) and works offline.

## Local development

Just open `index.html` in a browser. No build step, no dependencies.

For service worker testing, use a local server:

```bash
npx serve .
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | The form builder app (self-contained) |
| `manifest.json` | PWA manifest for install prompts |
| `sw.js` | Service worker for offline caching |
| `icon.svg` | Vector app icon |
| `icon-192.png` | App icon (192x192) |
| `icon-512.png` | App icon (512x512) |
