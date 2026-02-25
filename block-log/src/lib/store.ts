import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTemplate } from '@/data/program-templates';
import { getProgramWorkouts } from '@/data/programs';
import type { 
  WorkoutLog, 
  ExerciseSubstitution, 
  UserSettings,
  ExerciseLog,
  SetLog,
  AddedExercise,
  Exercise,
  UserProgram,
  ProgramTemplateId,
  UserCustomTemplate
} from '@/types';

interface AppState {
  // Multi-program state
  programs: UserProgram[];
  activeProgramId: string | null;
  lastTrainedProgramId: string | null;
  customTemplates: UserCustomTemplate[];
  
  // Legacy state (for backward compatibility / migration)
  currentWeek: number;
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  userSettings: UserSettings;

  // Custom template actions
  saveAsTemplate: (programId: string, templateName: string) => string | null;
  deleteCustomTemplate: (templateId: string) => void;
  clearCustomTemplates: () => void;
  getCustomTemplates: () => UserCustomTemplate[];

  // Program actions
  createProgram: (
    templateId: ProgramTemplateId,
    name: string,
    options?: {
      customWeeksTotal?: number;
      customDaysPerWeek?: number;
      customDayLabels?: string[];
    }
  ) => string;
  deleteProgram: (programId: string) => void;
  setActiveProgram: (programId: string) => void;
  getActiveProgram: () => UserProgram | undefined;
  getAllPrograms: () => UserProgram[];
  archiveProgram: (programId: string) => void;
  restoreProgram: (programId: string) => void;
  renameProgram: (programId: string, newName: string) => void;
  renameWorkoutDay: (programId: string, day: number, name: string) => void;
  reorderWorkoutDays: (programId: string, dayOrder: number[]) => void;
  addWeekToProgram: (programId: string) => void;
  removeWeekFromProgram: (programId: string) => void;
  addDayToProgram: (programId: string) => void;
  updateProgramStructure: (
    programId: string,
    updates: { weeksTotal?: number; daysPerWeek?: number }
  ) => void;
  reorderPrograms: (programIds: string[]) => void;
  copyCustomWorkoutDayAcrossProgram: (workoutId: string) => boolean;
  updateTrackedChartExercises: (programId: string, exercises: string[] | null) => void;
  
  // Current week (scoped to active program)
  setCurrentWeek: (week: number) => void;
  
  // Workout logging (scoped to active program)
  logWorkout: (log: WorkoutLog) => void;
  updateWorkoutLog: (workoutId: string, updates: Partial<WorkoutLog>) => void;
  resetWorkoutLog: (workoutId: string) => void;
  getWorkoutLog: (workoutId: string) => WorkoutLog | undefined;
  getLastWorkoutLog: (week: number, day: number) => WorkoutLog | undefined;
  
  // Exercise logging within a workout
  logExerciseSet: (
    workoutId: string, 
    exerciseId: string, 
    setIndex: number, 
    setData: SetLog
  ) => void;
  
  // Exercise substitution (scoped to active program)
  substituteExercise: (exerciseId: string, substitution: ExerciseSubstitution) => void;
  getSubstitution: (exerciseId: string) => ExerciseSubstitution | undefined;
  revertSubstitution: (exerciseId: string) => void;
  
  // Exercise skip/add/reorder
  skipExercise: (workoutId: string, exerciseId: string) => void;
  unskipExercise: (workoutId: string, exerciseId: string) => void;
  isExerciseSkipped: (workoutId: string, exerciseId: string) => boolean;
  addExerciseToWorkout: (workoutId: string, exercise: AddedExercise) => void;
  removeAddedExercise: (workoutId: string, exerciseId: string) => void;
  deleteExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  updateAddedExercise: (workoutId: string, exerciseId: string, updates: Partial<AddedExercise>) => void;
  updateExerciseOverride: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Pick<Exercise, 'sets' | 'reps' | 'targetRPE' | 'restSeconds'>>
  ) => void;
  getAddedExercises: (workoutId: string) => AddedExercise[];
  reorderExercises: (workoutId: string, exerciseOrder: string[]) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Utility
  getWorkoutStatus: (workoutId: string) => 'not_started' | 'in_progress' | 'completed';
  clearAllData: () => void;
  migrateToMultiProgram: () => void;
  migrateTemplatePrograms: () => void;
}

const defaultSettings: UserSettings = {
  units: 'lbs',
  showRestTimer: true,
  cascadeWeightToSets: true,
  keepScreenAwake: false,
};

// Generate unique ID
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
  daysPerWeek: number,
): WorkoutLog[] {
  const logs: WorkoutLog[] = [];
  for (let week = 1; week <= weeksTotal; week++) {
    const workouts = getProgramWorkouts(templateId, week);
    for (let dayIdx = 0; dayIdx < Math.min(workouts.length, daysPerWeek); dayIdx++) {
      const workout = workouts[dayIdx];
      const workingExercises = workout.exercises.filter(e => e.category !== 'warmup');
      if (workingExercises.length === 0) continue;
      const added = workingExercises.map(exerciseToAdded);
      logs.push({
        workoutId: `week${week}-day${workout.day}`,
        date: new Date().toISOString(),
        exercises: [],
        completed: false,
        addedExercises: added,
        exerciseOrder: added.map(e => e.id),
      });
    }
  }
  return logs;
}

