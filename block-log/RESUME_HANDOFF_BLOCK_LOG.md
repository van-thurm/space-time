# Block Log Resume Handoff

Last updated: 2026-02-13 (local session)  
Project root: `/Users/vanessa.riley/cursorz/space-time/block-log`

---

## 1) Exact Resume Point

Resume from this state (no commit has been created in this session):

- Build status: passing (`npm run build`)
- Runtime QA status: passing with local scripted matrices
  - `npm run qa:flow-matrix` -> 13/13 pass
  - `npm run qa:api-matrix` -> 6/6 pass
  - `npm run qa:matrix` -> both pass
- Key recent stabilization work is complete (data persistence + custom/standard flow matrix validation)

Primary file for final context in this handoff:  
- `RESUME_HANDOFF_BLOCK_LOG.md` (this file)

Artifacts generated during QA:
- `qa-flow-matrix/report.json`
- `qa-api-matrix/report.json`
- Screenshots in `qa-flow-matrix/` and `qa-api-matrix/`

---

## 2) What Was Implemented (High Value)

### P0 stability and data integrity
- Fixed completed workout regression: opening a completed workout and using save/exit no longer resets completion.
- Preserved completion state on save/exit in workout flow.
- Added skip/restore support for **added exercises** (not only base template exercises).
- Progress counts now properly exclude skipped added exercises.
- Fixed set cascade behavior to avoid unintended overwrite of saved weights in subsequent sets.

### Custom program architecture upgrade
- New custom setup supports:
  - weeks input
  - editable day names
  - add/remove/reorder days
- Store and types upgraded with:
  - `customWeeksTotal`
  - `customDaysPerWeek`
  - `customDayLabels`
  - `minWeeksTotal`
- Custom workouts generated from user-configured day labels.
- Added custom template duplication section in New Program flow.

### Analytics correctness
- Workout denominator uses planned workouts for active program (not just logged workouts).
- Total sets include bodyweight-like completed sets (`reps > 0` even if `weight=0`).
- Progress chart y-axis auto-scales for >100 values.

### UI consistency/design-system layer
- Shared footer component introduced: `src/components/ui/AppFooter.tsx`
- Sticky header consistency improved across pages.
- Dashboard header alignment corrected (logo/menu baseline drift fix).
- Programs page action clarity improved (`template`, `switch`, `active`).
- Removed rest timer control from analytics (settings-only).
- Improved timer-page theme-toggle contrast in red end state.
- Added/used geometric icon refinements (tally icon, forward arrow, cleaner gear).

### New template added
- `3-day-full-body-strength`

### Reactivity hardening
Converted several pages/components from getter-style active program reads to direct Zustand selector subscriptions to reduce stale-state edge cases:
- `src/app/page.tsx`
- `src/app/analytics/page.tsx`
- `src/app/workout/[weekDay]/page.tsx`
- `src/components/dashboard/WeekSelector.tsx`
- `src/components/analytics/ProgressChart.tsx`
- `src/components/analytics/WorkoutHeatmap.tsx`

---

## 3) QA Infrastructure Added

New local scripts (no MCP permission clicking needed):
- `qa-flow-matrix-local.mjs`
- `qa-api-matrix-local.mjs`

NPM scripts added:
- `qa:flow-matrix`
- `qa:api-matrix`
- `qa:matrix`

Recommended validation command:
```bash
npm run build && npm run qa:matrix
```

---

## 4) Key Files Touched This Session

- `src/app/workout/[weekDay]/page.tsx`
- `src/components/workout/SetInput.tsx`
- `src/components/workout/AddedExerciseCard.tsx`
- `src/components/workout/SortableExerciseList.tsx`
- `src/lib/store.ts`
- `src/types/index.ts`
- `src/app/programs/new/page.tsx`
- `src/app/programs/page.tsx`
- `src/app/page.tsx`
- `src/app/analytics/page.tsx`
- `src/components/analytics/ProgressChart.tsx`
- `src/components/analytics/WorkoutHeatmap.tsx`
- `src/components/dashboard/WorkoutCard.tsx`
- `src/components/dashboard/WeekSelector.tsx`
- `src/components/ui/DieterIcons.tsx`
- `src/components/ui/ThemeToggle.tsx`
- `src/components/ui/AppFooter.tsx` (new)
- `src/data/program-templates.ts`
- `src/data/programs/custom.ts`
- `src/data/programs/3-day-full-body-strength.ts` (new)
- `src/data/programs/index.ts`
- `DESIGN_SYSTEM.md` (new)
- `package.json` (QA scripts)

---

