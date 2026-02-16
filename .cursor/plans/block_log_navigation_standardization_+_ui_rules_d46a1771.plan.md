---
name: Block Log Navigation Standardization + UI Rules
overview: Standardize navigation UX and interaction affordances across Block Log using persistent Cursor UI rules plus a full retrofit of secondary-page headers, so we stop regressions and one-off fixes.
todos:
  - id: author-ui-rules
    content: Create always-on Cursor rules for Block Log navigation and interaction standards in .cursor/rules.
    status: pending
  - id: retrofit-secondary-headers
    content: Refactor timer/settings/analytics/programs/programs-new/workout headers to one consistent nav pattern.
    status: pending
  - id: harden-nav-behavior
    content: Ensure every secondary page has explicit safe return paths beyond browser history dependence.
    status: pending
  - id: validate-navigation-regression
    content: Run build + matrix + focused nav smoke checks; fix any regressions found.
    status: pending
  - id: document-standard
    content: Record the new standard and verification results in RESUME_HANDOFF_BLOCK_LOG.md.
    status: pending
isProject: false
---

# Block Log Navigation Standardization + UI Rules

## Objectives

- Eliminate icon-only/fragile back navigation patterns that force precision taps.
- Enforce a consistent, design-aligned header/navigation contract across all key pages.
- Encode the contract in persistent Cursor rules so future changes do not regress.

## New Session Kickoff Packet

- Treat [/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md](/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md) as source-of-truth context before edits.
- Assume a dirty repo; do not revert unrelated changes and do not run destructive git cleanup.
- Primary UX issue to solve first: secondary pages should never trap users behind tiny icon-only controls.
- Design direction chosen by user: icon-first visual language with short, explicit navigation labels for critical actions.
- Work only inside Block Log app scope under [/Users/vanessa.riley/cursorz/space-time/block-log](/Users/vanessa.riley/cursorz/space-time/block-log) unless a rules file is needed in `.cursor/rules`.

## Non-Negotiable Regression Guardrails

- Workout completion must not reset when reopening and save/exiting.
- Set logging/check toggles must stay reliable for all set-order entry patterns.
- Add/swap/skip/restore exercise flows must remain functional.
- Custom program week/day integrity must remain intact.
- Analytics denominator/scaling behavior must remain correct.
- Navigation must always provide a clear return path from secondary pages.

## Required Pre-Edit Read List

- [/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md](/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md)
- [/Users/vanessa.riley/cursorz/space-time/block-log/DESIGN_SYSTEM.md](/Users/vanessa.riley/cursorz/space-time/block-log/DESIGN_SYSTEM.md)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/timer/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/timer/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/settings/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/settings/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/analytics/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/analytics/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/new/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/new/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/workout/[weekDay]/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/workout/[weekDay]/page.tsx)
- [/Users/vanessa.riley/cursorz/space-time/block-log/src/components/ui/ThemeToggle.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/components/ui/ThemeToggle.tsx)

## Execution Order (Do Not Reorder)

1. Author always-on Cursor rules first, then implement code changes.
2. Retrofit headers/navigation in all targeted secondary pages.
3. Harden route fallback behavior (do not rely solely on browser history).
4. Run full regression checks.
5. Update handoff doc with exact changes and resume point.

## Rule-first foundation (always apply)

## Rule-first foundation (always apply)

- Create always-on UI convention rules in `.cursor/rules/` to define:
  - minimum touch target for primary nav controls (e.g., 42x42+)
  - required visible label for critical navigation actions (icon-first + short text)
  - required explicit home/dashboard affordance on secondary pages
  - consistent header structure/order (back cluster, identity, utilities)
  - accessibility requirements (aria labels, keyboard focus visibility)
- Proposed files:
  - [/Users/vanessa.riley/cursorz/space-time/.cursor/rules/block-log-navigation.mdc](/Users/vanessa.riley/cursorz/space-time/.cursor/rules/block-log-navigation.mdc)
  - [/Users/vanessa.riley/cursorz/space-time/.cursor/rules/block-log-interactions.mdc](/Users/vanessa.riley/cursorz/space-time/.cursor/rules/block-log-interactions.mdc)

Rule content must explicitly enforce:

- minimum tap target for interactive controls (`>=42x42`)
- visible text label for critical navigation controls
- required explicit dashboard/home affordance on secondary screens
- keyboard focus visibility and ARIA labels
- prohibition on icon-only single-path exit controls

