#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-flow-matrix');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

async function snap(page, name) {
  ensureDir(OUT_DIR);
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

async function safeClick(locator) {
  try {
    await locator.click({ timeout: 5000 });
  } catch {
    await locator.click({ force: true });
  }
}

async function waitForDashboardWorkouts(page, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const workoutLinks = page.locator('a[href^="/workout/"]');
    if ((await workoutLinks.count()) > 0) return true;
    await page.waitForTimeout(400);
  }
  return false;
}

async function clickFirstWorkout(page) {
  // Ensure we're on the dashboard and workout links are present.
  if (!(await waitForDashboardWorkouts(page, 5000))) {
    await go(page, '/');
    await waitForDashboardWorkouts(page, 15000);
  }
  const workout = page.locator('a[href^="/workout/"]').first();
  await safeClick(workout);
  await page.waitForTimeout(800);
}

async function dashboardShowsCompleted(page) {
  // Workout cards render completion as "completed: <date>".
  return page.locator('text=/completed:/i').first().isVisible().catch(() => false);
}

async function addCustomExercise(page, name) {
  await safeClick(page.locator('button:has-text("add exercise")'));
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="search or type"]').fill(name);
  await page.waitForTimeout(350);
  await safeClick(page.locator('.relative.bg-background button:has-text("add")').last());
  await page.waitForTimeout(500);
  return page.locator(`text=${name}`).first().isVisible().catch(() => false);
}

async function logFirstSet(page, weight = '95', reps = '8') {
  const weightInput = page.locator('input[aria-label="Weight"]').first();
  const repsInput = page.locator('input[aria-label="Reps"]').first();
  const completeBtn = page.locator('button[aria-label="Mark set complete"]').first();
  await weightInput.fill(weight);
  await repsInput.fill(reps);
  await safeClick(completeBtn);
  await page.waitForTimeout(350);
}

async function logFirstSetForExercise(page, exerciseName, weight = '95', reps = '8') {
  const card = page.locator(`div:has(h3:has-text("${exerciseName}"))`).first();
  const weightInput = card.locator('input[aria-label="Weight"]').first();
  const repsInput = card.locator('input[aria-label="Reps"]').first();
  const completeBtn = card.locator('button[aria-label="Mark set complete"]').first();
  await weightInput.fill(weight);
  await repsInput.fill(reps);
  await safeClick(completeBtn);
  await page.waitForTimeout(350);
}

async function createStandardProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("4-Day U/L")').first());
  await page.waitForTimeout(400);
  await page.locator('input[type="text"]').first().fill(name);
  await safeClick(page.locator('button:has-text("create program")'));
  await page.waitForTimeout(1000);
}

