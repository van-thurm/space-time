// block log - type definitions

export type ExerciseCategory = 
  | 'warmup' 
  | 'power' 
  | 'main_lift' 
  | 'accessory' 
  | 'isolation' 
  | 'finisher';

export type WorkoutDay = 1 | 2 | 3 | 4;

export interface Exercise {
  id: string;                    // e.g., "w1d1-main"
  name: string;
  category: ExerciseCategory;
  sets: number;
  reps: string;                  // "8" or "8-10" or "AMRAP"
  targetRPE: string;             // "7" or "7-8"
  restSeconds: number;
  muscleGroup: string[];
  equipment: string[];
  movement: string;
  notes?: string;
  exerciseDbId?: string;
  progressionRule?: string;
}

export interface Workout {
  id: string;                    // e.g., "week1-day1"
  week: number;
  day: WorkoutDay;
  dayName: string;
  exercises: Exercise[];
  estimatedDuration: number;     // minutes
}

export interface SetLog {
  weight: number;
  reps: number;
  rpe: number;
  notes?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  completed: boolean;
}

export interface WorkoutLog {
  workoutId: string;             // "week1-day1"
  date: string;                  // ISO date string
  exercises: ExerciseLog[];
  completed: boolean;
  skippedExercises?: string[];   // Exercise IDs that were skipped/removed
  addedExercises?: AddedExercise[];  // Custom exercises added to this workout
  exerciseOrder?: string[];      // Custom order of exercise IDs (if reordered)
}

export interface AddedExercise {
  id: string;                    // Generated unique ID
  name: string;
  sets: number;
  reps: string;
  targetRPE: string;
  restSeconds: number;
  category: ExerciseCategory;
  addedAt: string;               // ISO date string
}

export interface ExerciseSubstitution {
  originalExerciseId: string;
  originalName: string;
  replacementName: string;
  exerciseDbId: string;
  gifUrl: string;
  muscleGroups: string[];
  equipment: string[];
  substitutedAt: string;         // ISO date string
}

export interface UserSettings {
  units: 'lbs' | 'kg';
  showRestTimer: boolean;
  exerciseDbApiKey?: string;
}

// ExerciseDB API types
export interface ExerciseDbExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}
