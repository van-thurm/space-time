import type { SupabaseClient } from '@supabase/supabase-js';
import { useAppStore } from '@/lib/store';
import { loadUserData, saveProgram, saveUserMeta, type UserMeta } from './db';
import { getTemplate } from '@/data/program-templates';
import { getProgramWorkouts } from '@/data/programs';
import type {
  UserProgram,
  UserSettings,
  UserCustomTemplate,
  WorkoutLog,
  ExerciseSubstitution,
  AddedExercise,
  Exercise,
  ProgramTemplateId,
} from '@/types';

const CACHE_KEY = 'block-log-cache';
const LEGACY_KEY = 'block-log-storage';
const DEBOUNCE_MS = 2000;

let unsubscribe: (() => void) | null = null;
let programTimers = new Map<string, ReturnType<typeof setTimeout>>();
let metaTimer: ReturnType<typeof setTimeout> | null = null;

interface CacheState {
  programs: UserProgram[];
  activeProgramId: string | null;
  lastTrainedProgramId: string | null;
  currentWeek: number;
  userSettings: UserSettings;
  customTemplates: UserCustomTemplate[];
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  _cacheTimestamp: string;
}

function writeCache(state: CacheState) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

function readCache(): CacheState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheState;
  } catch {
    return null;
  }
}

function buildCacheFromStore(): CacheState {
  const s = useAppStore.getState();
  return {
    programs: s.programs,
    activeProgramId: s.activeProgramId,
    lastTrainedProgramId: s.lastTrainedProgramId,
    currentWeek: s.currentWeek,
    userSettings: s.userSettings,
    customTemplates: s.customTemplates,
    workoutLogs: s.workoutLogs,
    exerciseSubstitutions: s.exerciseSubstitutions,
    _cacheTimestamp: new Date().toISOString(),
  };
}

function buildMeta(): UserMeta {
  const s = useAppStore.getState();
  return {
    activeProgramId: s.activeProgramId,
    lastTrainedProgramId: s.lastTrainedProgramId,
    currentWeek: s.currentWeek,
    settings: s.userSettings,
    customTemplates: s.customTemplates,
  };
}

function saveProgramDebounced(
  client: SupabaseClient,
  userId: string,
  program: UserProgram,
  immediate: boolean
) {
  const existing = programTimers.get(program.id);
  if (existing) clearTimeout(existing);

  if (immediate) {
    saveProgram(client, userId, program).catch(console.error);
    return;
  }

  programTimers.set(
    program.id,
    setTimeout(() => {
      programTimers.delete(program.id);
      saveProgram(client, userId, program).catch(console.error);
    }, DEBOUNCE_MS)
  );
}

function saveMetaDebounced(
  client: SupabaseClient,
  userId: string,
  meta: UserMeta,
  immediate: boolean
) {
  if (metaTimer) clearTimeout(metaTimer);

  if (immediate) {
    metaTimer = null;
    saveUserMeta(client, userId, meta).catch(console.error);
    return;
  }

  metaTimer = setTimeout(() => {
    metaTimer = null;
    saveUserMeta(client, userId, meta).catch(console.error);
  }, DEBOUNCE_MS);
}

function detectCriticalChange(
  prev: UserProgram[],
  next: UserProgram[]
): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const prevP = prev.find((p) => p.id === next[i].id);
    if (!prevP) return true;
    const prevCompleted = prevP.workoutLogs.filter((l) => l.completed).length;
    const nextCompleted = next[i].workoutLogs.filter((l) => l.completed).length;
    if (prevCompleted !== nextCompleted) return true;
  }
  return false;
}

