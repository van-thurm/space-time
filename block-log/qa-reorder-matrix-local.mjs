#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-reorder-matrix');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function log(results, test, passed, notes = '') {
  results.push({ test, passed, notes });
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${test}${notes ? `: ${notes}` : ''}`);
}

async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(320);
}

async function safeClick(locator) {
  try {
    await locator.click({ timeout: 6000 });
  } catch {
    await locator.click({ force: true, timeout: 6000 });
  }
}

async function drag(page, from, to) {
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

async function createProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("4-Day U/L")').first());
  const namedInput = page.locator('input[placeholder*="Spring"], input[placeholder*="spring"]').first();
  const hasNamedInput = await namedInput.isVisible().catch(() => false);
  if (hasNamedInput) {
    await namedInput.fill(name);
  } else {
    await page.locator('input[type="text"]').last().fill(name);
  }
  await safeClick(page.locator('button:has-text("create program")').first());
  await page.waitForTimeout(700);
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const results = [];

  try {
    await go(page, '/');
    await page.evaluate(() => localStorage.clear());
    await go(page, '/');

    // Need 3 programs for program-level reorder mode.
    await createProgram(page, 'qa reorder one');
    await createProgram(page, 'qa reorder two');
    await createProgram(page, 'qa reorder three');

    // Program reorder
    await go(page, '/programs');
    let reorderBtn = page.locator('button:has-text("reorder")').first();
    let hasProgramReorder = await reorderBtn.isVisible().catch(() => false);
    if (!hasProgramReorder) {
      // Fallback: ensure we truly have enough programs for reorder mode.
      await createProgram(page, 'qa reorder four');
      await go(page, '/programs');
      reorderBtn = page.locator('button:has-text("reorder")').first();
      hasProgramReorder = await reorderBtn.isVisible().catch(() => false);
    }
    if (hasProgramReorder) {
      await safeClick(reorderBtn);
      await page.waitForTimeout(250);
      const handles = page.locator('button[aria-label="Drag to reorder"]');
      const count = await handles.count();
      if (count >= 2) {
        const moved = await drag(page, handles.nth(0), handles.nth(1));
        log(results, 'program reorder drag', moved, `handles=${count}`);
      } else {
        log(results, 'program reorder drag', false, `handles=${count}`);
      }
      await safeClick(page.locator('button:has-text("done")').first());
    } else {
      log(results, 'program reorder drag', false, 'reorder toggle unavailable');
    }

    // Block workout-day reorder via modal arrows
    await go(page, '/');
    const editBlock = page.locator('button[aria-label="Edit block name and workout layout"]').first();
    const hasEditBlock = await editBlock.isVisible().catch(() => false);
    if (hasEditBlock) {
      await safeClick(editBlock);
      await page.waitForTimeout(250);
      const down = page.locator('button:has-text("↓")').first();
      const canMove = await down.isVisible().catch(() => false);
      if (canMove) {
        await safeClick(down);
        await safeClick(page.locator('button:has-text("save")').first());
        log(results, 'block workout-day reorder arrows', true);
      } else {
        log(results, 'block workout-day reorder arrows', false, 'arrow controls missing');
      }
    } else {
      log(results, 'block workout-day reorder arrows', false, 'edit block button missing');
    }

    // Workout exercise reorder
    await safeClick(page.locator('a[href*="/workout/"]').first());
    await page.waitForTimeout(550);
    const workoutReorder = page.locator('button:has-text("reorder")').first();
    const hasWorkoutReorder = await workoutReorder.isVisible().catch(() => false);
    if (hasWorkoutReorder) {
      await safeClick(workoutReorder);
      await page.waitForTimeout(250);
      const handles = page.locator('button[aria-label="Drag to reorder"]');
      const count = await handles.count();
      if (count >= 2) {
        const moved = await drag(page, handles.nth(0), handles.nth(1));
        log(results, 'workout exercise reorder drag', moved, `handles=${count}`);
      } else {
        log(results, 'workout exercise reorder drag', false, `handles=${count}`);
      }
      await safeClick(page.locator('button:has-text("done editing")').first());
    } else {
      log(results, 'workout exercise reorder drag', false, 'reorder toggle missing');
    }

    // Warmup reorder
    const warmupHeader = page.locator('button:has-text("warmup")').first();
    const hasWarmup = await warmupHeader.isVisible().catch(() => false);
    if (hasWarmup) {
      await safeClick(warmupHeader);
      await page.waitForTimeout(220);
      const warmupReorder = page.locator('div.border-2.border-border button:has-text("reorder")').first();
      const hasWarmupReorder = await warmupReorder.isVisible().catch(() => false);
      if (hasWarmupReorder) {
        await safeClick(warmupReorder);
        await page.waitForTimeout(220);
        const handles = page.locator('div.border-2.border-border button[aria-label="Drag to reorder"]');
        const count = await handles.count();
        if (count >= 2) {
          const moved = await drag(page, handles.nth(0), handles.nth(1));
          log(results, 'warmup reorder drag', moved, `handles=${count}`);
        } else {
          log(results, 'warmup reorder drag', false, `handles=${count}`);
        }
        await safeClick(page.locator('div.border-2.border-border button:has-text("done")').first());
      } else {
        log(results, 'warmup reorder drag', false, 'warmup reorder toggle missing');
      }
    } else {
      log(results, 'warmup reorder drag', false, 'warmup section missing');
    }
  } catch (error) {
    log(results, 'reorder runtime', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const reportPath = join(OUT_DIR, 'report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  const passed = results.filter((r) => r.passed).length;
  console.log(`\nReport: ${reportPath}`);
  console.log(`Summary: ${passed}/${results.length} checks passed`);
  process.exit(results.some((r) => !r.passed) ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

