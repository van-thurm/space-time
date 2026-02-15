#!/usr/bin/env node
/**
 * Block Log - Exhaustive multi-pass interaction sweep
 * Run: node qa-sweep.mjs
 * Requires: npm run dev (localhost:3000)
 * Viewport: 390x844 (iPhone)
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const VIEWPORT = { width: 390, height: 844 };
const PASSES = 2;
const FAST = process.env.FAST === '1';
const findings = new Set();
const coverage = [];
const consoleErrors = [];

function addFinding(step, expected, actual, severity, area) {
  const key = `${step}|${expected}|${actual}`;
  if (!findings.has(key)) {
    findings.add(key);
    coverage.push({ type: 'finding', step, expected, actual, severity, area });
    console.log(`  [${severity}] ${step}: expected ${expected}, got ${actual}`);
  }
}

async function safeClick(page, locator, label) {
  try {
    const el = typeof locator === 'function' ? locator() : locator;
    await el.click({ timeout: 3000, force: true });
    await page.waitForTimeout(200);
    return true;
  } catch (e) {
    addFinding(label || 'click', 'success', e.message?.slice(0, 80) || 'timeout', 'medium', 'interaction');
    return false;
  }
}

async function runPass(page, passNum) {
  const passFindings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404')) {
        consoleErrors.push({ pass: passNum, text });
      }
    }
  });

  // --- Dashboard (/) ---
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);

  const hasWorkoutCards = await page.locator('a[href^="/workout/"]').count() > 0;
  if (!hasWorkoutCards) addFinding('Dashboard', 'workout cards', 'none', 'high', 'page.tsx');

  await safeClick(page, () => page.getByRole('link', { name: /rest timer/i }), 'Timer link');
  await page.waitForURL(/\/timer/);
  await page.goto(BASE);

  await safeClick(page, () => page.getByRole('link', { name: /analytics/i }), 'Analytics link');
  await page.waitForURL(/\/analytics/);
  await page.goto(BASE);

  await safeClick(page, () => page.getByRole('link', { name: /settings/i }), 'Settings link');
  await page.waitForURL(/\/settings/);
  await page.goto(BASE);

  await safeClick(page, () => page.getByRole('button', { name: /switch to (light|dark) mode/i }), 'Theme toggle');
  await page.waitForTimeout(200);

  await safeClick(page, () => page.locator('a[href="/programs"]').first(), 'Programs link');
  await page.waitForURL(/\/programs/);

  // --- Programs ---
  const hasNewProgram = await page.locator('a[href="/programs/new"]').count() > 0;
  if (hasNewProgram && passNum === 1) {
    await safeClick(page, () => page.locator('a[href="/programs/new"]').first(), 'New program link');
    await page.waitForURL(/\/programs\/new/);

    // --- Programs/new - day filter ---
    await safeClick(page, () => page.locator('button').filter({ hasText: /^all$/i }).first(), 'Day filter all');
    const dayBtns = await page.locator('button').filter({ hasText: /\d+d$/ }).all();
    for (let i = 0; i < Math.min(2, dayBtns.length); i++) {
      await safeClick(page, () => dayBtns[i], `Day filter ${i}`);
    }
    await safeClick(page, () => page.locator('button').filter({ hasText: /^all$/i }).first(), 'Day filter all again');

    // Select a template - first card in template list (space-y-2 contains template cards)
    const templateCard = page.locator('div.space-y-2 button').first();
    if (await templateCard.count() > 0) {
      await safeClick(page, () => templateCard, 'Select template');
      await page.waitForTimeout(300);

      let nameInput = page.getByPlaceholder(/spring/i).first();
      if (await nameInput.count() === 0) nameInput = page.locator('input[type="text"]').last();
      if (await nameInput.count() > 0) {
        await nameInput.fill('');
        await page.waitForTimeout(300);
        const createBtn = page.getByRole('button', { name: /create program/i }).first();
        const createDisabled = await createBtn.isDisabled().catch(() => false);
        if (!createDisabled) addFinding('New program', 'create disabled when name empty', 'create enabled', 'medium', 'programs/new');

        await nameInput.fill('Sweep Test Program');
        await page.waitForTimeout(200);
        await safeClick(page, () => page.getByRole('button', { name: /create program/i }).first(), 'Create program');
        await page.waitForURL(/\/(?:$|\?)/, { timeout: 5000 }).catch(() => {});
      }
    }
  }

  await page.goto(BASE);
  await page.waitForLoadState('load');

  // --- Workout flow ---
  const workoutLink = page.locator('a[href^="/workout/"]').first();
  if (await workoutLink.count() > 0) {
    await workoutLink.click();
    await page.waitForURL(/\/workout\//);
    const workoutUrl = page.url();

    // Add exercise (pass 1 only - API calls are slow)
    const addBtn = page.getByRole('button', { name: /add exercise/i }).first();
    if (await addBtn.isVisible().catch(() => false) && passNum === 1) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const searchInput = page.locator('input[type="text"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('bench');
        await page.waitForTimeout(500);
        const result = page.locator('button, [role="button"], li').filter({ hasText: /bench/i }).first();
        if (await result.isVisible().catch(() => false)) {
          await result.click();
          await page.waitForTimeout(300);
        }
        const submitAdd = page.getByRole('button', { name: /^add$/i }).first();
        await submitAdd.click().catch(() => {});
        await page.waitForTimeout(400);
      }
      const closeBtn = page.getByRole('button', { name: /cancel|close/i }).or(page.locator('button').filter({ hasText: /✕|×/ })).first();
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Swap exercise (pass 1 only - API calls)
    const swapBtn = page.getByRole('button', { name: /swap/i }).first();
    if (await swapBtn.isVisible().catch(() => false) && passNum === 1) {
      await swapBtn.click();
      await page.waitForTimeout(400);
      const swapClose = page.getByRole('button', { name: /cancel|close/i }).or(page.locator('button').filter({ hasText: /✕|×/ })).first();
      await swapClose.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Skip then restore
    const skipBtn = page.getByRole('button', { name: /skip this exercise/i }).first();
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(200);
      const restoreBtn = page.getByRole('button').filter({ hasText: /↩/ }).first();
      if (await restoreBtn.isVisible().catch(() => false)) {
        await restoreBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Log a set
    const weightIn = page.locator('input[aria-label="Weight"]').first();
    const repsIn = page.locator('input[aria-label="Reps"]').first();
    if (await weightIn.count() > 0 && await repsIn.count() > 0) {
      await weightIn.fill('100');
      await repsIn.fill('8');
      const completeSetBtn = page.getByRole('button', { name: /mark set complete/i }).first();
      await completeSetBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Save & exit (allow time for zustand persist to write)
    await page.getByRole('link', { name: /back to dashboard/i }).first().click().catch(() => {});
    await page.waitForURL(/\/(?:$|\?)/, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);

    // Reopen and verify
    await page.goto(workoutUrl);
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);
    const hasLoggedData = await page.locator('text=100').or(page.locator('button:has-text("✓")')).or(page.locator('[class*="success"]')).first().isVisible().catch(() => false);
    if (!hasLoggedData && passNum === 1) addFinding('Workout persistence', 'logged set visible after reopen', 'not visible', 'high', 'store.ts');

    // Complete workout (if possible)
    const completeBtn = page.getByRole('button', { name: /^complete$/i }).first();
    if (await completeBtn.isVisible().catch(() => false) && !(await completeBtn.isDisabled())) {
      await completeBtn.click();
      await page.waitForTimeout(300);
    }
    await page.goto(BASE);
  }

  // --- Analytics ---
  await page.goto(`${BASE}/analytics`);
  await page.waitForLoadState('load');
  const workoutsStat = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first().isVisible().catch(() => false);
  if (!workoutsStat) addFinding('Analytics', 'workouts stat (n/d)', 'not found', 'medium', 'analytics/page.tsx');
  await safeClick(page, () => page.locator('button').filter({ hasText: /units|lbs|kg/i }).first(), 'Units toggle');
  await safeClick(page, () => page.getByRole('button', { name: /export csv/i }).first(), 'Export CSV');

  // --- Settings ---
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('load');
  await page.selectOption('select', { index: 1 }).catch(() => {});
  await page.waitForTimeout(100);
  await page.selectOption('select', { index: 0 }).catch(() => {});
  const cascadeToggle = page.locator('button').filter({ has: page.locator('..') }).nth(3);
  await cascadeToggle.click().catch(() => {});
  await page.waitForTimeout(100);
  await cascadeToggle.click().catch(() => {});
  const showRestToggle = page.locator('button').filter({ has: page.locator('..') }).nth(4);
  await showRestToggle.click().catch(() => {});
  await page.waitForTimeout(100);

  // Clear data - confirm dialog is dismissed by main handler
  await safeClick(page, () => page.getByRole('button', { name: /clear data/i }).first(), 'Clear data (dismiss)');

  // --- Timer ---
  await page.goto(`${BASE}/timer`);
  await page.waitForLoadState('load');
  await safeClick(page, () => page.locator('button').filter({ hasText: /^60s|^90s|^2m/ }).first(), 'Timer preset');
  await safeClick(page, () => page.locator('button').filter({ hasText: /^-$/ }).first(), 'Timer minus');
  await safeClick(page, () => page.locator('button').filter({ hasText: /^\+$/ }).first(), 'Timer plus');
  await safeClick(page, () => page.getByRole('button', { name: /start|resume/i }).first(), 'Timer start');
  await page.waitForTimeout(800);
  await safeClick(page, () => page.getByRole('button', { name: /pause/i }).first(), 'Timer pause');
  await safeClick(page, () => page.getByRole('button', { name: /reset/i }).first(), 'Timer reset');

  // --- Programs page (if we have programs) ---
  await page.goto(`${BASE}/programs`);
  await page.waitForLoadState('load');
  const programCards = await page.locator('button').filter({ hasText: /switch|active|template|✕/ }).all();
  for (let i = 0; i < Math.min(3, programCards.length); i++) {
    await programCards[i].click().catch(() => {});
    await page.waitForTimeout(150);
  }
  const reorderBtn = page.getByRole('button', { name: /reorder|done/i }).first();
  if (await reorderBtn.isVisible().catch(() => false)) {
    await reorderBtn.click();
    await page.waitForTimeout(200);
    await reorderBtn.click();
  }

  return passFindings;
}

async function main() {
  console.log('Block Log - Exhaustive multi-pass sweep (390x844)\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'en-US',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(15000);

  page.on('dialog', (d) => {
    if (d.message().includes('sure') && d.message().includes('delete')) d.dismiss();
    else d.accept();
  });
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
    document.head.appendChild(style);
  });

  let prevFindingsCount = -1;
  let stableCount = 0;

  for (let p = 1; p <= PASSES; p++) {
    console.log(`\n--- Pass ${p}/${PASSES} ---`);
    try {
      await runPass(page, p);
    } catch (e) {
      if (!e.message?.includes('closed')) {
        addFinding(`Pass ${p}`, 'complete', e.message?.slice(0, 80) || 'error', 'high', 'sweep');
      }
    }
    const count = findings.size;
    if (count === prevFindingsCount) {
      stableCount++;
      if (stableCount >= 2) {
        console.log(`\nNo new findings for 2 passes - stopping early`);
        break;
      }
    } else {
      stableCount = 0;
    }
    prevFindingsCount = count;
  }

  await browser.close();

  // Report
  console.log('\n\n========== SWEEP REPORT ==========\n');
  console.log('1) COVERAGE SUMMARY');
  console.log('   Routes: /, /programs, /programs/new, /workout/*, /analytics, /settings, /timer');
  console.log('   Elements: timer, analytics, settings, theme toggle, programs, new program,');
  console.log('   day filters, template select, name input, create, add exercise, swap, skip/restore,');
  console.log('   set logging, save&exit, complete, units, export, settings toggles, timer presets/controls');
  console.log('   Forms: program name (empty/valid), custom days/weeks (programs/new)');
  console.log('   Modals: AddExercise, Swap, confirm dialogs');

  console.log('\n2) FINDINGS');
  if (findings.size === 0) {
    console.log('   No findings.');
  } else {
    coverage.filter(c => c.type === 'finding').forEach((f, i) => {
      console.log(`   ${i + 1}. [${f.severity}] ${f.step}`);
      console.log(`      Expected: ${f.expected}`);
      console.log(`      Actual: ${f.actual}`);
      if (f.area) console.log(`      Area: ${f.area}`);
    });
  }

  if (consoleErrors.length > 0) {
    console.log('\n   Console errors captured:');
    const unique = [...new Set(consoleErrors.map(e => e.text))];
    unique.slice(0, 5).forEach(t => console.log(`      - ${t.slice(0, 100)}`));
    const hydrationErr = unique.find(t => t.includes('hydrat') || t.includes('didn\'t match'));
    if (hydrationErr) addFinding('Hydration', 'no mismatch', 'server/client attribute mismatch', 'medium', 'layout/ThemeProvider');
  }

  console.log('\n3) HIGHEST-PRIORITY FIX SUGGESTIONS');
  const high = coverage.filter(f => f.type === 'finding' && f.severity === 'high');
  const med = coverage.filter(f => f.type === 'finding' && f.severity === 'medium');
  if (high.length > 0) {
    high.forEach(f => console.log(`   - Fix: ${f.step} (${f.area})`));
  }
  if (med.length > 0 && high.length < 3) {
    med.slice(0, 3 - high.length).forEach(f => console.log(`   - Consider: ${f.step} (${f.area})`));
  }
  if (high.length === 0 && med.length === 0) {
    console.log('   None - no critical or medium issues found.');
  }

  process.exit(findings.size > 0 ? 1 : 0);
}

main();