## 5) What To Do Next (Ordered)

1. **Final visual polish pass against annotated screenshots**
   - Focus only on remaining small inconsistencies (spacing, icon micro-adjustments, text hierarchy).
2. **Device QA on real phone after deploy**
   - Confirm sticky header/footer behavior and timer toggle visibility in live mobile Safari.
3. **Deploy and verify**
   - Deploy to Vercel.
   - Hard-refresh app and rerun manual smoke on:
     - custom and standard workout creation
     - add/swap/skip behaviors
     - complete/view/save persistence
     - analytics denominator and chart scaling
4. **Optional**
   - Implement “manifesto mode” easter egg (not yet implemented in this session).

---

## 6) Constraints and Important Notes

- Repo is currently very dirty (many modified/untracked files, including historical artifacts).
- Do **not** assume clean baseline; avoid destructive git cleanup unless explicitly requested.
- No commit performed in this session.
- Keep regression guardrails:
  - completed workout persistence
  - API search behavior in add/swap
  - custom program day/week integrity
  - skip/unskip reactivity
  - matrix scripts should stay green

---

## 7) Quick Start for Next Session

```bash
cd /Users/vanessa.riley/cursorz/space-time/block-log
npm install
npm run dev
# in separate terminal:
npm run build && npm run qa:matrix
```

Then continue from **Section 5: What To Do Next**.

---

## Session Update (2026-02-26)

### What changed
- Added explicit workout actions to reduce accidental destructive behavior:
  - `clear workout`: now clears all exercises on the page (base + added) so the workout can be rebuilt from scratch.
  - `restart workout`: now clears progress only (weights/reps/rpe/skips/completion) while preserving exercise structure edits.
- Clarified destructive confirmations with explicit copy.
- Hid in-page `clear workout` / `restart workout` controls when workout is completed.
- Updated completed-state footer reset flow to use the same restart semantics (reset to not started without surprising structure loss).

Files edited in this pass:
- `src/app/workout/[weekDay]/page.tsx`
- `src/lib/store.ts`
- `.cursor/plans/regression-point-clear-restart.patch` (rollback snapshot)

### Validation run results
- Build: passing (`npx next build`)
- Lints (edited files): no errors
- Smoke: passing (`node qa-smoke.mjs`, 7/7)
- Targeted transition check (Playwright one-off):
  - in-progress: `clear workout` and `restart workout` visible
  - completed: both hidden, `clear + reset to ready` visible
  - unfinish from completed: `clear workout` and `restart workout` visible again

### Follow-up update (timestamp semantics fix)
- Implemented Option 3 timestamp model for workout history display:
  - `WorkoutLog` now supports `startedAt`, `lastActivityAt`, `completedAt`.
  - Dashboard card date display now uses:
    - completed -> `completedAt` fallback chain
    - in-progress -> `lastActivityAt` fallback chain
    - not started -> no date shown
- Applied lazy migration behavior in code (no destructive storage rewrite):
  - Seeded hydration dates are ignored for display when no real training activity exists.
- Synced timestamp handling in:
  - `src/lib/store.ts` (set/skip/unskip/complete/unfinish/restart/clear flows)
  - `src/components/dashboard/WorkoutCard.tsx`
  - `src/app/programs/page.tsx`
  - `src/lib/export.ts`
  - `src/app/workout/[weekDay]/complete/page.tsx`
- Validation:
  - Build passing (`npx next build`)
  - Smoke passing (`node qa-smoke.mjs`, 7/7)

---

## 8) Session Update (2026-02-13)

### What changed in this pass
- Performed a low-risk UI polish pass on shared header/footer controls and card hierarchy:
  - Standardized utility control hit-area sizing to `42x42` where applicable.
  - Added stronger keyboard focus visibility on theme toggle (`focus-visible` ring + offset).
  - Improved footer spacing rhythm and byline tracking.
  - Tightened workout-card status text hierarchy (`uppercase`/tracking and tabular day numeral).

Files edited in this pass:
- `src/components/ui/ThemeToggle.tsx`
- `src/app/page.tsx`
- `src/app/analytics/page.tsx`
- `src/components/ui/AppFooter.tsx`
- `src/components/dashboard/WorkoutCard.tsx`

### Validation run results
- Build: passing (`npm run build`)
- Matrix: passing (`npm run qa:matrix`)
  - `qa:flow-matrix` -> 13/13 pass
  - `qa:api-matrix` -> 6/6 pass

