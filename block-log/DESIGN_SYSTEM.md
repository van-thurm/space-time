# Block Log Design System

This document is the canonical reference for Block Log's design language. It is read by Cursor agents during coding sessions and by the Cowork sketch-to-code skill at `cursorz/.skills/block-log-sketch/SKILL.md`. Keep both in sync when making changes here.

---

## Principles

- Clarity over decoration.
- Dense but touch-friendly mobile layouts.
- Strong contrast with restrained accent usage.
- Consistent geometry — squares, sharp borders, zero radius.
- **Everything is lowercase** — page titles, nav items, button labels, section headings, all UI copy. This is a core brand rule. UPPERCASE is used only for `form-label` sub-headers (small caps, spaced tracking).

---

## Tokens

Defined in `src/app/globals.css`. Always use CSS variable references via Tailwind (`text-foreground`, `bg-background`, etc.) — never hardcode hex values.

| token | light | dark | use |
|---|---|---|---|
| `--background` | #FAF7F2 | #121110 | page background |
| `--foreground` | #1A1715 | #F5F0E8 | primary text, filled buttons |
| `--muted` | #8C857D | #9C9488 | secondary text, placeholders, icons |
| `--border` | #DDD8D0 | #2A2724 | all borders |
| `--accent` | #C4572A | #E06B3A | rust orange — CTAs, active states, the `+` motif |
| `--accent-foreground` | #FAF7F2 | #121110 | text on accent backgrounds |
| `--success` | #3B7D52 | #5EA872 | completed states |
| `--surface` | #F0ECE4 | #1C1A17 | card and section backgrounds |
| `--danger` | #B8352A | #E05A50 | destructive actions |
| `--active` | #D4864A | #E7A054 | in-progress/active states |
| `--subtle` | #A69B8E | #6B6259 | very faint text |

---

## Typography

Font: **Sora** (Google Fonts) — loaded via `next/font/google`, variable `--font-sans`. Weights: 400, 500, 600, 700.

- `font-display` — `font-bold letter-spacing: -0.01em` — section headings, workout names, numerals
- `font-sans` — body text, UI controls, labels
- `form-label` class — `text-xs uppercase tracking-[0.06em] text-muted` — sub-header labels only
- `tabular-nums` — all numeric displays

---

## Geometry

**Zero border-radius everywhere.** `globals.css` sets `* { border-radius: 0 }` globally. This applies to all elements including buttons, inputs, cards, modals. Do not add `rounded-*` Tailwind classes unless explicitly overriding for a documented reason.

- Default stroke: `border` (1px) for most elements
- Emphasis stroke: `border-2` (2px) only for explicit semantic emphasis — active rails, selected states
- `--radius-ui: 6px` is defined as a token but the global override means it only applies when explicitly referenced

---

## Layout Constants

- **Page shell:** `<main className="min-h-screen bg-background">`
- **Dashboard-width content:** `max-w-4xl mx-auto px-4 py-8 space-y-8`
- **Settings-width content:** `max-w-2xl mx-auto px-4 py-6 space-y-6`
- **Section container:** `<section className="border border-border p-4 space-y-4">`
- **2-col grid:** `grid grid-cols-1 md:grid-cols-2 gap-4`
- **4-col grid:** `grid grid-cols-2 md:grid-cols-4 gap-4`
- `touch-manipulation` on all interactive elements

---

## Core Components

- **Header:** Use `SecondaryPageHeader` on every route including `/`. Sticky, `border-b border-border`. Layout: 42×42 back slot | block log wordmark | 42×42 `+` menu button. Subtitle (lowercase) shown below wordmark. Never create page-specific header implementations.
- **Footer:** `AppFooter` with `VTLogo` + "built by van thurm". Always at bottom.
- **Button:** `variant` = `primary` (bg-foreground text-background) / `secondary` (border border-foreground) / `ghost`. `size` = `sm` / `md` / `lg`.
- **WorkoutCard:** Status-tinted card with left border accent. Neutral / in-progress (accent) / completed (success) states.
- **Toggle:** Custom `w-16 h-11` slide control — success/surface colors, sliding `w-6 h-6` indicator.
- **Icons:** All custom SVGs in `src/components/ui/DieterIcons.tsx`. Use existing icons before creating new ones.

---

## Usage Rules

- Prefer semantic color tokens over hardcoded values.
- All text casing lowercase unless explicitly `form-label`.
- The `+` symbol is a brand accent motif — appears before nav items, CTAs, certain actions as `<span className="text-accent">+</span>`.
- Reuse existing icon primitives from `DieterIcons.tsx`.
- New screens start from existing header/footer patterns before adding custom layout.
- Do not create page-specific header implementations; extend `SecondaryPageHeader` instead.

---

## Cursor Rules

Always-applied rules for coding sessions:
- `/.cursor/rules/block-log-navigation.mdc` — touch targets, back affordances, focus visibility
- `/.cursor/rules/block-log-interactions.mdc` — interaction patterns
- `/.cursor/rules/block-log-deployment.mdc` — deploy via git push only, never `vercel` CLI from root

---

## Future Suite Reuse

For sibling apps (notes, todo, etc.), preserve:
- Same token names and base palette
- Same font (Sora) and typographic split
- Same zero-radius geometry
- Same button/input border rhythm
