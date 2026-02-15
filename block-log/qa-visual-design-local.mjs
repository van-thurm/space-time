#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'http://localhost:3000';
const OUT_DIR = join(process.cwd(), 'qa-screenshots', 'visual-qa');

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

async function snap(page, name, fullPage = true) {
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage });
  console.log(`saved ${path}`);
}

async function openMenu(page) {
  const menuBtn = page.getByRole('button', { name: /open navigation menu/i }).first();
  if (await menuBtn.isVisible().catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(200);
  }
}

async function toggleThemeFromMenu(page) {
  await openMenu(page);
  const themeBtn = page.getByRole('button', { name: /(light mode|dark mode|theme)/i }).first();
  if (await themeBtn.isVisible().catch(() => false)) {
    await themeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  try {
    // Baseline dashboard
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await snap(page, '01-dashboard-dark');

    // Header/menu visual
    await openMenu(page);
    await snap(page, '02-dashboard-menu-dark');
    await page.keyboard.press('Escape').catch(() => {});

    // Workout page
    const firstWorkout = page.locator('a[href^="/workout/"]').first();
    if (await firstWorkout.isVisible().catch(() => false)) {
      await firstWorkout.click();
      await page.waitForURL(/\/workout\//);
      await page.waitForTimeout(300);
      await snap(page, '03-workout-dark');
    }

    // Complete/report page
    await page.goto(`${BASE}/workout/1-1/complete`, { waitUntil: 'networkidle' });
    await snap(page, '04-workout-complete-dark');

    // Analytics + heatmap
    await page.goto(`${BASE}/analytics`, { waitUntil: 'networkidle' });
    await snap(page, '05-analytics-dark');

    // Programs and settings
    await page.goto(`${BASE}/programs`, { waitUntil: 'networkidle' });
    await snap(page, '06-programs-dark');
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await snap(page, '07-settings-dark');

    // Switch theme and repeat key pages
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await toggleThemeFromMenu(page);
    await snap(page, '08-dashboard-light');

    await page.goto(`${BASE}/workout/1-1`, { waitUntil: 'networkidle' });
    await snap(page, '09-workout-light');

    await page.goto(`${BASE}/workout/1-1/complete`, { waitUntil: 'networkidle' });
    await snap(page, '10-workout-complete-light');

    await page.goto(`${BASE}/analytics`, { waitUntil: 'networkidle' });
    await snap(page, '11-analytics-light');

    await page.goto(`${BASE}/programs`, { waitUntil: 'networkidle' });
    await snap(page, '12-programs-light');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