High-risk regression checks explicitly reconfirmed from reports/artifacts:
- completed workout state remains done after re-open/save-exit
- add/swap API search + add UX remain healthy
- skip/restore behavior remains reactive in standard + custom flows
- custom set cascade persistence still stable (`set2=95` retained)
- custom analytics planned denominator remains correct (`1/12` observed in flow test)

Artifacts refreshed:
- `qa-flow-matrix/report.json`
- `qa-flow-matrix/custom-persistence-debug.json`
- `qa-api-matrix/report.json`

### Next resume point
1. Run a final human visual pass against annotated screenshots on-device (especially mobile Safari sticky regions and control alignment).
2. If visual parity is confirmed, proceed to deploy and repeat a short post-deploy smoke (`build` already green locally).

---

## 9) Navigation Standardization Pass (2026-02-13, prime-time hardening)

### Navigation/header standard adopted
- Secondary pages now follow one shared contract:
  - visible `back` action (`icon + label`)
  - explicit `dashboard` affordance (`icon + label`)
  - deterministic fallback route when history is unsafe (no sole dependency on `router.back()`)
  - utility controls with consistent `42x42+` hit targets and focus-visible support

### Always-on Cursor rules added
- `/.cursor/rules/block-log-navigation.mdc`
- `/.cursor/rules/block-log-interactions.mdc`

These rules enforce:
- minimum touch target (`>= 42x42`)
- visible labels on critical nav actions
- explicit secondary-page return affordance
- focus visibility and ARIA expectations
- prohibition on icon-only single-path exits

### Shared implementation added
- New shared header component:
  - `src/components/ui/SecondaryPageHeader.tsx`

### Secondary pages retrofitted
- `src/app/timer/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/analytics/page.tsx`
- `src/app/programs/page.tsx`
- `src/app/programs/new/page.tsx`
- `src/app/workout/[weekDay]/page.tsx`

### QA/smoke updates for new nav semantics
- Updated smoke script selectors to support labeled `back`/`dashboard` controls:
  - `qa-smoke.mjs`

### Validation results (post-refactor)
- `npm run build` -> pass
- `npm run qa:matrix` -> pass
  - `qa:flow-matrix` -> 13/13 pass
  - `qa:api-matrix` -> 6/6 pass
- `node qa-smoke.mjs` -> pass (7/7)
- `node qa-sweep-clean.mjs` -> non-blocking medium finding remains:
  - hydration mismatch warning (`layout.tsx/ThemeProvider`) reproduced in sweep pass 1

### Remaining UX risks
- Visual rhythm still needs final human pass on real mobile Safari (sticky header/footer + control alignment).
- Hydration mismatch warning still appears in exhaustive sweep (`layout.tsx/ThemeProvider` area); app flows remain functional but this should be resolved before broad release.
- Next.js workspace-root warning remains due to multiple lockfiles outside app root (non-blocking, but should be cleaned or configured later).

### Updated resume point
1. Run quick manual on-device nav sweep for `timer/settings/analytics/programs/new/workout`.
2. If visual pass is clean, deploy and run short post-deploy smoke.

---

## 10) Deep UX Hardening Pass (2026-02-13, user-sensitivity alignment)

### Header/nav redesign (compact menu pattern)
- Reworked secondary-page header to compact icon-first layout with flyout nav menu:
  - `src/components/ui/SecondaryPageHeader.tsx`
- Added shared swipe-action primitive for card-level two-step swipe actions:
  - `src/components/ui/SwipeAction.tsx`
- Language normalized to `block` in navigation destinations (no user-facing `dashboard` label).

### Programs page fixes
- Refactored programs card actions for safety and mobile ergonomics:
  - moved risky actions into a dedicated edit modal
  - removed tiny inline delete affordance from default row actions
  - added larger, explicit delete confirm flow
  - added week-length controls and template-save controls in modal
- Reorder logic fixed:
  - removed forced "active first" re-sort that prevented meaningful reorder persistence
  - reorder button now hidden unless there are more than 2 programs
- Removed noisy count subtitle (`N programs`) from header.
- Added swipe-to-delete entry path (two-step) on program cards:
  - swipe reveals delete action -> opens edit modal pre-armed for confirm delete.
- Files:
  - `src/app/programs/page.tsx`
  - `src/app/programs/new/page.tsx` (added structure/editing guidance copy)

### Main block corrections
- Workout card exercise count now excludes warmups for a more truthful count:
  - `src/components/dashboard/WorkoutCard.tsx`
- Key-lift progress hardened against malformed/implausible values (prevents absurd totals):
  - accepts only finite positive weights within a sane range (`<= 2000`)
  - improved workoutId parsing compatibility
  - `src/components/dashboard/ProgressSummary.tsx`

