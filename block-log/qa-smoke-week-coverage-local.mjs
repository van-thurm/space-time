#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

async function safeClick(locator) {
  try {
    await locator.click({ timeout: 5000 });
  } catch {
    await locator.click({ force: true });
  }
}

async function createStandardProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("4-Day U/L")').first());
  await page.waitForTimeout(300);
  await page.locator('input[type="text"]').first().fill(name);
  await safeClick(page.locator('button:has-text("create program")'));
  await page.waitForTimeout(900);
}

async function createCustomProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("Custom")').first());
  await page.waitForTimeout(300);
  await page.locator('input[type="text"]').first().fill(name);
  const decWeeks = page.locator('button[aria-label="Decrease weeks"]').first();
  for (let i = 0; i < 8; i++) { await decWeeks.click(); await page.waitForTimeout(50); }
  await page.waitForTimeout(150);
  const removeButtons = page.locator('button[aria-label="Remove day"]');
  if ((await removeButtons.count()) > 0) {
    await safeClick(removeButtons.nth((await removeButtons.count()) - 1));
  }
  await page.waitForTimeout(200);
  await safeClick(page.locator('button:has-text("create program")'));
  await page.waitForTimeout(900);
}

async function logSingleSet(page, weight = '105', reps = '8') {
  const firstWorkoutCard = page.locator('div:has-text("tap to collapse")').first();
  await firstWorkoutCard.locator('input[aria-label="Weight"]').first().fill(weight);
  await firstWorkoutCard.locator('input[aria-label="Reps"]').first().fill(reps);
  await safeClick(firstWorkoutCard.locator('button[aria-label="Mark set complete"]').first());
  await page.waitForTimeout(300);
}

async function addCustomExercise(page, name) {
  await safeClick(page.locator('button:has-text("add exercise")').first());
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="search or type"]').first().fill(name);
  await page.waitForTimeout(300);
  await safeClick(page.locator('.relative.bg-background.border-2 button:has-text("add")').last());
  await page.waitForTimeout(500);
}

async function assertWorkoutLoads(page, weekDay, label) {
  await go(page, `/workout/${weekDay}`);
  const hasProgress = await page.locator('text=progress').first().isVisible().catch(() => false);
  const hasAddExercise = await page.locator('button:has-text("add exercise")').first().isVisible().catch(() => false);
  if (!hasProgress || !hasAddExercise) {
    throw new Error(`${label} failed to load workout/${weekDay}`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const checks = [];

  const check = (name, passed, detail = '') => {
    checks.push({ name, passed, detail });
    console.log(`${passed ? 'PASS' : 'FAIL'} - ${name}${detail ? `: ${detail}` : ''}`);
  };

  try {
    await go(page, '/');
    await page.evaluate(() => localStorage.clear());
    await go(page, '/');

    await createStandardProgram(page, 'qa std week coverage');
    await assertWorkoutLoads(page, '1-1', 'standard week 1');
    check('standard week 1 workout route loads', true);

    await logSingleSet(page, '115', '6');
    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(600);

    await assertWorkoutLoads(page, '2-1', 'standard week 2');
    check('standard week 2 workout route loads', true);
    const stdWeightInput = page
      .locator('div:has-text("tap to collapse")')
      .first()
      .locator('input[aria-label="Weight"]')
      .first();
    const stdWeightPlaceholder = await stdWeightInput.getAttribute('placeholder');
    check('standard week 2 first set defaults from prior week max', stdWeightPlaceholder === '115', `placeholder="${stdWeightPlaceholder || ''}"`);

    await createCustomProgram(page, 'qa custom week coverage');
    await assertWorkoutLoads(page, '1-1', 'custom week 1');
    check('custom week 1 workout route loads', true);

    const customWeightCount = await page
      .locator('div:has-text("tap to collapse") input[aria-label="Weight"]')
      .count();
    if (customWeightCount === 0) {
      await addCustomExercise(page, 'qa custom week coverage move');
    }
    const customWeightCountAfterAdd = await page
      .locator('div:has-text("tap to collapse") input[aria-label="Weight"]')
      .count();
    check('custom week 1 has loggable set inputs', customWeightCountAfterAdd > 0, `count=${customWeightCountAfterAdd}`);
    await logSingleSet(page, '95', '10');
    const saveExit = page.locator('button:has-text("save & exit")').first();
    if (await saveExit.isVisible().catch(() => false)) {
      await safeClick(saveExit);
      await page.waitForTimeout(600);
    }

    await assertWorkoutLoads(page, '2-1', 'custom week 2');
    check('custom week 2 workout route loads', true);

    const hasConsoleBlockingError = await page
      .locator('text=/invalid workout|error/i')
      .first()
      .isVisible()
      .catch(() => false);
    check('no blocking error UI on week transitions', !hasConsoleBlockingError);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    check('week coverage smoke runtime', false, message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  const passed = checks.filter((item) => item.passed).length;
  console.log(`\nWeek coverage summary: ${passed}/${checks.length} passed`);
  if (passed !== checks.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