## Full retrofit (all secondary pages)

- Apply one shared header/nav pattern to:
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/timer/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/timer/page.tsx)
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/settings/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/settings/page.tsx)
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/analytics/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/analytics/page.tsx)
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/page.tsx)
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/new/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/programs/new/page.tsx)
  - [/Users/vanessa.riley/cursorz/space-time/block-log/src/app/workout/[weekDay]/page.tsx](/Users/vanessa.riley/cursorz/space-time/block-log/src/app/workout/[weekDay]/page.tsx)
- Normalize behavior:
  - avoid relying solely on `router.back()` as the only escape path
  - preserve explicit route fallback to dashboard/program context when back-stack is unsafe
  - unify icon sizing, button hit area, spacing, and text hierarchy

## Header Contract to Apply

- Left cluster: back control (`icon + short label`) and identity/home affordance.
- Center/secondary text: page context label in existing typography system.
- Right cluster: utility controls (`ThemeToggle`, optional page action), all with consistent hit targets.
- If `router.back()` is present, include deterministic fallback link (dashboard/programs) in same header.
- Preserve existing page semantics and avoid changing business logic while refactoring navigation UI.

## Regression protection and QA loop

- Add/extend scripted checks to verify:
  - every secondary page has an obvious, clickable return path
  - no control requires precision tapping to navigate
  - navigation remains functional after typical modal/form interactions
- Re-run:
  - `npm run build`
  - `npm run qa:matrix`
  - smoke sweep focused on navigation controls and header actions

Use this exact validation sequence:

- `npm run build`
- `npm run qa:matrix`
- `node qa-smoke.mjs`
- optional exhaustive sweep when touching multiple headers:
  - `node qa-sweep-clean.mjs`

If any check fails:

- fix smallest scoped issue
- rerun failed check first
- rerun full sequence before closing session

## Session handoff updates

- Update [/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md](/Users/vanessa.riley/cursorz/space-time/block-log/RESUME_HANDOFF_BLOCK_LOG.md) with:
  - the adopted navigation standard
  - rules added and where they live
  - pages retrofitted
  - validation outcomes and remaining UX risks

## Done Definition

- All listed secondary pages follow the same header/nav contract.
- No page requires tiny icon-only precision taps for primary return navigation.
- Regression checks pass (`build`, `qa:matrix`, smoke).
- Handoff includes exact resume point and outstanding risks.

## Known Open UX Bugs (Prioritized Checklist)

- P0: Any secondary page where primary return path is icon-only or too small to tap reliably.
- P0: Any workout set control that appears interactive but does not reliably toggle completion.
- P0: Any modal flow (`add`, `swap`, `skip/restore`) that can trap navigation or lose changes silently.
- P1: Any page relying solely on `router.back()` without deterministic fallback route.
- P1: Any inconsistent header behavior across timer/settings/analytics/programs/new/workout (layout, hit-target, labels).
- P1: Any remaining hydration mismatch warnings that are reproducible without test harness DOM injection.
- P2: Micro-copy inconsistencies for nav labels (`back`, `home`, `dashboard`, `programs`) across pages.
- P2: Keyboard/focus visibility gaps on header controls and action buttons.

When a bug is found:

- capture exact route + click path + expected vs actual
- fix smallest scoped root cause
- rerun validation sequence before moving to next item

## Copy/Paste Prompt For Next Agent

Use this when opening a fresh agent window:

```text
Resume Block Log navigation standardization from .cursor/plans/block_log_navigation_standardization_+_ui_rules_d46a1771.plan.md and block-log/RESUME_HANDOFF_BLOCK_LOG.md.

Constraints:
- Do not use destructive git cleanup.
- Treat repo as dirty; do not revert unrelated edits.
- Implement rule-first: create always-on .cursor/rules for navigation + interaction standards before UI refactors.
- Retrofit secondary-page headers (timer/settings/analytics/programs/programs/new/workout) to a shared pattern: icon-first controls + short visible labels + explicit home/dashboard affordance.
- Do not rely solely on router.back().
- Preserve existing workout/program logic and regression guardrails.

Validation required before finishing:
1) npm run build
2) npm run qa:matrix
3) node qa-smoke.mjs
4) if many header changes: node qa-sweep-clean.mjs

Then update block-log/RESUME_HANDOFF_BLOCK_LOG.md with exact changes, results, and next resume point.
```