// Normalize user-entered labels for UI consistency.
function normalizeTextEntry(value: string): string {
  return value
    .replace(/\s*&\s*/g, ' + ')
    .replace(/&/g, '+')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function removeExerciseReferencesFromLog(
  log: WorkoutLog,
  exerciseId: string,
  options?: { markSkipped?: boolean; markDeleted?: boolean }
): WorkoutLog {
  const wasAddedExercise = Boolean(log.addedExercises?.some((exercise) => exercise.id === exerciseId));
  const shouldMarkDeleted = Boolean(options?.markDeleted) && !wasAddedExercise;
  const shouldMarkSkipped = Boolean(options?.markSkipped) && !wasAddedExercise && !shouldMarkDeleted;
  const nextSkipped = (log.skippedExercises || []).filter((id) => id !== exerciseId);
  const nextDeleted = (log.deletedExercises || []).filter((id) => id !== exerciseId);
  const nextOverrides = { ...(log.exerciseOverrides || {}) };
  delete nextOverrides[exerciseId];

  return {
    ...log,
    exercises: log.exercises.filter((exerciseLog) => exerciseLog.exerciseId !== exerciseId),
    addedExercises: (log.addedExercises || []).filter((exercise) => exercise.id !== exerciseId),
    skippedExercises: shouldMarkSkipped ? [...nextSkipped, exerciseId] : nextSkipped,
    deletedExercises: shouldMarkDeleted ? [...nextDeleted, exerciseId] : nextDeleted,
    exerciseOrder: (log.exerciseOrder || []).filter((id) => id !== exerciseId),
    exerciseOverrides: nextOverrides,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Multi-program state
      programs: [],
      activeProgramId: null,
      lastTrainedProgramId: null,
      customTemplates: [],
      
      // Legacy state (for backward compatibility)
      currentWeek: 1,
      workoutLogs: [],
      exerciseSubstitutions: {},
      userSettings: defaultSettings,

      // Save a program as a reusable custom template
      saveAsTemplate: (programId, templateName) => {
        const state = get();
        const program = state.programs.find(p => p.id === programId);
        if (!program) return null;
        const normalizedTemplateName = normalizeTextEntry(templateName);
        if (!normalizedTemplateName) return null;

        // Get all unique added exercises from workout logs
        const workoutDaysMap = new Map<number, { name: string; exercises: any[] }>();
        
        for (const log of program.workoutLogs) {
          const [, weekDay] = log.workoutId.split('-');
          const day = parseInt(weekDay.replace('day', ''));
          
          if (!workoutDaysMap.has(day)) {
            workoutDaysMap.set(day, { name: `Day ${day}`, exercises: [] });
          }
          
          // Add custom exercises from the log
          if (log.addedExercises) {
            for (const ex of log.addedExercises) {
              // Check if we already have this exercise name
              const existing = workoutDaysMap.get(day)?.exercises.find(e => e.name === ex.name);
              if (!existing) {
                workoutDaysMap.get(day)?.exercises.push({
                  name: normalizeTextEntry(ex.name),
                  category: ex.category,
                  sets: ex.sets,
                  reps: ex.reps,
                  targetRPE: ex.targetRPE,
                  restSeconds: ex.restSeconds,
                  muscleGroup: ex.muscleGroup,
                  equipment: ex.equipment,
                });
              }
            }
          }
        }

        const templateId = `user-template-${generateId()}`;
        const inferredDayLabels = Array.from(workoutDaysMap.values()).map((d) => d.name.toLowerCase());
        const effectiveDayLabels =
          program.customDayLabels && program.customDayLabels.length > 0
            ? program.customDayLabels
            : inferredDayLabels;
        const newTemplate: UserCustomTemplate = {
          id: templateId,
          name: normalizedTemplateName,
          shortName:
            normalizedTemplateName.length > 12
              ? normalizedTemplateName.substring(0, 12) + '...'
              : normalizedTemplateName,
          description: `Custom template based on ${normalizeTextEntry(program.name)}`,
          daysPerWeek: program.customDaysPerWeek || effectiveDayLabels.length || 4,
          weeksTotal: program.customWeeksTotal || 12,
          dayLabels: effectiveDayLabels,
          createdAt: new Date().toISOString(),
          workoutDays: Array.from(workoutDaysMap.entries()).map(([day, data]) => ({
            day,
            name: data.name,
            exercises: data.exercises,
          })),
        };

        set({ customTemplates: [...state.customTemplates, newTemplate] });
        return templateId;
      },

      deleteCustomTemplate: (templateId) => set((state) => ({
        customTemplates: state.customTemplates.filter(t => t.id !== templateId),
      })),

      clearCustomTemplates: () => set({
        customTemplates: [],
      }),

      getCustomTemplates: () => get().customTemplates,

      createProgram: (templateId, name, options) => {
        const id = generateId();
        const template = getTemplate(templateId);
        const normalizedProgramName = normalizeTextEntry(name);
        const hasCustomWeeks = typeof options?.customWeeksTotal === 'number';
        const hasCustomDays = typeof options?.customDaysPerWeek === 'number';
        const initialWeeks = hasCustomWeeks ? (options?.customWeeksTotal || template.weeksTotal) : template.weeksTotal;
        const daysPerWeek = hasCustomDays ? (options?.customDaysPerWeek || template.daysPerWeek) : template.daysPerWeek;

        const dayLabels = options?.customDayLabels && options.customDayLabels.length > 0
          ? options.customDayLabels.map((label) => normalizeTextEntry(label))
          : template.dayLabels.length > 0
            ? template.dayLabels.slice(0, daysPerWeek)
            : Array.from({ length: daysPerWeek }, (_, i) => `day ${i + 1}`);

        const hydratedLogs = templateId !== 'custom'
          ? hydrateTemplateWorkoutLogs(templateId, initialWeeks, daysPerWeek)
          : [];

        const newProgram: UserProgram = {
          id,
          templateId,
          name: normalizedProgramName || name.trim(),
          createdAt: new Date().toISOString(),
          currentWeek: 1,
          workoutLogs: hydratedLogs,
          exerciseSubstitutions: {},
          isActive: true,
          isArchived: false,
          minWeeksTotal: initialWeeks,
          customWeeksTotal: initialWeeks,
          customDaysPerWeek: daysPerWeek,
          customDayLabels: dayLabels,
          workoutDayNameOverrides: {},
          workoutDayOrder: Array.from({ length: daysPerWeek }, (_, i) => i + 1),
        };
        
        set((state) => ({
          programs: [...state.programs.map(p => ({ ...p, isActive: false })), newProgram],
          activeProgramId: id,
          lastTrainedProgramId: state.lastTrainedProgramId,
          currentWeek: 1,
          workoutLogs: hydratedLogs,
          exerciseSubstitutions: {},
        }));
        
        return id;
      },

      // Delete a program
      deleteProgram: (programId) => set((state) => {
        const newPrograms = state.programs.filter(p => p.id !== programId);
        const wasActive = state.activeProgramId === programId;
        
        // If we deleted the active program, activate another one
        let newActiveId = state.activeProgramId;
        if (wasActive && newPrograms.length > 0) {
          newActiveId = newPrograms[0].id;
          newPrograms[0] = { ...newPrograms[0], isActive: true };
        } else if (newPrograms.length === 0) {
          newActiveId = null;
        }
        
        return { 
          programs: newPrograms,
          activeProgramId: newActiveId,
          lastTrainedProgramId:
            state.lastTrainedProgramId === programId ? null : state.lastTrainedProgramId,
        };
      }),

      // Set active program
      setActiveProgram: (programId) => set((state) => {
        const program = state.programs.find(p => p.id === programId);
        if (!program) return state;
        
        return {
          programs: state.programs.map(p => ({ 
            ...p, 
            isActive: p.id === programId 
          })),
          activeProgramId: programId,
          currentWeek: program.currentWeek,
          workoutLogs: program.workoutLogs,
          exerciseSubstitutions: program.exerciseSubstitutions,
        };
      }),

      // Get active program
      getActiveProgram: () => {
        const state = get();
        if (!state.activeProgramId) return undefined;
        return state.programs.find(p => p.id === state.activeProgramId);
      },

      // Get all programs (non-archived)
      getAllPrograms: () => {
        return get().programs.filter(p => !p.isArchived);
      },

      // Archive a program
      archiveProgram: (programId) => set((state) => {
        const nextPrograms = state.programs.map((program) =>
          program.id === programId ? { ...program, isArchived: true, isActive: false } : program
        );
        const wasActive = state.activeProgramId === programId;
        const fallbackActive = nextPrograms.find((program) => !program.isArchived && program.id !== programId);
        const nextActiveProgramId = wasActive ? (fallbackActive?.id || null) : state.activeProgramId;
        const normalizedPrograms = nextPrograms.map((program) => ({
          ...program,
          isActive: nextActiveProgramId ? program.id === nextActiveProgramId : false,
        }));

        return {
          programs: normalizedPrograms,
          activeProgramId: nextActiveProgramId,
          lastTrainedProgramId:
            state.lastTrainedProgramId === programId ? null : state.lastTrainedProgramId,
          currentWeek: nextActiveProgramId
            ? normalizedPrograms.find((program) => program.id === nextActiveProgramId)?.currentWeek || 1
            : 1,
          workoutLogs: nextActiveProgramId
            ? normalizedPrograms.find((program) => program.id === nextActiveProgramId)?.workoutLogs || []
            : [],
          exerciseSubstitutions: nextActiveProgramId
            ? normalizedPrograms.find((program) => program.id === nextActiveProgramId)?.exerciseSubstitutions || {}
            : {},
        };
      }),

      restoreProgram: (programId) => set((state) => ({
        programs: state.programs.map((program) =>
          program.id === programId ? { ...program, isArchived: false } : program
        ),
      })),

      // Rename a program
      renameProgram: (programId, newName) => set((state) => ({
        programs: state.programs.map(p => 
          p.id === programId ? { ...p, name: normalizeTextEntry(newName) || newName.trim() } : p
        ),
      })),

      // Rename a workout day label for a program (dashboard/workout display only)
      renameWorkoutDay: (programId, day, name) => set((state) => ({
        programs: state.programs.map((program) => {
          if (program.id !== programId) return program;
          return {
            ...program,
            workoutDayNameOverrides: {
              ...(program.workoutDayNameOverrides || {}),
              [day]: normalizeTextEntry(name) || name.trim(),
            },
          };
        }),
      })),

      // Reorder workout day cards on dashboard for a program
      reorderWorkoutDays: (programId, dayOrder) => set((state) => ({
        programs: state.programs.map((program) => {
          if (program.id !== programId) return program;
          return {
            ...program,
            workoutDayOrder: dayOrder,
          };
        }),
      })),

      // Add a week to a program
      addWeekToProgram: (programId) => set((state) => ({
        programs: state.programs.map(p => {
          if (p.id !== programId) return p;
          // Get current weeks (customWeeksTotal or from template default)
          const templateWeeks = getTemplate(p.templateId).weeksTotal;
          const currentWeeks = p.customWeeksTotal || templateWeeks;
          return { ...p, customWeeksTotal: currentWeeks + 1 };
        }),
      })),

      // Remove a week from a program (minimum 1 week)
      removeWeekFromProgram: (programId) => set((state) => ({
        programs: state.programs.map(p => {
          if (p.id !== programId) return p;
          const templateWeeks = getTemplate(p.templateId).weeksTotal;
          const currentWeeks = p.customWeeksTotal || templateWeeks;
          // Don't go below 1 week or current week
          const floor = Math.max(1, p.currentWeek);
          return { ...p, customWeeksTotal: Math.max(floor, currentWeeks - 1) };
        }),
      })),

      // Add a day to a program globally (one-way expansion for data integrity)
      addDayToProgram: (programId) => set((state) => ({
        programs: state.programs.map((program) => {
          if (program.id !== programId) return program;
          const template = getTemplate(program.templateId);
          const baseLabels =
            program.customDayLabels && program.customDayLabels.length > 0
              ? [...program.customDayLabels]
              : [...template.dayLabels];
          const currentDays = program.customDaysPerWeek || template.daysPerWeek;
          const nextDays = Math.min(7, currentDays + 1);
          if (nextDays <= currentDays) return program;
          const nextLabels = [...baseLabels];
          while (nextLabels.length < nextDays) {
            nextLabels.push(`day ${nextLabels.length + 1}`);
          }
          const nextOrder = Array.from({ length: nextDays }, (_, i) => i + 1);
          return {
            ...program,
            customDaysPerWeek: nextDays,
            customDayLabels: nextLabels,
            workoutDayOrder: nextOrder,
          };
        }),
      })),

      updateProgramStructure: (programId, updates) => set((state) => ({
        programs: state.programs.map((program) => {
          if (program.id !== programId) return program;
          const template = getTemplate(program.templateId);
          const minWeeks = Math.max(1, program.currentWeek);
          const requestedWeeks = typeof updates.weeksTotal === 'number'
            ? Math.max(minWeeks, Math.min(52, Math.round(updates.weeksTotal)))
            : (program.customWeeksTotal || template.weeksTotal);
          const requestedDays = typeof updates.daysPerWeek === 'number'
            ? Math.max(1, Math.min(7, Math.round(updates.daysPerWeek)))
            : (program.customDaysPerWeek || template.daysPerWeek);

          const nextCustomWeeks = requestedWeeks === template.weeksTotal ? undefined : requestedWeeks;
          const nextCustomDays = requestedDays === template.daysPerWeek ? undefined : requestedDays;

          const baseLabels =
            program.customDayLabels && program.customDayLabels.length > 0
              ? [...program.customDayLabels]
              : [...template.dayLabels];
          const nextLabels = [...baseLabels];
          while (nextLabels.length < requestedDays) {
            nextLabels.push(`day ${nextLabels.length + 1}`);
          }
          const trimmedLabels = nextLabels.slice(0, requestedDays);
          const shouldUseCustomLabels =
            trimmedLabels.length !== template.dayLabels.length ||
            trimmedLabels.some((label, index) => label !== template.dayLabels[index]);

          return {
            ...program,
            customWeeksTotal: nextCustomWeeks,
            customDaysPerWeek: nextCustomDays,
            customDayLabels: shouldUseCustomLabels ? trimmedLabels : undefined,
            workoutDayOrder: Array.from({ length: requestedDays }, (_, i) => i + 1),
          };
        }),
      })),

      // Reorder programs based on provided order
      reorderPrograms: (programIds) => set((state) => ({
        programs: programIds
          .map(id => state.programs.find(p => p.id === id))
          .filter((p): p is UserProgram => p !== undefined)
          .concat(state.programs.filter(p => !programIds.includes(p.id))), // Keep any not in order at end
      })),

      // Update tracked chart exercises for a program (null = reset to auto)
      updateTrackedChartExercises: (programId, exercises) => set((state) => ({
        programs: state.programs.map((p) =>
          p.id === programId
            ? { ...p, trackedChartExercises: exercises ?? undefined }
            : p
        ),
      })),

      copyCustomWorkoutDayAcrossProgram: (workoutId) => {
        const state = get();
        if (!state.activeProgramId) return false;
        const activeProgram = state.programs.find((program) => program.id === state.activeProgramId);
        if (!activeProgram) return false;

        const weekMatch = /week(\d+)/.exec(workoutId);
        const dayMatch = /day(\d+)/.exec(workoutId);
        const sourceWeek = weekMatch ? Number(weekMatch[1]) : Number.NaN;
        if (!dayMatch || !Number.isFinite(sourceWeek) || sourceWeek < 1) return false;
        const day = Number(dayMatch[1]);
        if (!Number.isFinite(day) || day < 1) return false;

        const sourceLog = state.workoutLogs.find((log) => log.workoutId === workoutId);
        if (!sourceLog) return false;
        const sourceAdded = sourceLog?.addedExercises || [];
        const sourceOrder = sourceLog?.exerciseOrder || [];
        const sourceOverrides = sourceLog.exerciseOverrides || {};
        const sourceExerciseLogs = sourceLog.exercises || [];
        const sourceDeleted = sourceLog.deletedExercises || [];
        if (sourceAdded.length === 0 && sourceExerciseLogs.length === 0 && Object.keys(sourceOverrides).length === 0 && sourceDeleted.length === 0) {
          return false;
        }

        const totalWeeks =
          activeProgram.customWeeksTotal || getTemplate(activeProgram.templateId).weeksTotal || 12;

        const hasProgressData = (log?: WorkoutLog) => {
          if (!log) return false;
          if (log.completed) return true;
          if (log.skippedExercises && log.skippedExercises.length > 0) return true;
          return log.exercises.some((exerciseLog) =>
            exerciseLog.sets.some(
              (set) =>
                (set.reps || 0) > 0 ||
                (set.rpe || 0) > 0 ||
                set.status === 'skipped'
            )
          );
        };

        const clonedDeleted = [...sourceDeleted];
        const clonedAdded = sourceAdded
          .filter((exercise) => !sourceDeleted.includes(exercise.id))
          .map((exercise) => ({ ...exercise }));
        const clonedOrder = (sourceOrder.length > 0 ? [...sourceOrder] : sourceAdded.map((exercise) => exercise.id))
          .filter((id) => !sourceDeleted.includes(id));
        const clonedOverrides = Object.fromEntries(
          Object.entries(sourceOverrides)
            .filter(([exerciseId]) => !sourceDeleted.includes(exerciseId))
            .map(([exerciseId, override]) => [exerciseId, { ...override }])
        );
        const clonedExerciseLogs = sourceExerciseLogs
          .filter((exerciseLog) => !sourceDeleted.includes(exerciseLog.exerciseId))
          .map((exerciseLog) => ({
            ...exerciseLog,
            // Carry weight forward as seed but reset completion-like data.
            sets: exerciseLog.sets.map((set) => ({
              weight: set.weight || 0,
              reps: 0,
              rpe: 0,
            })),
            completed: false,
          }));

        const nextLogs = [...state.workoutLogs];
        for (let week = 1; week <= totalWeeks; week += 1) {
          if (week <= sourceWeek) continue;
          const targetWorkoutId = `week${week}-day${day}`;
          if (targetWorkoutId === workoutId) continue;
          const existingIndex = nextLogs.findIndex((log) => log.workoutId === targetWorkoutId);
          const existingLog = existingIndex >= 0 ? nextLogs[existingIndex] : undefined;
          if (hasProgressData(existingLog)) continue;

          if (existingLog) {
            nextLogs[existingIndex] = {
              ...existingLog,
              addedExercises: clonedAdded.map((exercise) => ({ ...exercise })),
              deletedExercises: [...clonedDeleted],
              exerciseOrder: [...clonedOrder],
              exerciseOverrides: {
                ...(existingLog.exerciseOverrides || {}),
                ...Object.fromEntries(
                  Object.entries(clonedOverrides).map(([exerciseId, override]) => [exerciseId, { ...override }])
                ),
              },
              exercises: clonedExerciseLogs.map((exerciseLog) => ({
                ...exerciseLog,
                sets: exerciseLog.sets.map((set) => ({ ...set })),
              })),
            };
          } else {
            nextLogs.push({
              workoutId: targetWorkoutId,
              date: new Date().toISOString(),
              exercises: clonedExerciseLogs.map((exerciseLog) => ({
                ...exerciseLog,
                sets: exerciseLog.sets.map((set) => ({ ...set })),
              })),
              completed: false,
              deletedExercises: [...clonedDeleted],
              addedExercises: clonedAdded.map((exercise) => ({ ...exercise })),
              exerciseOrder: [...clonedOrder],
              exerciseOverrides: Object.fromEntries(
                Object.entries(clonedOverrides).map(([exerciseId, override]) => [exerciseId, { ...override }])
              ),
            });
          }
        }

        set({
          workoutLogs: nextLogs,
          programs: state.programs.map((program) =>
            program.id === state.activeProgramId ? { ...program, workoutLogs: nextLogs } : program
          ),
        });
        return true;
      },

      // Migrate legacy data to multi-program structure
      migrateToMultiProgram: () => {
        const state = get();
        
        // Only migrate if we have legacy data and no programs
        if (state.programs.length === 0 && (state.workoutLogs.length > 0 || state.currentWeek > 1)) {
          const id = generateId();
          const legacyProgram: UserProgram = {
            id,
            templateId: '4-day-upper-lower',
            name: 'My First Block',
            createdAt: new Date().toISOString(),
            startedAt: state.workoutLogs[0]?.date,
            currentWeek: state.currentWeek,
            workoutLogs: state.workoutLogs,
            exerciseSubstitutions: state.exerciseSubstitutions,
            isActive: true,
            isArchived: false,
            workoutDayNameOverrides: {},
            workoutDayOrder: [1, 2, 3, 4],
          };
          
          set({
            programs: [legacyProgram],
            activeProgramId: id,
          });
        }
      },

      migrateTemplatePrograms: () => {
        const state = get();
        const programsToMigrate = state.programs.filter(
          (p) => p.templateId !== 'custom' && !p.migratedToUnified
        );
        if (programsToMigrate.length === 0) return;

        const updatedPrograms = state.programs.map((program) => {
          if (program.templateId === 'custom') return program;
          if (program.migratedToUnified) return program;

          const template = getTemplate(program.templateId);
          const weeksTotal = program.customWeeksTotal || template.weeksTotal;
          const daysPerWeek = program.customDaysPerWeek || template.daysPerWeek;
          const dayLabels = program.customDayLabels || template.dayLabels;
          const existingLogIds = new Set(program.workoutLogs.map((l) => l.workoutId));

          const hydratedLogs = hydrateTemplateWorkoutLogs(program.templateId, weeksTotal, daysPerWeek);
          const newLogs = hydratedLogs.filter((l) => !existingLogIds.has(l.workoutId));

          const mergedLogs = [...program.workoutLogs, ...newLogs];
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

          const finalLogs = [
            ...mergedWithStructure,
            ...newLogs,
          ];

          if (process.env.NODE_ENV === 'development') {
            console.log(`[migration] Hydrated program "${program.name}" (${program.templateId}): ${newLogs.length} new logs added`);
          }

          return {
            ...program,
            workoutLogs: finalLogs,
            customWeeksTotal: weeksTotal,
            customDaysPerWeek: daysPerWeek,
            customDayLabels: dayLabels.length > 0 ? dayLabels : undefined,
            migratedToUnified: true,
          } as UserProgram;
        });

        const activeId = state.activeProgramId;
        const activeUpdated = updatedPrograms.find((p) => p.id === activeId);

        set({
          programs: updatedPrograms,
          workoutLogs: activeUpdated ? activeUpdated.workoutLogs : state.workoutLogs,
        });
      },

      setCurrentWeek: (week) => set((state) => {
        // Update active program if exists
        if (state.activeProgramId) {
          return {
            currentWeek: week,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, currentWeek: week } : p
            ),
          };
        }
        return { currentWeek: week };
      }),

      // Log a complete workout (syncs with active program)
      logWorkout: (log) => set((state) => {
        const existingIndex = state.workoutLogs.findIndex(
          (l) => l.workoutId === log.workoutId
        );
        
        let newLogs: WorkoutLog[];
        if (existingIndex >= 0) {
          newLogs = [...state.workoutLogs];
          newLogs[existingIndex] = log;
        } else {
          newLogs = [...state.workoutLogs, log];
        }
        
        // Sync with active program
        if (state.activeProgramId) {
          const nowTrainedProgramId = log.completed ? state.activeProgramId : state.lastTrainedProgramId;
          const earliestLoggedAt = newLogs
            .map((entry) => new Date(entry.date).getTime())
            .filter((value) => Number.isFinite(value))
            .sort((a, b) => a - b)[0];
          return {
            workoutLogs: newLogs,
            lastTrainedProgramId: nowTrainedProgramId,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId
                ? {
                    ...p,
                    workoutLogs: newLogs,
                    startedAt:
                      p.startedAt ||
                      (earliestLoggedAt ? new Date(earliestLoggedAt).toISOString() : undefined),
                  }
                : p
            ),
          };
        }
        
        return { workoutLogs: newLogs };
      }),

      // Update an existing workout log
      updateWorkoutLog: (workoutId, updates) => set((state) => {
        const newLogs = state.workoutLogs.map((log) =>
          log.workoutId === workoutId ? { ...log, ...updates } : log
        );
        return { workoutLogs: newLogs };
      }),

      // Remove a workout log entirely (returns card to "ready")
      resetWorkoutLog: (workoutId) => set((state) => {
        const newLogs = state.workoutLogs.filter((log) => log.workoutId !== workoutId);

        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map((program) =>
              program.id === state.activeProgramId ? { ...program, workoutLogs: newLogs } : program
            ),
          };
        }

        return { workoutLogs: newLogs };
      }),

      // Get a specific workout log
      getWorkoutLog: (workoutId) => {
        return get().workoutLogs.find((log) => log.workoutId === workoutId);
      },

      // Get the last logged workout for a specific week/day pattern
      getLastWorkoutLog: (week, day) => {
        const logs = get().workoutLogs;
        // Find the most recent log for previous weeks with same day
        for (let w = week - 1; w >= 1; w--) {
          const workoutId = `week${w}-day${day}`;
          const log = logs.find((l) => l.workoutId === workoutId);
          if (log) return log;
        }
        return undefined;
      },

      // Log a single set within a workout (syncs with active program)
      logExerciseSet: (workoutId, exerciseId, setIndex, setData) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(
          (l) => l.workoutId === workoutId
        );

        let newLogs: WorkoutLog[];

        // If no workout log exists, create one
        if (logIndex < 0) {
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [{
              exerciseId,
              sets: [],
              completed: false,
            }],
            completed: false,
          };
          
          while (newLog.exercises[0].sets.length <= setIndex) {
            newLog.exercises[0].sets.push({ weight: 0, reps: 0, rpe: 0 });
          }
          newLog.exercises[0].sets[setIndex] = setData;
          
          newLogs = [...state.workoutLogs, newLog];
        } else {
          // Update existing log
          newLogs = [...state.workoutLogs];
          const log = { ...newLogs[logIndex] };
          log.exercises = [...log.exercises];

          const exerciseIndex = log.exercises.findIndex(
            (e) => e.exerciseId === exerciseId
          );

          if (exerciseIndex < 0) {
            const newExerciseLog: ExerciseLog = {
              exerciseId,
              sets: [],
              completed: false,
            };
            while (newExerciseLog.sets.length <= setIndex) {
              newExerciseLog.sets.push({ weight: 0, reps: 0, rpe: 0 });
            }
            newExerciseLog.sets[setIndex] = setData;
            log.exercises.push(newExerciseLog);
          } else {
            log.exercises[exerciseIndex] = { ...log.exercises[exerciseIndex] };
            const exerciseLog = log.exercises[exerciseIndex];
            exerciseLog.sets = [...exerciseLog.sets];
            
            while (exerciseLog.sets.length <= setIndex) {
              exerciseLog.sets.push({ weight: 0, reps: 0, rpe: 0 });
            }
            exerciseLog.sets[setIndex] = setData;
          }

          newLogs[logIndex] = log;
        }

        // Sync with active program
        if (state.activeProgramId) {
          const didLogProgress =
            setData.status === 'completed' ||
            (setData.reps || 0) > 0 ||
            (setData.weight || 0) > 0;
          // Only update lastTrainedProgramId if the workout still has real
          // training progress after this update (mirrors getWorkoutStatus).
          // This ensures an accidental tap + undo doesn't permanently mark
          // the program as last-trained.
          const targetLog = newLogs.find((l) => l.workoutId === workoutId);
          const stillHasProgress = targetLog
            ? targetLog.exercises.some((ex) =>
                ex.sets.some((s) => s.reps > 0 || s.status === 'skipped')
              )
            : false;
          const shouldUpdateTrainedId = didLogProgress && stillHasProgress;
          return {
            workoutLogs: newLogs,
            lastTrainedProgramId: shouldUpdateTrainedId ? state.activeProgramId : state.lastTrainedProgramId,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        
        return { workoutLogs: newLogs };
      }),

      // Substitute an exercise (syncs with active program)
      substituteExercise: (exerciseId, substitution) => set((state) => {
        const newSubs = {
          ...state.exerciseSubstitutions,
          [exerciseId]: substitution,
        };
        
        if (state.activeProgramId) {
          return {
            exerciseSubstitutions: newSubs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, exerciseSubstitutions: newSubs } : p
            ),
          };
        }
        
        return { exerciseSubstitutions: newSubs };
      }),

      // Get substitution for an exercise
      getSubstitution: (exerciseId) => {
        return get().exerciseSubstitutions[exerciseId];
      },

      // Revert a substitution (syncs with active program)
      revertSubstitution: (exerciseId) => set((state) => {
        const newSubstitutions = { ...state.exerciseSubstitutions };
        delete newSubstitutions[exerciseId];
        
        if (state.activeProgramId) {
          return {
            exerciseSubstitutions: newSubstitutions,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, exerciseSubstitutions: newSubstitutions } : p
            ),
          };
        }
        
        return { exerciseSubstitutions: newSubstitutions };
      }),

      // Skip an exercise (remove from workout) - syncs with active program
      skipExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        
        let newLogs: WorkoutLog[];
        if (logIndex < 0) {
          // Create new log with skipped exercise
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            skippedExercises: [exerciseId],
          };
          newLogs = [...state.workoutLogs, newLog];
        } else {
          // Update existing log
          newLogs = [...state.workoutLogs];
          const log = { ...newLogs[logIndex] };
          const skipped = log.skippedExercises || [];
          if (!skipped.includes(exerciseId)) {
            log.skippedExercises = [...skipped, exerciseId];
          }
          newLogs[logIndex] = log;
        }
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      // Unskip an exercise (restore to workout) - syncs with active program
      unskipExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        if (logIndex < 0) return state;
        
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.skippedExercises = (log.skippedExercises || []).filter(id => id !== exerciseId);
        newLogs[logIndex] = log;
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      // Check if exercise is skipped
      isExerciseSkipped: (workoutId, exerciseId) => {
        const log = get().workoutLogs.find(l => l.workoutId === workoutId);
        return log?.skippedExercises?.includes(exerciseId) || false;
      },

      // Add a custom exercise to workout - syncs with active program
      addExerciseToWorkout: (workoutId, exercise) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        const normalizedExercise = {
          ...exercise,
          name: normalizeTextEntry(exercise.name) || exercise.name.trim(),
          wasUserAdded: true,
        };
        
        let newLogs: WorkoutLog[];
        if (logIndex < 0) {
          // Create new log with added exercise
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            addedExercises: [normalizedExercise],
          };
          newLogs = [...state.workoutLogs, newLog];
        } else {
          // Update existing log
          newLogs = [...state.workoutLogs];
          const log = { ...newLogs[logIndex] };
          log.addedExercises = [...(log.addedExercises || []), normalizedExercise];
          newLogs[logIndex] = log;
        }
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      // Remove an added exercise - syncs with active program
      removeAddedExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        if (logIndex < 0) return state;
        
        const newLogs = [...state.workoutLogs];
        newLogs[logIndex] = removeExerciseReferencesFromLog(newLogs[logIndex], exerciseId);
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      deleteExerciseFromWorkout: (workoutId, exerciseId) => set((state) => {
        let newLogs = [...state.workoutLogs];
        let logIndex = newLogs.findIndex((log) => log.workoutId === workoutId);

        // Create a log entry if none exists so the delete can be recorded.
        if (logIndex < 0) {
          const emptyLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
          };
          newLogs = [...newLogs, emptyLog];
          logIndex = newLogs.length - 1;
        }

        newLogs[logIndex] = removeExerciseReferencesFromLog(newLogs[logIndex], exerciseId, { markDeleted: true });

        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map((program) =>
              program.id === state.activeProgramId ? { ...program, workoutLogs: newLogs } : program
            ),
          };
        }

        return { workoutLogs: newLogs };
      }),

      // Update an added exercise - syncs with active program
      updateAddedExercise: (workoutId, exerciseId, updates) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        if (logIndex < 0) return state;
        const normalizedUpdates =
          typeof updates.name === 'string'
            ? { ...updates, name: normalizeTextEntry(updates.name) || updates.name.trim() }
            : updates;
        
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.addedExercises = (log.addedExercises || []).map(e => 
          e.id === exerciseId ? { ...e, ...normalizedUpdates } : e
        );
        newLogs[logIndex] = log;
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      updateExerciseOverride: (workoutId, exerciseId, updates) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);

        let newLogs: WorkoutLog[];
        if (logIndex < 0) {
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            exerciseOverrides: { [exerciseId]: updates },
          };
          newLogs = [...state.workoutLogs, newLog];
        } else {
          newLogs = [...state.workoutLogs];
          const log = { ...newLogs[logIndex] };
          const currentOverrides = { ...(log.exerciseOverrides || {}) };
          currentOverrides[exerciseId] = {
            ...(currentOverrides[exerciseId] || {}),
            ...updates,
          };
          log.exerciseOverrides = currentOverrides;
          newLogs[logIndex] = log;
        }

        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map((program) =>
              program.id === state.activeProgramId ? { ...program, workoutLogs: newLogs } : program
            ),
          };
        }

        return { workoutLogs: newLogs };
      }),

      // Get added exercises for a workout
      getAddedExercises: (workoutId) => {
        const log = get().workoutLogs.find(l => l.workoutId === workoutId);
        return log?.addedExercises || [];
      },

      // Reorder exercises - syncs with active program
      reorderExercises: (workoutId, exerciseOrder) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        
        let newLogs: WorkoutLog[];
        if (logIndex < 0) {
          // Create new log with order
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            exerciseOrder,
          };
          newLogs = [...state.workoutLogs, newLog];
        } else {
          // Update existing log
          newLogs = [...state.workoutLogs];
          const log = { ...newLogs[logIndex] };
          log.exerciseOrder = exerciseOrder;
          newLogs[logIndex] = log;
        }
        
        // Sync with active program
        if (state.activeProgramId) {
          return {
            workoutLogs: newLogs,
            programs: state.programs.map(p => 
              p.id === state.activeProgramId ? { ...p, workoutLogs: newLogs } : p
            ),
          };
        }
        return { workoutLogs: newLogs };
      }),

      // Update settings
      updateSettings: (settings) => set((state) => ({
        userSettings: { ...state.userSettings, ...settings },
      })),

      // Get workout status
      // Only actual training activity triggers in_progress:
      //   - Completed/skipped sets (reps > 0 or set status === 'skipped')
      //   - Deliberately skipped exercises (skippedExercises[])
      // Structural-only changes do NOT trigger in_progress:
      //   - deletedExercises[], exerciseOrder[], exerciseOverrides, addedExercises[]
      getWorkoutStatus: (workoutId) => {
        const log = get().workoutLogs.find((l) => l.workoutId === workoutId);
        if (!log) return 'not_started';
        if (log.completed) return 'completed';

        const hasCompletedSet = log.exercises.some((exerciseLog) =>
          exerciseLog.sets.some((set) => set.reps > 0 || set.status === 'skipped')
        );
        const hasSkippedExercise = Boolean(log.skippedExercises && log.skippedExercises.length > 0);

        if (!hasCompletedSet && !hasSkippedExercise) {
          return 'not_started';
        }

        return 'in_progress';
      },

      // Clear all data (for testing/reset)
      clearAllData: () => set({
        programs: [],
        activeProgramId: null,
        lastTrainedProgramId: null,
        currentWeek: 1,
        workoutLogs: [],
        exerciseSubstitutions: {},
        userSettings: defaultSettings,
      }),
    }),
    {
      name: 'block-log-storage',
    }
  )
);
