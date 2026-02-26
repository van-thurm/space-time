#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-swap-variations');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function add(results, test, passed, notes = '') {
  results.push({ test, passed, notes });
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${test}${notes ? `: ${notes}` : ''}`);
}

async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
}

async function safeClick(locator) {
  try {
    await locator.click({ timeout: 6000 });
  } catch {
    await locator.click({ force: true, timeout: 6000 });
  }
}

async function createStandardProgram(page, name) {
  await go(page, '/programs/new');
  await safeClick(page.locator('button:has-text("4-Day U/L")').first());
  await page.locator('input[type="text"]').first().fill(name);
  await safeClick(page.locator('button:has-text("create program")').first());
  await page.waitForTimeout(700);
}

async function openSwapAndCheckApi(page, results, label) {
  const swap = page.locator('button:has-text("swap")').first();
  const visible = await swap.isVisible().catch(() => false);
  if (!visible) {
    add(results, `${label} swap button visible`, false, 'swap button not found');
    return false;
  }
  await safeClick(swap);
  await page.waitForTimeout(320);

  const search = page.locator('input[placeholder*="search alternatives"]').first();
  const hasSearch = await search.isVisible().catch(() => false);
  if (!hasSearch) {
    add(results, `${label} swap modal open`, false, 'search input not found');
    return false;
  }
  await search.fill('row');
  await page.waitForTimeout(1700);

  const hasError = await page.locator('text=search error').isVisible().catch(() => false);
  const hasResult = await page.locator('.flex-1.overflow-y-auto button').first().isVisible().catch(() => false);
  const hasNoResults = await page.locator('text=no results found').isVisible().catch(() => false);
  add(results, `${label} swap API responds`, !hasError && (hasResult || hasNoResults), hasError ? 'search error' : (hasResult ? 'results found' : 'no-results state'));

  await safeClick(page.locator('button:has-text("cancel")').first());
  await page.waitForTimeout(220);
  return true;
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

    await createStandardProgram(page, 'qa swap variants');
    await safeClick(page.locator('a[href*="/workout/"]').first());
    await page.waitForTimeout(600);

    const edit = page.locator('button:has-text("edit")').first();
    const hasEdit = await edit.isVisible().catch(() => false);
    add(results, 'standard card edit button visible', hasEdit);
    if (!hasEdit) throw new Error('no editable exercise cards found');

    // 1) Unedited + unsaved
    await safeClick(edit);
    await page.waitForTimeout(200);
    await openSwapAndCheckApi(page, results, 'standard unedited unsaved');
    await safeClick(page.locator('button:has-text("cancel")').first());
    await page.waitForTimeout(180);

    // 2) Edited + unsaved
    await safeClick(edit);
    await page.waitForTimeout(180);
    const incSets = page.locator('button[aria-label="Increase sets"]').first();
    await incSets.click();
    await incSets.click();
    await openSwapAndCheckApi(page, results, 'standard edited unsaved');
    await safeClick(page.locator('button:has-text("cancel")').first());
    await page.waitForTimeout(180);

    // 3) Edited + saved
    await safeClick(edit);
    await page.waitForTimeout(180);
    const decSets = page.locator('button[aria-label="Decrease sets"]').first();
    await decSets.click();
    await openSwapAndCheckApi(page, results, 'standard edited before save');
    await safeClick(page.locator('button:has-text("save")').first());
    await page.waitForTimeout(250);

    // 4) Saved + reopened
    await safeClick(page.locator('button:has-text("save & exit")').first());
    await page.waitForTimeout(650);
    await safeClick(page.locator('a[href*="/workout/"]').first());
    await page.waitForTimeout(550);
    await safeClick(page.locator('button:has-text("edit")').first());
    await page.waitForTimeout(180);
    await openSwapAndCheckApi(page, results, 'standard saved reopened');
    await safeClick(page.locator('button:has-text("cancel")').first());

    // "Custom card" coverage: added exercise card
    await safeClick(page.locator('button:has-text("add exercise")').first());
    await page.waitForTimeout(250);
    await page.locator('input[placeholder*="search or type"]').first().fill('qa custom swap card');
    await safeClick(page.locator('.relative.bg-background.border-2 button:has-text("add")').last());
    await page.waitForTimeout(450);
    const customEdit = page.locator('div:has(h3:has-text("qa custom swap card")) button:has-text("edit")').first();
    const customEditVisible = await customEdit.isVisible().catch(() => false);
    add(results, 'custom added card edit visible', customEditVisible);
    if (customEditVisible) {
      await safeClick(customEdit);
      await page.waitForTimeout(180);
      const customSwap = page.locator('div:has(h3:has-text("qa custom swap card")) button:has-text("swap")').first();
      const customSwapVisible = await customSwap.isVisible().catch(() => false);
      add(results, 'custom added card swap available', customSwapVisible, customSwapVisible ? 'available in edit actions' : 'not currently exposed');
      if (customSwapVisible) {
        await safeClick(customSwap);
        await page.waitForTimeout(260);
        const searchVisible = await page.locator('input[placeholder*="search alternatives"]').first().isVisible().catch(() => false);
        add(results, 'custom added card swap modal opens', searchVisible);
        if (searchVisible) {
          await page.locator('input[placeholder*="search alternatives"]').first().fill('press');
          await page.waitForTimeout(1400);
          const hasError = await page.locator('text=search error').isVisible().catch(() => false);
          add(results, 'custom added card swap API responds', !hasError, hasError ? 'search error' : 'response returned');
          await safeClick(page.locator('button:has-text("cancel")').first());
        }
      }
    }
  } catch (error) {
    add(results, 'swap variation runtime', false, error instanceof Error ? error.message : String(error));
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

