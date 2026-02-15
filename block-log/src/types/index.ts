// block log - type definitions

export type ExerciseCategory = 
  | 'warmup' 
  | 'power' 
  | 'main_lift' 
  | 'accessory' 
  | 'isolation' 
  | 'finisher';

export type WorkoutDay = 1 | 2 | 3 | 4 | 5;

// Program template - the blueprint for a training program
export type ProgramTemplateId = 
  | '4-day-upper-lower'
  | '4-day-total-body'
  | '3-day-full-body-strength'
  | '3-day-upper-lower-hybrid'
  | '3-day-total-body-texas'
  | '2-day-total-body'
  | '5-day-total-body-circuit'
  | '3-day-survival-mode'
  | '3-day-simple-total-body'
  | '4-day-simple-total-body'
  | 'custom';

export interface ProgramTemplate {
  id: ProgramTemplateId;
  name: string;
  shortName: string;                  // For compact display
  description: string;
  daysPerWeek: number;
  weeksTotal: number;
  equipment: 'full-gym' | 'minimal' | 'custom';
  focus: string;                      // e.g., "strength", "maintenance"
  dayLabels: string[];                // e.g., ["Lower A", "Upper A", "Lower B", "Upper B"]
}

// User's instance of a program
export interface UserProgram {
  id: string;                         // UUID
  templateId: ProgramTemplateId;
  name: string;                       // User's custom name
  createdAt: string;                  // ISO date
  startedAt?: string;                 // When they started week 1
  currentWeek: number;
  workoutLogs: WorkoutLog[];
  exerciseSubstitutions: Record<string, ExerciseSubstitution>;
  isActive: boolean;                  // Currently selected program
  isArchived: boolean;
  customWeeksTotal?: number;          // Override template's weeksTotal
  minWeeksTotal?: number;             // Lower bound for week-removal UI
  customDaysPerWeek?: number;         // Override template day count (custom programs)
  customDayLabels?: string[];         // Override day labels (custom programs)
  workoutDayNameOverrides?: Record<number, string>; // Per-day display name overrides (all templates)
  workoutDayOrder?: number[];         // Dashboard day-card display order (by day number)
}

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
  status?: 'completed' | 'skipped';
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
  exerciseOverrides?: Record<
    string,
    Partial<Pick<Exercise, 'sets' | 'reps' | 'targetRPE'>>
  >;
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
  // Optional API data for consistency
  apiExerciseId?: string;
  muscleGroup?: string;
  equipment?: string;
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
  cascadeWeightToSets: boolean;  // When true, changing first set weight updates all sets
  keepScreenAwake: boolean;      // Prevent screen sleep during workouts/timer when supported
}

// User-created custom templates
export interface UserCustomTemplate {
  id: string;                    // Generated unique ID (user-template-xxx)
  name: string;
  shortName: string;
  description: string;
  daysPerWeek: number;
  weeksTotal: number;
  dayLabels: string[];
  createdAt: string;             // ISO date
  // Stores the workout structure as a simplified format
  workoutDays: CustomWorkoutDay[];
}

export interface CustomWorkoutDay {
  day: number;                   // 1-5
  name: string;                  // e.g., "Upper A"
  exercises: CustomExercise[];
}

export interface CustomExercise {
  name: string;
  category: ExerciseCategory;
  sets: number;
  reps: string;
  targetRPE: string;
  restSeconds: number;
  muscleGroup?: string;
  equipment?: string;
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
