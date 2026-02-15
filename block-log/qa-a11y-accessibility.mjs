#!/usr/bin/env node
/**
 * QA Test - something-big-is-happening-accessible.html
 * Tests: toolbar sticky, A+/A-, dark mode, high contrast, layout
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HTML_PATH = join(__dirname, '..', 'something-big-is-happening-accessible.html');
const FILE_URL = `file://${HTML_PATH}`;
const SCREENSHOT_DIR = join(__dirname, '..', 'qa-a11y-screenshots');

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
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log('1. Loading page at default desktop viewport (1280px)...');
    await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, '01-default-desktop');

    console.log('2. Clicking A+ 3 times...');
    const increaseBtn = page.locator('#increase');
    for (let i = 0; i < 3; i++) {
      await increaseBtn.click();
      await page.waitForTimeout(100);
    }
    await takeScreenshot(page, '02-after-a-plus-x3');

    console.log('3. Clicking Dark Mode...');
    await page.locator('#darkToggle').click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '03-dark-mode');

    console.log('4. Clicking High Contrast...');
    await page.locator('#contrastToggle').click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '04-high-contrast');

    console.log('5. Clicking Normal Contrast (back to default), then A- 3 times...');
    await page.locator('#contrastToggle').click(); // back to normal contrast
    await page.waitForTimeout(200);
    const decreaseBtn = page.locator('#decrease');
    for (let i = 0; i < 3; i++) {
      await decreaseBtn.click();
      await page.waitForTimeout(100);
    }
    await takeScreenshot(page, '06-restored-state');

    console.log('6. Verifying toolbar sticky behavior (scroll down)...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(200);
    await takeScreenshot(page, '07-toolbar-scrolled');

    console.log('\nDone. Screenshots saved to:', SCREENSHOT_DIR);
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTests();