### Timer + workout interaction fixes
- Timer return behavior updated:
  - workout -> timer now carries return route with scroll position payload
  - timer back fallback honors return route when history is unavailable
  - files: `src/app/workout/[weekDay]/page.tsx`, `src/app/timer/page.tsx`
- Set control upgraded to tri-state cycle:
  - tap 1: complete
  - tap 2: skipped
  - tap 3: clear/reset
  - plus input sanitization for weight values
  - file: `src/components/workout/SetInput.tsx`
- Exercise cards improved:
  - collapse now works across statuses (complete/incomplete/skipped)
  - standard exercise edit controls added (per-workout override)
  - swipe-to-skip added for base exercises
  - file: `src/components/workout/ExerciseCard.tsx`
- Added exercise cards improved:
  - collapse behavior added
  - remove action now confirm-gated
  - swipe-to-remove entry path added (two-step)
  - file: `src/components/workout/AddedExerciseCard.tsx`
- Sortable list wiring and workout override plumbing:
  - `src/components/workout/SortableExerciseList.tsx`
  - `src/lib/store.ts`
  - `src/types/index.ts`

### Validation (post-hardening)
- `npm run build` -> pass
- `npm run qa:matrix` -> pass
  - flow: `13/13`
  - api: `6/6`
- `node qa-smoke.mjs` -> pass (`7/7`)
- `node qa-sweep-clean.mjs` -> still reports pre-existing hydration mismatch in theme/layout area and related hook-order console warning during sweep runs.

### Remaining known risk
- No functional regressions detected in required matrix/smoke sequence after this pass.

---

## 11) Hydration Mismatch Fix (2026-02-25)

### Root cause
`layout.tsx` used `<Script strategy="beforeInteractive">` from `next/script` to inject the theme detection script. In Next.js 16 App Router with React 19, the `<Script>` component has its own injection lifecycle that creates a React-managed element inside `<head>`. This element becomes a hydration boundary that React can't reconcile when the script modifies `document.documentElement.classList` before hydration completes.

### Fix applied
- Replaced `<Script strategy="beforeInteractive">{themeScript}</Script>` with `<script dangerouslySetInnerHTML={{ __html: themeScript }} />` in `layout.tsx`
- Removed `import Script from 'next/script'`
- Removed unused `THEME_SCRIPT` constant from `ThemeProvider.tsx` (was defined but never referenced)

A raw `<script>` tag renders directly in the server HTML, runs synchronously during document parsing (before React hydrates), and does not create a React element needing reconciliation.

### Files edited
- `src/app/layout.tsx`
- `src/components/ui/ThemeProvider.tsx`

### Validation results
- `npm run build` -> pass
- `npm run qa:matrix` -> pass (flow: 13/13, api: 6/6)
- `node qa-sweep-clean.mjs` -> **hydration mismatch finding eliminated** (0 console errors across 2 passes)
- Browser console on dev server: 0 errors

### Remaining known risks
- Sweep script has pre-existing dashboard/timer selector failures when run against empty localStorage state (not caused by this change, not a regression)
- No functional regressions detected

### Resume point
1. UI fixes pass (see kickoff prompt below)
2. Deploy and run post-deploy smoke
3. Optional: fix sweep script to handle empty-state dashboard gracefully

---

---

## 12) UI Polish & Infrastructure Session (2026-02-25)

### Branding updates
- Replaced header icon+text with full SVG wordmark (`BlockLogWordmark` component in `DieterIcons.tsx`)
  - Uses `currentColor` for automatic light/dark theme support
  - Fixed pixel width rounded to integer to prevent sub-pixel layout jitter
  - Center column switched from `justify-self-center` to `flex flex-col items-center` for stable positioning
- Updated favicon (`icon.tsx`) and apple touch icon (`apple-icon.tsx`) to use geometric brandmark from brand SVG (vertical bar + stacked squares, cream on dark)

### Custom template management
- Added **delete** action to saved custom templates list with inline "are you sure?" confirmation
- Added **delete** action on template detail page (step 'name') with confirmation
- Added **copy** action to duplicate a template without creating a program
- Deleting a template has no effect on existing programs
- Files: `src/app/programs/new/page.tsx`

### Bug fixes
- Custom program day limit raised from 5 to 7 (both `addCustomDay` guard and button `disabled` prop)
- Edit modal bottom padding increased (`p-4` → `p-4 pb-6`) to prevent focus ring clipping on last element
- Edit modal positioning changed from `items-end sm:items-center` to always `items-center` to fix odd-size viewport layout
- Heatmap tiles forced to sharp corners with inline `style={{ borderRadius: 0 }}` (global CSS `button { border-radius: var(--radius-ui) }` was overriding Tailwind `rounded-none` due to CSS layer precedence)

