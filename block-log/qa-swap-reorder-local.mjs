#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-swap-reorder');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function rec(results, test, passed, notes = '') {
  results.push({ test, passed, notes });
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${test}${notes ? `: ${notes}` : ''}`);
}

async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
}

async function safeClick(locator) {
  try {
    await locator.click({ timeout: 5000 });
  } catch {
    await locator.click({ force: true, timeout: 5000 });
  }
}

async function dragTo(page, from, to) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) return false;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(350);
  return true;
}

async function createProgram(page, mode, name) {
  await go(page, '/programs/new');
  const modeBtn = page.locator(`button:has-text("${mode}")`).first();
  await safeClick(modeBtn);
  await page.waitForTimeout(250);
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill(name);
  await safeClick(page.locator('button:has-text("create program")').first());
  await page.waitForTimeout(700);
}

async function runSwapScenario(page, results, label, mutate, finalize) {
  const editBtn = page.locator('button:has-text("edit")').first();
  await safeClick(editBtn);
  await page.waitForTimeout(180);

  if (mutate) {
    await mutate();
  }

  const swapBtn = page.locator('button:has-text("swap")').first();
  const hasSwapBtn = await swapBtn.isVisible().catch(() => false);
  if (!hasSwapBtn) {
    rec(results, `${label} swap button visible`, false, 'swap button not found in edit actions');
    return;
  }
  await safeClick(swapBtn);
  await page.waitForTimeout(350);

  const search = page.locator('input[placeholder*="search alternatives"]').first();
  const hasSearch = await search.isVisible().catch(() => false);
  if (!hasSearch) {
    rec(results, `${label} swap modal opened`, false, 'swap search input not found');
    return;
  }
  await search.fill('row');
  await page.waitForTimeout(1800);
  const hasError = await page.locator('text=search error').isVisible().catch(() => false);
  const hasResult = await page.locator('.flex-1.overflow-y-auto button').first().isVisible().catch(() => false);
  const hasNoResults = await page.locator('text=no results found').isVisible().catch(() => false);
  rec(results, `${label} swap API response`, !hasError && (hasResult || hasNoResults), hasError ? 'search error shown' : (hasResult ? 'results found' : 'no results state'));

  await safeClick(page.locator('button:has-text("cancel")').first());
  await page.waitForTimeout(180);

  if (finalize) {
    await finalize();
  }
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const results = [];

  page.on('dialog', (d) => d.accept());

  try {
    await go(page, '/');
    await page.evaluate(() => localStorage.clear());
    await go(page, '/');

    // Build enough data for reorder checks and workout swaps
    await createProgram(page, '4-Day U/L', 'qa swap reorder a');
    await createProgram(page, '4-Day U/L', 'qa swap reorder b');
    await createProgram(page, 'Custom', 'qa swap reorder custom');
    await go(page, '/programs');

    // Activate a non-active program to ensure workout cards are populated.
    const switchBtn = page.locator('button:has-text("switch")').first();
    if (await switchBtn.isVisible().catch(() => false)) {
      await safeClick(switchBtn);
      await page.waitForTimeout(500);
    }
    await go(page, '/');

    // Workout swap scenarios on standard cards
    await safeClick(page.locator('a[href*="/workout/"]').first());
    await page.waitForTimeout(700);

    await runSwapScenario(
      page,
      results,
      'standard unedited unsaved',
      null,
      async () => {
        await safeClick(page.locator('button:has-text("cancel")').first());
      }
    );

    await runSwapScenario(
      page,
      results,
      'standard edited unsaved',
      async () => {
        await page.locator('input[aria-label="Edit sets"]').first().fill('5');
      },
      async () => {
        await safeClick(page.locator('button:has-text("cancel")').first());
      }
    );

    await runSwapScenario(
      page,
      results,
      'standard edited saved',
      async () => {
        await page.locator('input[aria-label="Edit sets"]').first().fill('4');
      },
      async () => {
        await safeClick(page.locator('button:has-text("save")').first());
      }
    );

    // Persist and reopen
    await safeClick(page.locator('button:has-text("save & exit")').first());
    await page.waitForTimeout(600);
    await safeClick(page.locator('a[href*="/workout/"]').first());
    await page.waitForTimeout(600);
    await runSwapScenario(
      page,
      results,
      'standard reopened saved state',
      null,
      async () => {
        await safeClick(page.locator('button:has-text("cancel")').first());
      }
    );

    // Custom-card coverage: add a custom exercise and verify current swap availability
    await safeClick(page.locator('button:has-text("add exercise")').first());
    await page.waitForTimeout(300);
    const addInput = page.locator('input[placeholder*="search or type"]').first();
    await addInput.fill('qa custom card');
    await safeClick(page.locator('.relative.bg-background.border-2 button:has-text("add")').last());
    await page.waitForTimeout(450);
    const customCardEdit = page.locator('div:has(h3:has-text("qa custom card")) button:has-text("edit")').first();
    const customCardEditVisible = await customCardEdit.isVisible().catch(() => false);
    if (customCardEditVisible) {
      await safeClick(customCardEdit);
      await page.waitForTimeout(200);
      const customSwapVisible = await page.locator('div:has(h3:has-text("qa custom card")) button:has-text("swap")').first().isVisible().catch(() => false);
      rec(results, 'custom card swap availability', customSwapVisible, customSwapVisible ? 'swap available in edit mode' : 'swap not exposed on custom added card');
      if (customSwapVisible) {
        await safeClick(page.locator('div:has(h3:has-text("qa custom card")) button:has-text("swap")').first());
        await page.waitForTimeout(300);
        const searchVisible = await page.locator('input[placeholder*="search alternatives"]').first().isVisible().catch(() => false);
        rec(results, 'custom card swap modal open', searchVisible, searchVisible ? 'opened' : 'failed');
        if (searchVisible) {
          await page.locator('input[placeholder*="search alternatives"]').first().fill('press');
          await page.waitForTimeout(1400);
          const hasError = await page.locator('text=search error').isVisible().catch(() => false);
          rec(results, 'custom card swap API response', !hasError, hasError ? 'search error shown' : 'response received');
          await safeClick(page.locator('button:has-text("cancel")').first());
        }
      }
      // close edit area if still open
      const cancelBtns = page.locator('button:has-text("cancel")');
      if ((await cancelBtns.count()) > 0) {
        await safeClick(cancelBtns.first());
      }
    } else {
      rec(results, 'custom card swap availability', false, 'custom card edit button not found');
    }

    // Reorder workout exercises
    await safeClick(page.locator('button:has-text("reorder")').first());
    await page.waitForTimeout(220);
    const workoutHandles = page.locator('button[aria-label="Drag to reorder"]');
    const workoutHandleCount = await workoutHandles.count();
    if (workoutHandleCount >= 2) {
      const moved = await dragTo(page, workoutHandles.nth(0), workoutHandles.nth(1));
      rec(results, 'workout exercise reorder drag', moved, `handles=${workoutHandleCount}`);
    } else {
      rec(results, 'workout exercise reorder drag', false, `handles=${workoutHandleCount}`);
    }
    await safeClick(page.locator('button:has-text("done editing")').first());

    // Warmup reorder
    await safeClick(page.locator('button:has-text("warmup")').first());
    await page.waitForTimeout(220);
    await safeClick(page.locator('div.border-2.border-border button:has-text("reorder")').first());
    await page.waitForTimeout(220);
    const warmupHandles = page.locator('div.border-2.border-border button[aria-label="Drag to reorder"]');
    const warmupCount = await warmupHandles.count();
    if (warmupCount >= 2) {
      const moved = await dragTo(page, warmupHandles.nth(0), warmupHandles.nth(1));
      rec(results, 'warmup reorder drag', moved, `handles=${warmupCount}`);
    } else {
      rec(results, 'warmup reorder drag', false, `handles=${warmupCount}`);
    }
    await safeClick(page.locator('div.border-2.border-border button:has-text("done")').first());

    // Block workout-day reorder (up/down in edit block modal)
    await go(page, '/');
    await safeClick(page.locator('button[aria-label="Edit block name and workout layout"]').first());
    await page.waitForTimeout(250);
    const down = page.locator('button:has-text("↓")').first();
    const hasDown = await down.isVisible().catch(() => false);
    if (hasDown) {
      await safeClick(down);
      await safeClick(page.locator('button:has-text("save")').first());
      rec(results, 'block workout-day reorder (modal arrows)', true);
    } else {
      rec(results, 'block workout-day reorder (modal arrows)', false, 'arrow controls not found');
      await safeClick(page.locator('button:has-text("cancel")').first());
    }

    // Program reorder (needs 3+ programs)
    await go(page, '/programs');
    const reorderBtn = page.locator('button:has-text("reorder")').first();
    const canReorderPrograms = await reorderBtn.isVisible().catch(() => false);
    if (canReorderPrograms) {
      await safeClick(reorderBtn);
      await page.waitForTimeout(220);
      const handles = page.locator('button[aria-label="Drag to reorder"]');
      const count = await handles.count();
      if (count >= 2) {
        const moved = await dragTo(page, handles.nth(0), handles.nth(1));
        rec(results, 'program reorder drag', moved, `handles=${count}`);
      } else {
        rec(results, 'program reorder drag', false, `handles=${count}`);
      }
      await safeClick(page.locator('button:has-text("done")').first());
    } else {
      rec(results, 'program reorder drag', false, 'reorder button unavailable');
    }
  } catch (error) {
    rec(results, 'qa runtime', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const report = join(OUT_DIR, 'report.json');
  writeFileSync(report, JSON.stringify(results, null, 2));
  const passed = results.filter((r) => r.passed).length;
  console.log(`\nReport: ${report}`);
  console.log(`Summary: ${passed}/${results.length} checks passed`);
  process.exit(results.some((r) => !r.passed) ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

