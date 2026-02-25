#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-unified-variants');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
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
    if ((await page.locator('a[href^="/workout/"]').count()) > 0) return true;
    await page.waitForTimeout(350);
  }
  return false;
}

async function clickFirstWorkout(page) {
  if (!(await waitForDashboardWorkouts(page, 5000))) {
    await go(page, '/');
    await waitForDashboardWorkouts(page, 15000);
  }
  await safeClick(page.locator('a[href^="/workout/"]').first());
  await page.waitForTimeout(700);
}

async function setWeek(page, week) {
  await safeClick(page.locator(`button[aria-label="Week ${week}"]`));
  await page.waitForTimeout(500);
}

async function addCustomExercise(page, name) {
  await safeClick(page.locator('button:has-text("add exercise")'));
  await page.waitForTimeout(400);
  const input = page.locator('input[placeholder*="search or type"]');
  await input.fill(name);
  await page.waitForTimeout(300);
  await safeClick(page.locator('.relative.bg-background.border-2 button:has-text("add")').last());
  await page.waitForTimeout(500);
  return page.locator(`text=${name}`).first().isVisible().catch(() => false);
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
  await page.locator('label:has-text("weeks")').locator('xpath=following-sibling::input').first().fill('4');
  const dayInputs = page.locator('section input[type="text"]');
  const names = ['alpha day', 'beta day', 'gamma day', 'delta day'];
  for (let i = 0; i < Math.min(await dayInputs.count(), names.length); i++) {
    await dayInputs.nth(i).fill(names[i]);
  }
  await safeClick(page.locator('button:has-text("create program")'));
  await page.waitForTimeout(900);
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
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await go(page, '/');
    await page.evaluate(() => localStorage.clear());
    await go(page, '/');

    // Flow 1: template -> add + copy-forward from week 1 -> appears in week 2
    await createStandardProgram(page, 'qa template copy flow');
    await clickFirstWorkout(page);
    const addedTemplate = await addCustomExercise(page, 'qa template propagated');
    record('template flow can add exercise before propagation', addedTemplate);
    await safeClick(page.locator('button:has-text("copy this day across block")'));
    await page.waitForTimeout(500);
    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(700);
    await setWeek(page, 2);
    await clickFirstWorkout(page);
    const propagatedToWeek2 = await page.locator('text=qa template propagated').first().isVisible().catch(() => false);
    record('template copy-forward propagates to week 2', propagatedToWeek2);
    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(600);

    // Flow 2: custom empty-day guard + post-add propagation
    await createCustomProgram(page, 'qa custom copy guard flow');
    await clickFirstWorkout(page);
    await safeClick(page.locator('button:has-text("copy this day across block")'));
    await page.waitForTimeout(300);
    const guardVisible = await page.locator('button:has-text("add exercises first")').first().isVisible().catch(() => false);
    record('custom copy-forward shows guard on empty day', guardVisible);

    const addedCustom = await addCustomExercise(page, 'qa custom propagated');
    record('custom flow can add exercise after guard', addedCustom);
    await safeClick(page.locator('button:has-text("copy this day across block")'));
    await page.waitForTimeout(500);
    await safeClick(page.locator('button:has-text("save & exit")'));
    await page.waitForTimeout(700);
    await setWeek(page, 2);
    await clickFirstWorkout(page);
    const customPropagatedToWeek2 = await page.locator('text=qa custom propagated').first().isVisible().catch(() => false);
    record('custom copy-forward propagates after setup', customPropagatedToWeek2);
  } catch (error) {
    record('unified variants runtime', false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const reportPath = join(OUT_DIR, 'report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  const passed = results.filter((r) => r.passed).length;
  console.log(`\nReport: ${reportPath}`);
  console.log(`Summary: ${passed}/${results.length} checks passed`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