async function createCustomProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("Custom")').first());
  await page.waitForTimeout(400);
  await page.locator('input[type="text"]').first().fill(name);

  // weeks = 4
  await page.locator('label:has-text("weeks")').locator('xpath=following-sibling::input').first().fill('4');
  await page.waitForTimeout(150);

  // remove one day (4 -> 3)
  const removeButtons = page.locator('button[aria-label="Remove day"]');
  if ((await removeButtons.count()) > 0) {
    await safeClick(removeButtons.nth((await removeButtons.count()) - 1));
    await page.waitForTimeout(150);
  }

  // rename first 3 days
  const dayInputs = page.locator('section input[type="text"]');
  const names = ['work day', 'strong day', 'flow day'];
  for (let i = 0; i < Math.min(3, await dayInputs.count()); i++) {
    await dayInputs.nth(i).fill(names[i]);
  }

  await safeClick(page.locator('button:has-text("create program")'));
  await page.waitForTimeout(1000);
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const results = [];

  const record = (test, passed, notes = '') => {
    results.push({ test, passed, notes });
    console.log(`${passed ? 'PASS' : 'FAIL'} - ${test}${notes ? `: ${notes}` : ''}`);
  };

  try {
    // Prevent confirm dialogs from blocking automation.
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await go(page, '/');
    await page.evaluate(() => localStorage.clear());
    await go(page, '/');

    // Standard flow (first + subsequent)
    await createStandardProgram(page, 'qa standard flow');
    await snap(page, '01-standard-dashboard');
    const stdCards = await page.locator('a[href*="/workout/"]').count();
    record('standard dashboard has workouts', stdCards >= 4, `count=${stdCards}`);

    await clickFirstWorkout(page);
    await logFirstSet(page, '105', '8');
    const stdAddedVisible = await addCustomExercise(page, 'std qa add');
    record('standard add exercise immediate UI', stdAddedVisible, 'added card should appear');
    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(700);

    await clickFirstWorkout(page);
    const stdWeightPersist = await page.locator('input[aria-label="Weight"]').first().inputValue();
    const stdAddedPersist = await page.locator('text=std qa add').first().isVisible().catch(() => false);
    record('standard first-run persistence', stdWeightPersist === '105', `weight=${stdWeightPersist}`);
    record('standard added exercise persistence', stdAddedPersist);

    await safeClick(page.locator('button:has-text("complete")'));
    await page.waitForTimeout(800);
    await go(page, '/');
    const stdDoneVisible = await dashboardShowsCompleted(page);
    record('standard complete marks dashboard done', stdDoneVisible);

    await clickFirstWorkout(page);
    // Completed workouts no longer show "save & exit"; return to dashboard directly.
    await go(page, '/');
    const stdDoneAfterView = await dashboardShowsCompleted(page);
    record('standard view/save does not reset complete', stdDoneAfterView);

    // Custom flow (first + subsequent)
    await go(page, '/programs/new');
    await createCustomProgram(page, 'qa custom flow');
    await snap(page, '02-custom-dashboard');
    const customWeekButtons = await page.locator('button[aria-label^="Week "]').count();
    const customCards = await page.locator('a[href*="/workout/"]').count();
    record('custom has 4 week buttons', customWeekButtons === 4, `count=${customWeekButtons}`);
    record('custom has 3 workout days', customCards === 3, `count=${customCards}`);

    await clickFirstWorkout(page);
    const customAddedVisible = await addCustomExercise(page, 'custom qa add');
    record('custom add exercise immediate UI', customAddedVisible);

    // subsequent edit behavior: set2 should remain when set1 changes
    const customCard = page.locator('div:has(h3:has-text("custom qa add"))').first();
    const secondWeight = customCard.locator('input[aria-label="Weight"]').nth(1);
    const secondReps = customCard.locator('input[aria-label="Reps"]').nth(1);
    const secondComplete = customCard.locator('button[aria-label="Mark set complete"]').nth(1);
    await secondWeight.fill('95');
    await secondReps.fill('9');
    await safeClick(secondComplete);
    await page.waitForTimeout(300);
    await customCard.locator('input[aria-label="Weight"]').first().fill('100');
    await customCard.locator('input[aria-label="Reps"]').first().fill('10');
    await safeClick(customCard.locator('button[aria-label="Mark set complete"]').first());
    await page.waitForTimeout(200);

    const storageBeforeExit = await page.evaluate(() => localStorage.getItem('block-log-storage'));

    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(700);
    await clickFirstWorkout(page);
    const customCardAfter = page.locator('div:has(h3:has-text("custom qa add"))').first();
    const secondWeightAfter = await customCardAfter.locator('input[aria-label="Weight"]').nth(1).inputValue();
    const storageAfterReopen = await page.evaluate(() => localStorage.getItem('block-log-storage'));
    const debugPath = join(OUT_DIR, 'custom-persistence-debug.json');
    writeFileSync(debugPath, JSON.stringify({
      secondWeightAfter,
      storageBeforeExit,
      storageAfterReopen,
    }, null, 2));
    record('custom subsequent set edit persists (no unintended overwrite)', secondWeightAfter === '95', `set2=${secondWeightAfter}`);

    await safeClick(page.locator('button:has-text("complete")'));
    await page.waitForTimeout(700);
    await go(page, '/');
    const customDone = await dashboardShowsCompleted(page);
    record('custom complete marks done', customDone);

    await clickFirstWorkout(page);
    await go(page, '/');
    const customDoneAfterView = await dashboardShowsCompleted(page);
    record('custom view/save does not reset complete', customDoneAfterView);

    await go(page, '/analytics');
    const workoutsStat = await page.locator('text=workouts completed').locator('xpath=..').locator('xpath=following-sibling::*[1]').textContent().catch(() => '');
    const hasDenominator12 = await page.locator('text=/\\/12|\\/4/').first().isVisible().catch(() => false);
    record('custom analytics denominator visible', hasDenominator12, `stat=${workoutsStat || 'n/a'}`);

    await snap(page, '03-analytics-custom');
  } catch (error) {
    record('runtime matrix execution', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const reportPath = join(OUT_DIR, 'report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport saved: ${reportPath}`);
  const passed = results.filter((r) => r.passed).length;
  console.log(`Summary: ${passed}/${results.length} checks passed`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
