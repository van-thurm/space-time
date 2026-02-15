#!/usr/bin/env node
/**
 * QA Test - Updated accessible HTML (Hi-Con / Normal labels)
 * Tests: mobile toolbar fit, Hi-Con/Normal contrast toggle, Dark Mode, desktop labels
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HTML_PATH = join(__dirname, '..', 'something-big-is-happening-accessible.html');
const FILE_URL = `file://${HTML_PATH}`;
const SCREENSHOT_DIR = join(__dirname, '..', 'qa-a11y-screenshots', 'updated');

async function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function takeScreenshot(page, name) {
  await ensureDir(SCREENSHOT_DIR);
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`  Screenshot: ${path}`);
  return path;
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });
  const page = await context.newPage();

  try {
    console.log('1. Load at mobile 375x812, check toolbar...');
    await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, '01-mobile-toolbar');

    console.log('2. Click Hi-Con to enable high contrast...');
    await page.locator('#contrastToggle').click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '02-mobile-high-contrast');

    console.log('3. Click Normal to disable, then Dark Mode...');
    await page.locator('#contrastToggle').click();
    await page.waitForTimeout(200);
    await page.locator('#darkToggle').click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '03-mobile-dark-mode');

    console.log('4. Resize to desktop 1280x800...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    await takeScreenshot(page, '04-desktop-full-labels');

    console.log('\nDone. Screenshots saved to:', SCREENSHOT_DIR);
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTests();
