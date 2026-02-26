# form form

A visual form builder that exports Google Apps Script files. Design forms with themes, question types, and live preview — then download ready-to-deploy `form.html` and `Code.gs` files.

Installable as a PWA on mobile and desktop.

## Deploy to GitHub Pages

1. Create a repo on GitHub (e.g. `form-form`)
2. Push this project:

```bash
git remote add origin git@github.com:YOUR_USERNAME/form-form.git
git push -u origin main
```

3. Go to **Settings > Pages** in the repo
4. Under **Source**, select **Deploy from a branch**
5. Pick **main** / **/ (root)** and save
6. Your site will be live at `https://YOUR_USERNAME.github.io/form-form/` within a minute

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