export function initSync(client: SupabaseClient, userId: string): () => void {
  stopSync();

  unsubscribe = useAppStore.subscribe((state, prevState) => {
    writeCache(buildCacheFromStore());

    const immediate = detectCriticalChange(prevState.programs, state.programs);

    for (const program of state.programs) {
      const prevProgram = prevState.programs.find((p) => p.id === program.id);
      if (prevProgram !== program) {
        saveProgramDebounced(client, userId, program, immediate);
      }
    }

    for (const prevProgram of prevState.programs) {
      if (!state.programs.find((p) => p.id === prevProgram.id)) {
        import('./db').then(({ deleteProgram: del }) =>
          del(client, prevProgram.id).catch(console.error)
        );
      }
    }

    const metaChanged =
      state.activeProgramId !== prevState.activeProgramId ||
      state.lastTrainedProgramId !== prevState.lastTrainedProgramId ||
      state.currentWeek !== prevState.currentWeek ||
      state.userSettings !== prevState.userSettings ||
      state.customTemplates !== prevState.customTemplates;

    if (metaChanged) {
      saveMetaDebounced(client, userId, buildMeta(), immediate);
    }
  });

  return () => stopSync();
}

export function stopSync() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  for (const timer of programTimers.values()) clearTimeout(timer);
  programTimers.clear();
  if (metaTimer) {
    clearTimeout(metaTimer);
    metaTimer = null;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function exerciseToAdded(exercise: Exercise): AddedExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    targetRPE: exercise.targetRPE,
    restSeconds: exercise.restSeconds,
    category: exercise.category,
    addedAt: new Date().toISOString(),
    muscleGroup: exercise.muscleGroup?.[0],
    equipment: exercise.equipment?.[0],
    wasUserAdded: false,
  };
}

function hydrateTemplateWorkoutLogs(
  templateId: ProgramTemplateId,
  weeksTotal: number,
  daysPerWeek: number
): WorkoutLog[] {
  const logs: WorkoutLog[] = [];
  for (let week = 1; week <= weeksTotal; week++) {
    const workouts = getProgramWorkouts(templateId, week);
    for (let dayIdx = 0; dayIdx < Math.min(workouts.length, daysPerWeek); dayIdx++) {
      const workout = workouts[dayIdx];
      const workingExercises = workout.exercises.filter((e) => e.category !== 'warmup');
      if (workingExercises.length === 0) continue;
      const added = workingExercises.map(exerciseToAdded);
      logs.push({
        workoutId: `week${week}-day${workout.day}`,
        date: new Date().toISOString(),
        exercises: [],
        completed: false,
        addedExercises: added,
        exerciseOrder: added.map((e) => e.id),
      });
    }
  }
  return logs;
}

function getActivityTimestampCandidate(log: WorkoutLog): string | undefined {
  const hasCompletedSet = log.exercises.some((ex) =>
    ex.sets.some((s) => s.reps > 0 || s.status === 'skipped')
  );
  const hasSkipped = Boolean(log.skippedExercises && log.skippedExercises.length > 0);
  if (log.completed) return log.completedAt || log.lastActivityAt || log.startedAt || log.date;
  if (hasCompletedSet || hasSkipped) return log.lastActivityAt || log.startedAt || log.date;
  return undefined;
}

