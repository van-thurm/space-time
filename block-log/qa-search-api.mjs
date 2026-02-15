#!/usr/bin/env node
/**
 * Exercise Search API - Exact Text Verification
 * Captures and reports the exact text shown in Swap and Add Exercise modals
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://block-log.vercel.app';
const OUTPUT_DIR = join(process.cwd(), 'qa-search-api');

async function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results = { swap: {}, add: {} };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Ensure we have a workout - create if needed
    const hasWorkout = await page.locator('a[href*="/workout/"]').first().isVisible();
    if (!hasWorkout) {
      await page.goto(`${BASE_URL}/programs`, { waitUntil: 'networkidle' });
      await page.click('a[href="/programs/new"]');
      await page.waitForTimeout(1000);
      await page.locator('button:has-text("4-Day U/L")').first().click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="Spring"]', 'Search Test');
      await page.click('button:has-text("create program")');
      await page.waitForTimeout(1500);
    }

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.click('a[href*="/workout/"]');
    await page.waitForTimeout(2000);

    // --- SWAP MODAL ---
    console.log('\n=== SWAP MODAL TEST ===');
    await page.locator('button:has-text("swap")').first().click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder*="search alternatives"]').fill('squat');
    await page.waitForTimeout(300);
    console.log('Waiting 5 seconds for Swap search results...');
    await page.waitForTimeout(5000);

    await ensureDir(OUTPUT_DIR);
    await page.screenshot({ path: join(OUTPUT_DIR, 'swap-squat.png') });
    console.log('Screenshot: swap-squat.png');

    // Extract ALL text from the modal content area
    const swapModal = page.locator('.fixed.inset-0');
    const swapText = await swapModal.locator('*').evaluateAll((els) =>
      els.map((el) => el.textContent?.trim()).filter(Boolean).join('\n')
    );
    results.swap.fullText = swapText;

    // More targeted: get the content area text
    const swapContent = await page.locator('.flex-1.overflow-y-auto').first().textContent().catch(() => '');
    results.swap.contentArea = swapContent?.trim() || '';

    // Check for specific messages
    const hasSearching = await page.locator('text=searching').isVisible().catch(() => false);
    const hasNoResults = await page.locator('text=no results').isVisible().catch(() => false);
    const hasApiError = await page.locator('text=api key').isVisible().catch(() => false);
    const hasError = await page.locator('text=error').isVisible().catch(() => false);
    const hasConfigured = await page.locator('text=configured').isVisible().catch(() => false);

    results.swap.hasSearching = hasSearching;
    results.swap.hasNoResults = hasNoResults;
    results.swap.hasApiError = hasApiError;
    results.swap.hasError = hasError;
    results.swap.hasConfigured = hasConfigured;

    // Get the exact status/error message
    const statusEl = page.locator('p.font-mono, .font-mono.text-sm');
    results.swap.statusMessages = await statusEl.allTextContents().catch(() => []);

    console.log('Swap modal content:', results.swap.contentArea?.substring(0, 500) || '(empty)');
    console.log('searching?', hasSearching, 'no results?', hasNoResults, 'api error?', hasApiError);

    await page.locator('button:has-text("cancel")').first().click();
    await page.waitForTimeout(500);

    // --- ADD EXERCISE MODAL ---
    console.log('\n=== ADD EXERCISE MODAL TEST ===');
    await page.locator('button:has-text("add exercise")').click();
    await page.waitForTimeout(800);
    await page.locator('input[placeholder*="search or type"]').fill('bench');
    await page.waitForTimeout(300);
    console.log('Waiting 5 seconds for Add search results...');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: join(OUTPUT_DIR, 'add-bench.png') });
    console.log('Screenshot: add-bench.png');

    const addModal = page.locator('.relative.bg-background.border-2');
    const addText = await addModal.locator('*').evaluateAll((els) =>
      els.map((el) => el.textContent?.trim()).filter(Boolean).join('\n')
    );
    results.add.fullText = addText?.substring(0, 2000) || '';

    const addSearchArea = await page.locator('.relative').first().textContent().catch(() => '');
    results.add.searchArea = addSearchArea?.trim()?.substring(0, 500) || '';

    const addSearching = await page.locator('text=searching').isVisible().catch(() => false);
    const addNoResults = await page.locator('text=no results').isVisible().catch(() => false);
    const addApiError = await page.locator('text=api key').isVisible().catch(() => false);
    const addError = await page.locator('text=error').isVisible().catch(() => false);

    results.add.hasSearching = addSearching;
    results.add.hasNoResults = addNoResults;
    results.add.hasApiError = addApiError;
    results.add.hasError = addError;

    const addStatusEl = page.locator('.font-mono.text-sm');
    results.add.statusMessages = await addStatusEl.allTextContents().catch(() => []);

    console.log('Add modal - searching?', addSearching, 'no results?', addNoResults, 'api error?', addApiError);
    console.log('Add status messages:', results.add.statusMessages);

  } catch (err) {
    results.error = err.message;
    console.error(err);
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log('\nResults saved to qa-search-api/results.json');

  return results;
}

run().then((r) => {
  console.log('\n=== EXACT TEXT REPORT ===');
  console.log('SWAP MODAL (squat):');
  console.log('  Content area:', r.swap?.contentArea || '(none)');
  console.log('  Status messages:', r.swap?.statusMessages || []);
  console.log('ADD MODAL (bench):');
  console.log('  Search area:', r.add?.searchArea || '(none)');
  console.log('  Status messages:', r.add?.statusMessages || []);
});
