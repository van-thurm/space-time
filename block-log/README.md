# block log

A workout tracking app for structured strength programs. Pick a program template (or build your own), log sets and reps each session, and track progress over time.

**Live:** [block-log.vercel.app](https://block-log.vercel.app)

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
- **Exercise search** — search and add exercises from ExerciseDB
- **Analytics** — workout heatmap, progress charts, completion streaks
- **Rest timer** — configurable countdown between sets
- **Drag-and-drop** — reorder exercises within a workout
- **Dark mode** — system-aware with manual toggle
- **PWA-ready** — installable on mobile, works offline

## Local development

```bash
cd block-log
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).
