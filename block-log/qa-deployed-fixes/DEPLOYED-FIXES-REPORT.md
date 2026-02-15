# Deployed Fixes QA Report
**URL:** https://block-log.vercel.app  
**Date:** February 11, 2026

---

## Test Results Summary

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Skip Exercise | ✅ PASS | UI updates immediately |
| 1b | Restore/Unskip | ✅ PASS | Restores immediately |
| 2 | Swap Exercise API | ❌ FAIL | Stuck on "searching..." - no results |
| 3 | Add Exercise API | ❌ FAIL | Stuck on "searching..." - no results |
| 4 | Gear Icon | ✅ PASS | Cog gear icon visible |
| 5 | Custom Program | ✅ PASS | Shows 12 weeks, 4 days |

---

## 1. Skip Exercise Test ✅ PASS

**Screenshot:** `01-skip-immediately-after-click.png`

- **Action:** Clicked X on "box jumps" exercise
- **Result:** UI updates immediately - exercise shows as greyed out with "skipped" badge and restore (↩) button
- **Fix verified:** No delay; UI reflects state right away

---

## 2. Restore/Unskip ✅ PASS

**Screenshot:** `02-restore-unskip.png`

- **Action:** Clicked restore (↩) button on skipped exercise
- **Result:** Exercise restored immediately - full card with swap/X buttons visible again
- **Fix verified:** Unskip works as expected

---

## 3. Swap Exercise API ❌ FAIL

**Screenshot:** `03-swap-search-squat-results.png`

- **Action:** Opened swap modal, typed "squat", waited 4 seconds
- **Result:** Still shows "searching..." - no actual exercise results displayed
- **Likely cause:** `NEXT_PUBLIC_EXERCISEDB_API_KEY` may not be configured in Vercel production, or RapidAPI is slow/failing
- **Code path:** Swap modal uses `exercise-db.ts` → `getExerciseDbApi().searchByName()` (client-side fetch to ExerciseDB)

---

## 4. Add Exercise API ❌ FAIL

**Screenshot:** `04-add-search-bench-results.png`

- **Action:** Opened add exercise modal, typed "bench", waited 4 seconds
- **Result:** Still shows "searching..." - no actual exercise results displayed
- **Likely cause:** Same as Swap - API key or ExerciseDB API issue
- **Code path:** Add modal uses `/api/exercises/search` (server-side route)

---

## 5. Gear Icon Check ✅ PASS

**Screenshot:** `05-settings-gear-icon.png`

- **Result:** Gear icon clearly visible in header next to "settings" - appears as a cog/cogwheel shape
- **Fix verified:** Icon updated from previous geometric style to proper gear

---

## 6. Custom Program ✅ PASS

**Screenshot:** `06-custom-program-created.png`

- **Action:** Created new Custom Program "QA Custom Program Fix"
- **Result:** Dashboard shows "week 1/12" and 4 workout cards (DAY 1, DAY 2, DAY 3, DAY 4)
- **Fix verified:** Custom programs now show 12 weeks and 4 days as expected

---

## Remaining Issues

1. **Exercise API Search (Swap & Add):** Both endpoints remain stuck on "searching..." with no results. Verify:
   - `NEXT_PUBLIC_EXERCISEDB_API_KEY` is set in Vercel environment variables
   - RapidAPI subscription is active and not rate-limited
   - Consider adding error state UI when API fails (e.g. "API not configured" or "Search failed")

2. **Optional:** Add a longer timeout or retry for slow API responses if the key is configured but responses are slow.
