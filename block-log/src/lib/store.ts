import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  WorkoutLog, 
  ExerciseSubstitution, 
  UserSettings,
  ExerciseLog,
  SetLog,
  AddedExercise
} from '@/types';

interface AppState {
  // State
  currentWeek: number;
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  userSettings: UserSettings;

  // Actions
  setCurrentWeek: (week: number) => void;
  
  // Workout logging
  logWorkout: (log: WorkoutLog) => void;
  updateWorkoutLog: (workoutId: string, updates: Partial<WorkoutLog>) => void;
  getWorkoutLog: (workoutId: string) => WorkoutLog | undefined;
  getLastWorkoutLog: (week: number, day: number) => WorkoutLog | undefined;
  
  // Exercise logging within a workout
  logExerciseSet: (
    workoutId: string, 
    exerciseId: string, 
    setIndex: number, 
    setData: SetLog
  ) => void;
  
  // Exercise substitution
  substituteExercise: (exerciseId: string, substitution: ExerciseSubstitution) => void;
  getSubstitution: (exerciseId: string) => ExerciseSubstitution | undefined;
  revertSubstitution: (exerciseId: string) => void;
  
  // Exercise skip/add/reorder
  skipExercise: (workoutId: string, exerciseId: string) => void;
  unskipExercise: (workoutId: string, exerciseId: string) => void;
  isExerciseSkipped: (workoutId: string, exerciseId: string) => boolean;
  addExerciseToWorkout: (workoutId: string, exercise: AddedExercise) => void;
  removeAddedExercise: (workoutId: string, exerciseId: string) => void;
  getAddedExercises: (workoutId: string) => AddedExercise[];
  reorderExercises: (workoutId: string, exerciseOrder: string[]) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Utility
  getWorkoutStatus: (workoutId: string) => 'not_started' | 'in_progress' | 'completed';
  clearAllData: () => void;
}

const defaultSettings: UserSettings = {
  units: 'lbs',
  showRestTimer: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWeek: 1,
      workoutLogs: [],
      exerciseSubstitutions: {},
      userSettings: defaultSettings,

      // Set current week
      setCurrentWeek: (week) => set({ currentWeek: week }),

      // Log a complete workout
      logWorkout: (log) => set((state) => {
        const existingIndex = state.workoutLogs.findIndex(
          (l) => l.workoutId === log.workoutId
        );
        
        if (existingIndex >= 0) {
          const newLogs = [...state.workoutLogs];
          newLogs[existingIndex] = log;
          return { workoutLogs: newLogs };
        }
        
        return { workoutLogs: [...state.workoutLogs, log] };
      }),

      // Update an existing workout log
      updateWorkoutLog: (workoutId, updates) => set((state) => {
        const newLogs = state.workoutLogs.map((log) =>
          log.workoutId === workoutId ? { ...log, ...updates } : log
        );
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

      // Log a single set within a workout
      logExerciseSet: (workoutId, exerciseId, setIndex, setData) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(
          (l) => l.workoutId === workoutId
        );

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
          
          // Ensure the sets array is large enough
          while (newLog.exercises[0].sets.length <= setIndex) {
            newLog.exercises[0].sets.push({ weight: 0, reps: 0, rpe: 0 });
          }
          newLog.exercises[0].sets[setIndex] = setData;
          
          return { workoutLogs: [...state.workoutLogs, newLog] };
        }

        // Update existing log
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.exercises = [...log.exercises];

        const exerciseIndex = log.exercises.findIndex(
          (e) => e.exerciseId === exerciseId
        );

        if (exerciseIndex < 0) {
          // Add new exercise log
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
          // Update existing exercise log
          log.exercises[exerciseIndex] = { ...log.exercises[exerciseIndex] };
          const exerciseLog = log.exercises[exerciseIndex];
          exerciseLog.sets = [...exerciseLog.sets];
          
          while (exerciseLog.sets.length <= setIndex) {
            exerciseLog.sets.push({ weight: 0, reps: 0, rpe: 0 });
          }
          exerciseLog.sets[setIndex] = setData;
        }

        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Substitute an exercise
      substituteExercise: (exerciseId, substitution) => set((state) => ({
        exerciseSubstitutions: {
          ...state.exerciseSubstitutions,
          [exerciseId]: substitution,
        },
      })),

      // Get substitution for an exercise
      getSubstitution: (exerciseId) => {
        return get().exerciseSubstitutions[exerciseId];
      },

      // Revert a substitution
      revertSubstitution: (exerciseId) => set((state) => {
        const newSubstitutions = { ...state.exerciseSubstitutions };
        delete newSubstitutions[exerciseId];
        return { exerciseSubstitutions: newSubstitutions };
      }),

      // Skip an exercise (remove from workout)
      skipExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        
        if (logIndex < 0) {
          // Create new log with skipped exercise
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            skippedExercises: [exerciseId],
          };
          return { workoutLogs: [...state.workoutLogs, newLog] };
        }
        
        // Update existing log
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        const skipped = log.skippedExercises || [];
        if (!skipped.includes(exerciseId)) {
          log.skippedExercises = [...skipped, exerciseId];
        }
        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Unskip an exercise (restore to workout)
      unskipExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        if (logIndex < 0) return state;
        
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.skippedExercises = (log.skippedExercises || []).filter(id => id !== exerciseId);
        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Check if exercise is skipped
      isExerciseSkipped: (workoutId, exerciseId) => {
        const log = get().workoutLogs.find(l => l.workoutId === workoutId);
        return log?.skippedExercises?.includes(exerciseId) || false;
      },

      // Add a custom exercise to workout
      addExerciseToWorkout: (workoutId, exercise) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        
        if (logIndex < 0) {
          // Create new log with added exercise
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            addedExercises: [exercise],
          };
          return { workoutLogs: [...state.workoutLogs, newLog] };
        }
        
        // Update existing log
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.addedExercises = [...(log.addedExercises || []), exercise];
        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Remove an added exercise
      removeAddedExercise: (workoutId, exerciseId) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        if (logIndex < 0) return state;
        
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.addedExercises = (log.addedExercises || []).filter(e => e.id !== exerciseId);
        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Get added exercises for a workout
      getAddedExercises: (workoutId) => {
        const log = get().workoutLogs.find(l => l.workoutId === workoutId);
        return log?.addedExercises || [];
      },

      // Reorder exercises
      reorderExercises: (workoutId, exerciseOrder) => set((state) => {
        const logIndex = state.workoutLogs.findIndex(l => l.workoutId === workoutId);
        
        if (logIndex < 0) {
          // Create new log with order
          const newLog: WorkoutLog = {
            workoutId,
            date: new Date().toISOString(),
            exercises: [],
            completed: false,
            exerciseOrder,
          };
          return { workoutLogs: [...state.workoutLogs, newLog] };
        }
        
        // Update existing log
        const newLogs = [...state.workoutLogs];
        const log = { ...newLogs[logIndex] };
        log.exerciseOrder = exerciseOrder;
        newLogs[logIndex] = log;
        return { workoutLogs: newLogs };
      }),

      // Update settings
      updateSettings: (settings) => set((state) => ({
        userSettings: { ...state.userSettings, ...settings },
      })),

      // Get workout status
      getWorkoutStatus: (workoutId) => {
        const log = get().workoutLogs.find((l) => l.workoutId === workoutId);
        if (!log) return 'not_started';
        if (log.completed) return 'completed';
        return 'in_progress';
      },

      // Clear all data (for testing/reset)
      clearAllData: () => set({
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
