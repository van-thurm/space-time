#!/usr/bin/env node
/**
 * QA Test - something-big-is-happening-accessible.html MOBILE
 * Viewport: 375x812 (iPhone)
 * Tests: toolbar layout, sticky, A+/A-, dark mode, scrolling
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HTML_PATH = join(__dirname, '..', 'something-big-is-happening-accessible.html');
const FILE_URL = `file://${HTML_PATH}`;
const SCREENSHOT_DIR = join(__dirname, '..', 'qa-a11y-screenshots', 'mobile');

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
    console.log('1. Loading page at mobile viewport (375x812)...');
    await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await takeScreenshot(page, '01-mobile-initial');

    console.log('2. Scroll down ~500px (verify sticky toolbar)...');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    await takeScreenshot(page, '02-mobile-scrolled');

    console.log('3. Back to top, then click A+ twice...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const increaseBtn = page.locator('#increase');
    await increaseBtn.click();
    await page.waitForTimeout(100);
    await increaseBtn.click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '03-mobile-a-plus-x2');

    console.log('4. Click Dark Mode...');
    await page.locator('#darkToggle').click();
    await page.waitForTimeout(200);
    await takeScreenshot(page, '04-mobile-dark-mode');

    console.log('5. Scroll to middle of article...');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(200);
    await takeScreenshot(page, '05-mobile-dark-scrolled');

    console.log('\nDone. Screenshots saved to:', SCREENSHOT_DIR);
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTests();
