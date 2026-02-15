import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    function buildDemoLogs(weeks, daysPerWeek) {
      const movementSeeds = [
        { key: 'squat', base: 135 },
        { key: 'bench', base: 95 },
        { key: 'deadlift', base: 185 },
        { key: 'row', base: 85 },
      ];
      const logs = [];
      for (let week = 1; week <= weeks; week += 1) {
        for (let day = 1; day <= daysPerWeek; day += 1) {
          const date = new Date(2026, 0, Math.min(27, week * 2 + day));
          const exercises = movementSeeds.map((seed, idx) => {
            const wave = week * 5 + day * 2 + idx;
            const weight = seed.base + wave;
            return {
              exerciseId: `api-${seed.key}-${week}-${day}`,
              sets: [
                { weight, reps: 8, rpe: 7, status: 'completed' },
                { weight: weight + 5, reps: 6, rpe: 8, status: 'completed' },
                { weight, reps: 8, rpe: 7, status: 'completed' },
              ],
              completed: true,
            };
          });
          const addedExercises = movementSeeds.map((seed, idx) => ({
            id: `api-${seed.key}-${week}-${day}`,
            name: seed.key,
            sets: 3,
            reps: '6-8',
            targetRPE: '7-8',
            restSeconds: 90,
            category: idx < 2 ? 'main_lift' : 'accessory',
            addedAt: date.toISOString(),
          }));
          logs.push({
            workoutId: `week${week}-day${day}`,
            date: date.toISOString(),
            exercises,
            completed: true,
            addedExercises,
          });
        }
      }
      return logs;
    }

    const raw = localStorage.getItem('block-log-storage');
    const parsed = raw
      ? JSON.parse(raw)
      : {
          state: {
            programs: [
              {
                id: 'demo-program',
                templateId: '4-day-upper-lower',
                name: 'demo block',
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
            activeProgramId: 'demo-program',
            lastTrainedProgramId: null,
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
          },
          version: 0,
        };
    const state = parsed?.state;
    if (!state || !Array.isArray(state.programs) || state.programs.length === 0) {
      return { ok: false, reason: 'no programs found' };
    }
    const target =
      state.programs.find((program) => program.id === state.activeProgramId && !program.isArchived) ||
      state.programs.find((program) => !program.isArchived);
    if (!target) return { ok: false, reason: 'no unarchived program available' };

    const weeks = Math.max(4, Math.min(10, target.customWeeksTotal || 8));
    const daysPerWeek = Math.max(3, Math.min(6, target.customDaysPerWeek || 4));
    const logs = buildDemoLogs(weeks, daysPerWeek);
    const startedAt = logs[0]?.date;

    state.programs = state.programs.map((program) =>
      program.id === target.id
        ? {
            ...program,
            currentWeek: Math.min(weeks, 3),
            startedAt,
            workoutLogs: logs,
          }
        : program
    );
    state.activeProgramId = target.id;
    state.currentWeek = Math.min(weeks, 3);
    state.lastTrainedProgramId = target.id;
    state.workoutLogs = logs;
    state.exerciseSubstitutions = {};

    localStorage.setItem('block-log-storage', JSON.stringify(parsed));
    return { ok: true, targetName: target.name, weeks, daysPerWeek, workouts: logs.length };
  });

  if (!result.ok) {
    console.error(result);
    await browser.close();
    process.exit(1);
    return;
  }

  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'qa-screenshots/program-lifecycle/12-analytics-seeded-demo.png', fullPage: true });
  console.log(`Seeded analytics demo data for "${result.targetName}" (${result.workouts} workouts).`);

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
