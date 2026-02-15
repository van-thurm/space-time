# Block Log Design System

This document captures the core design primitives used in Block Log so the same visual language can be reused in future apps.

## Principles

- Clarity over decoration.
- Dense but touch-friendly mobile layouts.
- Strong contrast with restrained accent usage.
- Consistent geometry (squares, sharp borders, minimal radius).

## Tokens

Defined in `src/app/globals.css`:

- Colors: `--background`, `--foreground`, `--muted`, `--border`, `--accent`, `--success`, `--surface`, `--danger`
- Typography:
  - `font-pixel` for headings and labels that need identity
  - `font-mono` for body, controls, and numeric data
- Motion:
  - Fast transitions (`transition-colors`) for immediate feedback

## Core Components

- Header pattern:
  - Use `SecondaryPageHeader` across all app routes (including `/`) to prevent visual drift
  - Sticky top bar with fixed container width: `max-w-4xl`
  - Left cluster geometry is fixed: 42x42 back slot + `block log` identity
  - Right utility cluster uses 42x42 icon buttons and `+` nav menu trigger
  - If back is hidden on a root page, keep a 42x42 spacer so `block log` does not shift
- Footer pattern:
  - Shared `AppFooter` with `VTLogo` + byline
- Workout controls:
  - Fixed action bar with strong contrast from content area
  - Inputs and buttons use consistent 2px border weight

## Usage Rules

- Prefer semantic color tokens over hardcoded values.
- Keep text casing consistent per section (avoid random title-case/sentence-case mixing).
- Reuse existing icon primitives from `src/components/ui/DieterIcons.tsx`.
- New screens should start from existing header/footer patterns before adding custom layout.
- Do not create page-specific header implementations; extend `SecondaryPageHeader` instead.

## Future Suite Reuse

For notes/todo siblings, keep:

- Same token names and base palette.
- Same typography split (`font-pixel` identity + `font-mono` functional UI).
- Same button/input border geometry and spacing rhythm.
