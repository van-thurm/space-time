# bloc log

A workout tracking app for structured strength programs. Pick a program template (or build your own), log sets and reps each session, and track progress over time.

**Live:** [block-log.vercel.app](https://block-log.vercel.app)

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Zustand (state) + Supabase (auth + persistence)
- Supabase Auth (email OTP)
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
- **Cloud sync** — data persists across devices via Supabase
- **Dark mode** — system-aware with manual toggle
- **PWA-ready** — installable on mobile

## setup

### 1. supabase project

1. create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it
3. Go to **Auth > Email Templates**, edit the "Magic Link" template: replace `{{ .ConfirmationURL }}` with `Your code is: {{ .Token }}`
4. Go to **Settings > API**, copy the **Project URL** and **anon key**

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
cd bloc-log
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Optional: custom SMTP

Supabase's built-in email is rate-limited to 3/hour on the free tier. For production, configure a custom SMTP provider (e.g. Resend free tier) in **Auth > Settings > SMTP**.