function runLegacyMigrations(legacyState: {
  programs: UserProgram[];
  activeProgramId: string | null;
  lastTrainedProgramId?: string | null;
  currentWeek: number;
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  userSettings: UserSettings;
  customTemplates?: UserCustomTemplate[];
}): {
  programs: UserProgram[];
  activeProgramId: string | null;
  lastTrainedProgramId: string | null;
  currentWeek: number;
  userSettings: UserSettings;
  customTemplates: UserCustomTemplate[];
} {
  let { programs, activeProgramId } = legacyState;
  const customTemplates = legacyState.customTemplates ?? [];

  if (programs.length === 0 && (legacyState.workoutLogs.length > 0 || legacyState.currentWeek > 1)) {
    const id = generateId();
    const earliestActivity = legacyState.workoutLogs
      .map(getActivityTimestampCandidate)
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
    programs = [
      {
        id,
        templateId: '4-day-upper-lower',
        name: 'My First Block',
        createdAt: new Date().toISOString(),
        startedAt: earliestActivity,
        currentWeek: legacyState.currentWeek,
        workoutLogs: legacyState.workoutLogs,
        exerciseSubstitutions: legacyState.exerciseSubstitutions,
        isActive: true,
        isArchived: false,
        workoutDayNameOverrides: {},
        workoutDayOrder: [1, 2, 3, 4],
      },
    ];
    activeProgramId = id;
  }

  programs = programs.map((program) => {
    if (program.templateId === 'custom') return program;
    if (program.migratedToUnified) return program;
    const template = getTemplate(program.templateId);
    const weeksTotal = program.customWeeksTotal || template.weeksTotal;
    const daysPerWeek = program.customDaysPerWeek || template.daysPerWeek;
    const dayLabels = program.customDayLabels || template.dayLabels;
    const existingLogIds = new Set(program.workoutLogs.map((l) => l.workoutId));
    const hydratedLogs = hydrateTemplateWorkoutLogs(program.templateId, weeksTotal, daysPerWeek);
    const newLogs = hydratedLogs.filter((l) => !existingLogIds.has(l.workoutId));
    const mergedWithStructure = program.workoutLogs.map((existing) => {
      const hydrated = hydratedLogs.find((h) => h.workoutId === existing.workoutId);
      if (!hydrated) return existing;
      if (existing.addedExercises && existing.addedExercises.length > 0) return existing;
      return {
        ...existing,
        addedExercises: hydrated.addedExercises,
        exerciseOrder: existing.exerciseOrder || hydrated.exerciseOrder,
      };
    });

    return {
      ...program,
      workoutLogs: [...mergedWithStructure, ...newLogs],
      customWeeksTotal: weeksTotal,
      customDaysPerWeek: daysPerWeek,
      customDayLabels: dayLabels.length > 0 ? dayLabels : undefined,
      migratedToUnified: true,
    } as UserProgram;
  });

  return {
    programs,
    activeProgramId,
    lastTrainedProgramId: legacyState.lastTrainedProgramId ?? null,
    currentWeek: legacyState.currentWeek,
    userSettings: legacyState.userSettings,
    customTemplates,
  };
}

export async function loadAndHydrate(
  client: SupabaseClient,
  userId: string
): Promise<void> {
  const cached = readCache();
  if (cached) {
    useAppStore.getState().hydrateFromData({
      programs: cached.programs,
      activeProgramId: cached.activeProgramId,
      lastTrainedProgramId: cached.lastTrainedProgramId,
      currentWeek: cached.currentWeek,
      userSettings: cached.userSettings,
      customTemplates: cached.customTemplates,
    });
  }

  let legacyImported = false;
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      const legacyState = parsed.state || parsed;
      const migrated = runLegacyMigrations(legacyState);

      await Promise.all([
        ...migrated.programs.map((p) => saveProgram(client, userId, p)),
        saveUserMeta(client, userId, {
          activeProgramId: migrated.activeProgramId,
          lastTrainedProgramId: migrated.lastTrainedProgramId,
          currentWeek: migrated.currentWeek,
          settings: migrated.userSettings,
          customTemplates: migrated.customTemplates,
        }),
      ]);

      useAppStore.getState().hydrateFromData(migrated);
      writeCache(buildCacheFromStore());
      localStorage.removeItem(LEGACY_KEY);
      legacyImported = true;
    }
  } catch (e) {
    console.error('[block-log] localStorage import failed — will retry on next login', e);
  }

  if (!legacyImported) {
    try {
      const remote = await loadUserData(client, userId);

      if (!cached && remote.programs.length === 0) {
        return;
      }

      if (!cached) {
        useAppStore.getState().hydrateFromData({
          programs: remote.programs,
          activeProgramId: remote.meta.activeProgramId,
          lastTrainedProgramId: remote.meta.lastTrainedProgramId,
          currentWeek: remote.meta.currentWeek,
          userSettings: remote.meta.settings,
          customTemplates: remote.meta.customTemplates,
        });
        writeCache(buildCacheFromStore());
        return;
      }

      if (remote.programs.length > 0) {
        useAppStore.getState().hydrateFromData({
          programs: remote.programs,
          activeProgramId: remote.meta.activeProgramId,
          lastTrainedProgramId: remote.meta.lastTrainedProgramId,
          currentWeek: remote.meta.currentWeek,
          userSettings: remote.meta.settings,
          customTemplates: remote.meta.customTemplates,
        });
        writeCache(buildCacheFromStore());
      }
    } catch (e) {
      console.error('[block-log] Supabase fetch failed — using cached data', e);
    }
  }
}
