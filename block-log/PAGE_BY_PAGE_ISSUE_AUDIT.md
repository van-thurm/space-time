# Block Log Page-by-Page Issue Audit

Last updated: 2026-02-13
Scope: current UI behavior after navigation standardization pass

---

## Programs Page (`/programs`)

Screenshot reference:
- `.cursor/projects/Users-vanessa-riley-cursorz-space-time/assets/image-31852cc8-e3ca-49ef-9361-97e2d50f43c8.png`

### 1) "Dashboard" naming is wrong for this app language
- Status: **confirmed**
- Current behavior: header nav label shows `dashboard`.
- Likely cause: shared header defaults `homeLabel = 'dashboard'` in `src/components/ui/SecondaryPageHeader.tsx`.
- Fix direction: rename label to `block` globally (or per-page prop).

### 2) Header nav buttons are too large/crowded on mobile
- Status: **confirmed**
- Current behavior: `back` and `dashboard` are full-height text buttons (`h-11 px-3`) plus theme toggle, causing crowding.
- Likely cause: one-size nav control class in `SecondaryPageHeader`.
- Fix direction: create compact mobile variant (`icon + short label`, smaller horizontal padding), and preserve large touch target without visual bulk.

### 3) Reorder does not work as expected with active item pinned
- Status: **confirmed**
- Current behavior: active program is forced to top, so user reorder is partially blocked/overridden.
- Likely cause: `sortedPrograms` sorts active first every render in `src/app/programs/page.tsx`.
- Fix direction: stop auto-pinning active when reorder mode is available, or disable reorder when active pinning is in effect.

### 4) Reorder control should not appear in low-value/blocked states
- Status: **confirmed**
- Current behavior: reorder button appears when `activePrograms.length > 1`.
- User requirement: hide reorder when only two programs and one is active (or in any case where reorder cannot be saved meaningfully).
- Fix direction: gate reorder visibility with stronger condition and ordering rules.

### 5) Program editing is too limited and delete is too risky
- Status: **confirmed**
- Current behavior: inline rename only; tiny `✕` delete hit target in card actions.
- Likely cause: direct inline controls in `SortableProgramCard` with minimal affordance.
- Fix direction: move destructive and editable metadata actions to an explicit "Edit Program" modal/sheet with larger controls and a clear confirmation step.

### 6) Program count in header is not useful
- Status: **confirmed**
- Current behavior: subtitle shows `N programs`.
- Likely cause: `subtitle={`${activePrograms.length} program...`}` in `src/app/programs/page.tsx`.
- Fix direction: replace with contextual subtitle (for example `your block`) or no subtitle.

---

## Main Block View (`/`)

Screenshot reference:
- `.cursor/projects/Users-vanessa-riley-cursorz-space-time/assets/image-ad55cbea-1ca0-48d4-9959-9a658a4ca9c3.png`

### 1) "key lifts progress" shows impossible numbers (example: `155135`)
- Status: **confirmed**
- Current behavior: occasionally displays concatenated-like values.
- Likely cause: weight input auto-fill/typing flow can concatenate suggested + typed values before save, which then pollutes summary values.
- Affected logic:
  - Set entry behavior in `src/components/workout/SetInput.tsx`
  - Progress summary aggregation in `src/components/dashboard/ProgressSummary.tsx`
- Fix direction: harden input normalization/sanitization and validate range before persisting; clamp/ignore implausible values in summary rendering.

### 2) Workout exercise count text is inaccurate (looks hardcoded)
- Status: **needs verification after recent template/custom merges**
- Current behavior from code: `workout.exercises.length` in `src/components/dashboard/WorkoutCard.tsx`.
- Why it may still be wrong for users: source workout payload may include stale or mismatched list for rendered day, or display count includes warmups when user expects working sets.
- Fix direction: confirm expected count definition (total vs working only) and compute from resolved workout data consistently.

---

## Timer + Workout Flow (`/timer`, `/workout/[weekDay]`)

### 1) Timer back should return to workout context/scroll position
- Status: **confirmed**
- Current behavior: often returns to block root (`/`) via fallback.
- Likely cause: `SecondaryPageHeader` back logic uses strict same-origin referrer check and fallback push.
- Fix direction: add explicit return path when opening timer from workout (for example `?from=workout/1-1`) and use deterministic context-aware return.

### 2) Inconsistent exercise edit capability between standard and custom flows
- Status: **confirmed**
- Current behavior: added/custom exercises expose richer edit UI; base exercises do not.
- Likely cause: `AddedExerciseCard` supports edit state, `ExerciseCard` does not.
- Fix direction: align capabilities or provide a deliberate/clear separation with explanation.

### 3) Collapse behavior only works for completed exercises
- Status: **confirmed**
- Current behavior: collapse interaction gated by `isExerciseComplete`.
- Likely cause: header `onClick` collapse toggle only enabled when complete in `ExerciseCard`.
- Fix direction: support collapse for all statuses, with status badge indicating complete/incomplete/skipped.

### 4) Added exercise delete lacks robust confirmation
- Status: **confirmed**
- Current behavior: direct remove control without confirmation.
- Likely cause: `onRemove` wired directly in `AddedExerciseCard`.
- Fix direction: confirmation modal/sheet before delete.

### 5) Cannot undo completed set with multi-state cycle
- Status: **confirmed**
- Current behavior: set checkbox is one-way to complete.
- Likely cause: `SetInput` only supports incomplete -> complete.
- Fix direction: implement tri-state cycle: `complete -> skipped -> clear` (or `incomplete -> complete -> skipped -> clear`, per final UX decision).

### 6) Swipe-to-delete requested for exercises/programs (not sets)
- Status: **new requested enhancement**
- Notes: requires careful gesture conflict handling with drag/reorder.
- Fix direction: add two-step swipe reveal + confirm action for cards only.

---

## Suggested Fix Order (for implementation phase)

1. Programs page critical UX and safety fixes (naming, header compactness, reorder logic, edit modal, safe delete).
2. Timer return-path correctness from workout context.
3. Set input safety + tri-state toggle behavior.
4. Exercise collapse behavior for all states.
5. Main block summary hardening (invalid key-lift values + exercise count definition).
6. Optional swipe actions after core correctness is stable.
