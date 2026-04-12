# bloc log

A workout tracking app for structured strength programs. Pick a program template (or build your own), log sets and reps each session, and track progress over time.

**Live:** [bloc-log.vercel.app](https://bloc-log.vercel.app)

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Zustand (state) + localStorage (persistence)
- Recharts (analytics charts)
- dnd-kit (drag-and-drop exercise reordering)
- Deployed on Vercel

## Features

- **Program templates** — 10+ built-in programs (2–5 day splits), or create a custom one
- **Workout logging** — track sets, reps, and weight with inline editing
- **Exercise search** — search and add 1000+ exercises
- **Analytics** — workout heatmap, progress charts, completion charts, csv export
- **Rest timer** — configurable countdown between sets
- **PWA-ready** — installable on mobile, works offline

## Local development

```bash
cd bloc-log
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).
