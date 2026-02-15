import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const SHOTS_DIR = path.join(process.cwd(), 'qa-screenshots', 'program-lifecycle');

async function ensureDir() {
  await fs.mkdir(SHOTS_DIR, { recursive: true });
}

async function shot(page, name) {
  const file = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`screenshot: ${file}`);
}

async function expectTruthy(value, message) {
  if (!value) throw new Error(message);
}

async function openPrograms(page) {
  await page.goto(`${BASE_URL}/programs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

async function seedBaseTemplateProgram(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const id = 'qa-template-winter-2026';
    const state = {
      programs: [
        {
          id,
          templateId: '4-day-upper-lower',
          name: 'winter 2026',
          createdAt: new Date().toISOString(),
          currentWeek: 1,
          workoutLogs: [],
          exerciseSubstitutions: {},
          isActive: true,
          isArchived: false,
          workoutDayNameOverrides: {},
          workoutDayOrder: [1, 2, 3, 4],
        },
      ],
      activeProgramId: id,
      customTemplates: [],
      currentWeek: 1,
      workoutLogs: [],
      exerciseSubstitutions: {},
      userSettings: {
        units: 'lbs',
        showRestTimer: true,
        cascadeWeightToSets: true,
        keepScreenAwake: false,
      },
    };
    localStorage.setItem('block-log-storage', JSON.stringify({ state, version: 0 }));
  });
  await page.reload({ waitUntil: 'networkidle' });
}

async function addDayToActiveProgram(page) {
  await openPrograms(page);
  await page.locator('button', { hasText: /^edit$/i }).first().click();
  await page.locator('button[aria-label="Add one day to this program"]').click();
  await page.locator('button', { hasText: /^save$/i }).last().click();
  await page.waitForTimeout(300);
}

async function ensurePreloadedTemplateStillExists(page) {
  await page.goto(`${BASE_URL}/workout/2-1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  const cardCount = await page.locator('text=/tap to collapse/i').count();
  await expectTruthy(cardCount > 0, 'Expected preloaded exercise cards for template week 2 day 1');
  return cardCount;
}

async function seedCompletedProgram(page) {
  await page.goto(`${BASE_URL}/programs`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('block-log-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state || !Array.isArray(state.programs)) return;
    const exists = state.programs.some((p) => p.name === 'qa completed preview');
    if (exists) return;
    const templateProgram = state.programs.find((p) => p.id === 'qa-template-winter-2026') || state.programs[0];
    if (!templateProgram) return;
    const weeks = templateProgram.customWeeksTotal || 2;
    const templateDays = templateProgram.customDaysPerWeek || 4;
    const logs = [];
    for (let week = 1; week <= weeks; week += 1) {
      for (let day = 1; day <= templateDays; day += 1) {
        logs.push({
          workoutId: `week${week}-day${day}`,
          date: new Date(2026, 0, Math.min(28, week * day + 1)).toISOString(),
          exercises: [],
          completed: true,
        });
      }
    }
    state.programs.push({
      id: `qa-completed-${Date.now()}`,
      templateId: templateProgram.templateId || '4-day-upper-lower',
      name: 'qa completed preview',
      createdAt: new Date().toISOString(),
      currentWeek: 1,
      workoutLogs: logs,
      exerciseSubstitutions: {},
      isActive: false,
      isArchived: false,
      customWeeksTotal: weeks,
      customDaysPerWeek: templateDays,
      workoutDayNameOverrides: {},
      workoutDayOrder: Array.from({ length: templateDays }, (_, i) => i + 1),
    });
    localStorage.setItem('block-log-storage', JSON.stringify(parsed));
  });
  await page.reload({ waitUntil: 'networkidle' });
}

async function seedCustomProgramAndActivate(page) {
  await page.goto(`${BASE_URL}/programs`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('block-log-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state || !Array.isArray(state.programs)) return;
    const id = 'qa-custom-program';
    const exists = state.programs.some((p) => p.id === id);
    if (!exists) {
      state.programs.push({
        id,
        templateId: 'custom',
        name: 'custom qa',
        createdAt: new Date().toISOString(),
        currentWeek: 1,
        workoutLogs: [],
        exerciseSubstitutions: {},
        isActive: false,
        isArchived: false,
        customWeeksTotal: 12,
        customDaysPerWeek: 4,
        customDayLabels: ['day 1', 'day 2', 'day 3', 'day 4'],
        workoutDayNameOverrides: {},
        workoutDayOrder: [1, 2, 3, 4],
      });
    }
    state.programs = state.programs.map((program) => ({ ...program, isActive: program.id === id }));
    state.activeProgramId = id;
    state.currentWeek = 1;
    state.workoutLogs = [];
    state.exerciseSubstitutions = {};
    localStorage.setItem('block-log-storage', JSON.stringify(parsed));
  });
  await page.reload({ waitUntil: 'networkidle' });
}

async function archiveCompletedPreview(page) {
  await openPrograms(page);
  await page.getByRole('button', { name: /^edit$/i }).last().click();
  await page.locator('button[aria-label="Delete or archive program"]').click();
  await page.locator('button', { hasText: /^archive$/i }).click();
  await page.waitForTimeout(350);
}

async function restoreArchivedProgramFromSettings(page) {
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /restore \+ open/i }).first().click();
  await page.waitForTimeout(350);
}

async function run() {
  await ensureDir();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await seedBaseTemplateProgram(page);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await shot(page, '01-dashboard-template-created.png');

  const preloadedBefore = await ensurePreloadedTemplateStillExists(page);
  console.log('preloaded cards before add-day:', preloadedBefore);
  await shot(page, '02-template-week2-day1-before-add-day.png');

  await addDayToActiveProgram(page);
  await shot(page, '03-programs-after-add-day.png');

  const preloadedAfter = await ensurePreloadedTemplateStillExists(page);
  console.log('preloaded cards after add-day:', preloadedAfter);
  await shot(page, '04-template-week2-day1-after-add-day.png');

  await page.goto(`${BASE_URL}/workout/2-5`, { waitUntil: 'networkidle' });
  await shot(page, '05-template-extra-day5-empty.png');

  await seedCustomProgramAndActivate(page);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await shot(page, '06-dashboard-custom-created.png');

  await page.goto(`${BASE_URL}/workout/1-1`, { waitUntil: 'networkidle' });
  await shot(page, '07-custom-day1-blank-structure.png');

  await seedCompletedProgram(page);
  await openPrograms(page);
  await shot(page, '08-programs-with-completed-preview.png');

  await archiveCompletedPreview(page);
  await shot(page, '09-programs-after-archiving-completed-preview.png');

  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await shot(page, '10-settings-archived-programs.png');

  await restoreArchivedProgramFromSettings(page);
  await openPrograms(page);
  await shot(page, '11-programs-after-restore.png');

  await browser.close();
  console.log('QA lifecycle run complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