### Navigation fixes
- Added `onBack` prop to `SecondaryPageHeader` — allows parent pages to intercept the back button
- New program page: back button on template detail step now returns to template selection instead of navigating to `/programs`

### Infrastructure
- **Deleted accidental `space-time` Vercel project** created by running `vercel --prod` from repo root
- Added `.cursor/rules/block-log-deployment.mdc` — always-applied rules covering:
  - Deploy via git push only, never from repo root
  - Manifest must exist with `scope: "/"` for iOS PWA
  - Use `next/script` with `beforeInteractive` for theme script
  - localStorage is domain-scoped (different domain = "missing" data)
- Cleaned up root `.vercel/` directory

### Known issues requiring next-session attention
1. **Hydration mismatch regression**: `layout.tsx` was reverted to `<Script strategy="beforeInteractive">` to investigate a PWA navigation issue. This re-introduces the hydration mismatch that section 11 fixed with `dangerouslySetInnerHTML`. Next session should resolve this conflict — either confirm `dangerouslySetInnerHTML` doesn't break PWA nav (it probably doesn't — the PWA issue was a missing manifest, not the script tag) and revert back, or find another approach.
2. **User data loss**: User's program data was lost from `block-log.vercel.app` localStorage. Root cause unclear — possibly iOS clearing PWA storage when home screen app was re-added, or storage pressure purge. **Priority: add data export/import feature in settings to prevent future loss.**
3. **Data export/import**: Not yet implemented. User explicitly wants this. Should be a JSON download button in settings and a file upload restore.

### Files edited this session
- `src/app/layout.tsx`
- `src/app/icon.tsx`
- `src/app/apple-icon.tsx`
- `src/app/programs/page.tsx`
- `src/app/programs/new/page.tsx`
- `src/components/ui/SecondaryPageHeader.tsx`
- `src/components/ui/DieterIcons.tsx`
- `src/components/ui/ThemeProvider.tsx`
- `src/components/analytics/WorkoutHeatmap.tsx`
- `.cursor/rules/block-log-deployment.mdc` (new)

### Commits (7595a02..95538ec)
- `23cd242` UI polish: brandmark logo, template management, and corner consistency
- `e7e301c` Fix heatmap tiles: override global button border-radius with rounded-none
- `44e7210` Fix header logo shifting: stabilize center layout and round SVG dimensions
- `96c01e8` Force sharp corners on heatmap tiles with inline style override
- `2443dd3` Update app icon to full brandmark: vertical bar + stacked squares
- `b080f21` Fix edit modal: always center vertically instead of bottom-sheet on narrow viewports
- `ae1bc21` Update layout.tsx
- `b2ab3c0` Revert layout.tsx to next/script and remove accidental space-time project
- `95538ec` Add deployment and PWA rules to prevent repeat infrastructure mistakes

---

## Kickoff Prompt (Next Session)

```text
Resume Block Log from commit 95538ec (see block-log/RESUME_HANDOFF_BLOCK_LOG.md, section 12).

Context:
- Branch: main, deployed to block-log.vercel.app
- All UI polish from section 12 is live
- User lost their program data (localStorage cleared on iOS). They need a data export/import feature.

Priority tasks:
1. Add data export (JSON download) and import (file upload + restore) to the settings page.
   This is the user's top priority to prevent future data loss.
2. Resolve hydration mismatch conflict: layout.tsx currently uses <Script strategy="beforeInteractive">
   which re-introduces the hydration warning fixed in section 11. The PWA nav issue that motivated
   the revert was actually caused by a missing manifest.ts, not the script tag. Revert layout.tsx
   back to <script dangerouslySetInnerHTML> if confirmed safe.
3. Optional: audit remaining rounded corners across the app for consistency (user prefers sharp
   corners on data display elements like heatmap tiles, consistent with brutalist design direction).

Constraints:
- Deploy via git push to main only. NEVER run vercel CLI from repo root.
- Follow .cursor/rules/block-log-deployment.mdc (always applied).
- Follow .cursor/rules/block-log-navigation.mdc and block-log-interactions.mdc.
- Preserve existing workout/program data logic.

Validation:
1) npm run build
2) npm run qa:matrix
3) Verify export/import round-trips correctly

Then update block-log/RESUME_HANDOFF_BLOCK_LOG.md with changes, results, and next resume point.
```
