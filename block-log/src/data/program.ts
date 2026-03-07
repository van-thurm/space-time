import type { Exercise, Workout, WorkoutDay } from '@/types';

// Warmup exercises - same for all workouts
export const warmupExercises: Exercise[] = [
  {
    id: 'warmup-1',
    name: 'hooklying breathing',
    category: 'warmup',
    sets: 1,
    reps: '6 breaths',
    targetRPE: '3',
    restSeconds: 0,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'breathing',
    notes: 'inhale 4s, exhale 4s. 360° midsection expansion.',
  },
  {
    id: 'warmup-2',
    name: '90/90 hip switch',
    category: 'warmup',
    sets: 1,
    reps: '8/side',
    targetRPE: '4',
    restSeconds: 0,
    muscleGroup: ['glutes', 'hip flexors'],
    equipment: ['body weight'],
    movement: 'mobility',
    notes: 'opens hips and addresses rotation.',
  },
  {
    id: 'warmup-3',
    name: 'quadruped heel sit t-spine rotation',
    category: 'warmup',
    sets: 1,
    reps: '8/side',
    targetRPE: '4',
    restSeconds: 0,
    muscleGroup: ['upper back'],
    equipment: ['body weight'],
    movement: 'mobility',
    notes: 'improves upper back rotation and shoulder mobility.',
  },
  {
    id: 'warmup-4',
    name: 'spiderman lunge with rotation',
    category: 'warmup',
    sets: 1,
    reps: '4/side',
    targetRPE: '5',
    restSeconds: 0,
    muscleGroup: ['hip flexors', 'glutes', 'upper back'],
    equipment: ['body weight'],
    movement: 'mobility',
    notes: 'integrates hips, spine, shoulders.',
  },
  {
    id: 'warmup-5',
    name: 'band pull-aparts',
    category: 'warmup',
    sets: 1,
    reps: '15',
    targetRPE: '5',
    restSeconds: 0,
    muscleGroup: ['shoulders', 'upper back'],
    equipment: ['band'],
    movement: 'pull',
    notes: 'shoulder activation and posture prep.',
  },
  {
    id: 'warmup-6',
    name: 'glute bridges',
    category: 'warmup',
    sets: 1,
    reps: '10',
    targetRPE: '5',
    restSeconds: 0,
    muscleGroup: ['glutes'],
    equipment: ['body weight'],
    movement: 'hinge',
    notes: 'glute activation before lower body work.',
  },
];

// Base exercise templates for each day
const lowerBodyDay1Exercises: Exercise[] = [
  {
    id: 'power',
    name: 'box jumps',
    category: 'power',
    sets: 3,
    reps: '5',
    targetRPE: '6-7',
    restSeconds: 30,
    muscleGroup: ['quadriceps', 'glutes', 'calves'],
    equipment: ['box', 'body weight'],
    movement: 'jump',
    progressionRule: 'maintain',
    notes: 'or squat jumps if no box available.',
  },
  {
    id: 'main',
    name: 'barbell back squat',
    category: 'main_lift',
    sets: 4,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
    exerciseDbId: '0651',
    progressionRule: 'add_5_10_lbs',
    notes: 'high bar or low bar. superset with B2.',
  },
  {
    id: 'b2',
    name: 'copenhagen plank (short lever)',
    category: 'isolation',
    sets: 3,
    reps: '15-30s',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['adductors', 'core'],
    equipment: ['bench', 'body weight'],
    movement: 'isometric',
    progressionRule: 'add_5s',
    notes: 'adductor prehab. superset with B1.',
  },
  {
    id: 'c1',
    name: 'rear foot elevated split squat',
    category: 'accessory',
    sets: 3,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'bench'],
    movement: 'lunge',
    exerciseDbId: '0406',
    progressionRule: 'add_5_lbs_or_1_rep',
  },
  {
    id: 'c2',
    name: 'barbell hip thrust',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '8',
    restSeconds: 60,
    muscleGroup: ['glutes', 'hamstrings'],
    equipment: ['barbell', 'bench'],
    movement: 'hinge',
    exerciseDbId: '3640',
    progressionRule: 'add_10_lbs',
  },
  {
    id: 'd1',
    name: 'stability ball hamstring curl',
    category: 'isolation',
    sets: 3,
    reps: '10-12',
    targetRPE: '8-9',
    restSeconds: 60,
    muscleGroup: ['hamstrings'],
    equipment: ['stability ball'],
    movement: 'curl',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'd2',
    name: 'dead bug',
    category: 'isolation',
    sets: 3,
    reps: '8-10',
    targetRPE: '8-9',
    restSeconds: 60,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'core_flexion',
    progressionRule: 'add_1_rep',
    notes: 'core flexion pattern.',
  },
  {
    id: 'finisher',
    name: 'farmer carry + tall plank drag',
    category: 'finisher',
    sets: 4,
    reps: '30s each',
    targetRPE: 'optional',
    restSeconds: 30,
    muscleGroup: ['core', 'forearms', 'shoulders'],
    equipment: ['kettlebell', 'dumbbell'],
    movement: 'carry',
    notes: 'optional - skip if time constrained.',
  },
];

const upperBodyDay2Exercises: Exercise[] = [
  {
    id: 'power',
    name: 'medicine ball chest pass',
    category: 'power',
    sets: 3,
    reps: '6',
    targetRPE: '6-7',
    restSeconds: 30,
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['medicine ball'],
    movement: 'push',
    progressionRule: 'maintain',
    notes: 'explosive push. partner or wall.',
  },
  {
    id: 'main',
    name: 'barbell bench press',
    category: 'main_lift',
    sets: 4,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    movement: 'push',
    exerciseDbId: '0025',
    progressionRule: 'add_5_10_lbs',
  },
  {
    id: 'b2',
    name: 'face pulls',
    category: 'accessory',
    sets: 3,
    reps: '15',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['shoulders', 'upper back'],
    equipment: ['cable'],
    movement: 'pull',
    progressionRule: 'add_1_rep',
    notes: 'rear delt and rotator cuff health.',
  },
  {
    id: 'c1',
    name: 'dumbbell row',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['back', 'biceps'],
    equipment: ['dumbbell', 'bench'],
    movement: 'pull',
    exerciseDbId: '0292',
    progressionRule: 'add_5_lbs',
  },
  {
    id: 'c2',
    name: 'incline dumbbell press',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['chest', 'shoulders'],
    equipment: ['dumbbell', 'bench'],
    movement: 'push',
    exerciseDbId: '0189',
    progressionRule: 'add_5_lbs',
  },
  {
    id: 'd1',
    name: 'cable tricep pushdown',
    category: 'isolation',
    sets: 3,
    reps: '12-15',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['triceps'],
    equipment: ['cable'],
    movement: 'push',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'd2',
    name: 'dumbbell bicep curl',
    category: 'isolation',
    sets: 3,
    reps: '12-15',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['biceps'],
    equipment: ['dumbbell'],
    movement: 'curl',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'finisher',
    name: 'plate overhead carry',
    category: 'finisher',
    sets: 3,
    reps: '40s',
    targetRPE: 'optional',
    restSeconds: 30,
    muscleGroup: ['shoulders', 'core'],
    equipment: ['weight plate'],
    movement: 'carry',
    notes: 'optional - skip if time constrained.',
  },
];

const lowerBodyDay3Exercises: Exercise[] = [
  {
    id: 'power',
    name: 'kettlebell swing',
    category: 'power',
    sets: 3,
    reps: '10',
    targetRPE: '6-7',
    restSeconds: 30,
    muscleGroup: ['glutes', 'hamstrings', 'core'],
    equipment: ['kettlebell'],
    movement: 'hinge',
    progressionRule: 'maintain',
  },
  {
    id: 'main',
    name: 'trap bar deadlift',
    category: 'main_lift',
    sets: 4,
    reps: '6',
    targetRPE: '7-8',
    restSeconds: 120,
    muscleGroup: ['glutes', 'hamstrings', 'back', 'quadriceps'],
    equipment: ['trap bar'],
    movement: 'hinge',
    progressionRule: 'add_10_lbs',
    notes: 'or conventional/sumo deadlift.',
  },
  {
    id: 'b2',
    name: 'pallof press',
    category: 'isolation',
    sets: 3,
    reps: '10/side',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['core'],
    equipment: ['cable', 'band'],
    movement: 'anti_rotation',
    progressionRule: 'add_weight',
    notes: 'anti-rotation core work.',
  },
  {
    id: 'c1',
    name: 'walking lunges',
    category: 'accessory',
    sets: 3,
    reps: '10/leg',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell'],
    movement: 'lunge',
    progressionRule: 'add_5_lbs',
  },
  {
    id: 'c2',
    name: 'romanian deadlift',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['hamstrings', 'glutes'],
    equipment: ['barbell', 'dumbbell'],
    movement: 'hinge',
    exerciseDbId: '0085',
    progressionRule: 'add_5_10_lbs',
  },
  {
    id: 'd1',
    name: 'leg curl machine',
    category: 'isolation',
    sets: 3,
    reps: '12',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['hamstrings'],
    equipment: ['machine'],
    movement: 'curl',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'd2',
    name: 'calf raises',
    category: 'isolation',
    sets: 3,
    reps: '15',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['calves'],
    equipment: ['machine', 'body weight'],
    movement: 'raise',
    progressionRule: 'add_1_rep',
  },
];

const upperBodyDay4Exercises: Exercise[] = [
  {
    id: 'power',
    name: 'explosive push-ups',
    category: 'power',
    sets: 3,
    reps: '6',
    targetRPE: '6-7',
    restSeconds: 30,
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['body weight'],
    movement: 'push',
    progressionRule: 'maintain',
    notes: 'clapping optional.',
  },
  {
    id: 'main',
    name: 'overhead press',
    category: 'main_lift',
    sets: 4,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['barbell', 'dumbbell'],
    movement: 'push',
    exerciseDbId: '0431',
    progressionRule: 'add_5_lbs',
  },
  {
    id: 'b2',
    name: 'chin-ups or lat pulldown',
    category: 'main_lift',
    sets: 4,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['back', 'biceps'],
    equipment: ['pull-up bar', 'cable'],
    movement: 'pull',
    progressionRule: 'add_rep_or_weight',
  },
  {
    id: 'c1',
    name: 'cable lateral raise',
    category: 'accessory',
    sets: 3,
    reps: '12',
    targetRPE: '7-8',
    restSeconds: 45,
    muscleGroup: ['shoulders'],
    equipment: ['cable'],
    movement: 'raise',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'c2',
    name: 'seated cable row',
    category: 'accessory',
    sets: 3,
    reps: '12',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['back', 'biceps'],
    equipment: ['cable'],
    movement: 'pull',
    progressionRule: 'add_weight',
  },
  {
    id: 'd1',
    name: 'skull crushers',
    category: 'isolation',
    sets: 3,
    reps: '12',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['triceps'],
    equipment: ['ez bar', 'dumbbell'],
    movement: 'push',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'd2',
    name: 'hammer curls',
    category: 'isolation',
    sets: 3,
    reps: '12',
    targetRPE: '8',
    restSeconds: 45,
    muscleGroup: ['biceps', 'forearms'],
    equipment: ['dumbbell'],
    movement: 'curl',
    progressionRule: 'add_1_rep',
  },
  {
    id: 'finisher',
    name: 'battle ropes',
    category: 'finisher',
    sets: 3,
    reps: '30s',
    targetRPE: 'optional',
    restSeconds: 30,
    muscleGroup: ['shoulders', 'core', 'cardio'],
    equipment: ['battle ropes'],
    movement: 'cardio',
    notes: 'optional - or any preferred finisher.',
  },
];

// Generate workout for a specific week and day
function generateWorkout(week: number, day: WorkoutDay): Workout {
  const dayNames: Record<WorkoutDay, string> = {
    1: 'lower body a',
    2: 'upper body a',
    3: 'lower body b',
    4: 'upper body b',
    5: 'full body circuit',  // For future 5-day programs
  };

  const baseExercises: Record<WorkoutDay, Exercise[]> = {
    1: lowerBodyDay1Exercises,
    2: upperBodyDay2Exercises,
    3: lowerBodyDay3Exercises,
    4: upperBodyDay4Exercises,
    5: lowerBodyDay1Exercises,  // Placeholder for future 5-day programs
  };

  // Clone exercises and add week-specific IDs
  const exercises = baseExercises[day].map((ex) => ({
    ...ex,
    id: `w${week}d${day}-${ex.id}`,
  }));

  // Phase-specific adjustments
  const phase = week <= 4 ? 1 : week <= 8 ? 2 : 3;
  const isDeload = week === 4 || week === 8;

  // Adjust reps/sets based on phase
  const adjustedExercises = exercises.map((ex) => {
    if (isDeload) {
      // Deload weeks: reduce volume
      return {
        ...ex,
        sets: Math.max(ex.sets - 1, 2),
        targetRPE: '5-6',
        notes: ex.notes ? `${ex.notes} [deload week]` : '[deload week]',
      };
    }

    if (phase === 3 && ex.category === 'main_lift') {
      // Peak phase: lower reps, higher intensity for main lifts
      return {
        ...ex,
        reps: ex.reps === '8' ? '5' : ex.reps === '6' ? '4' : ex.reps,
        sets: ex.sets + 1,
        targetRPE: '8-9',
      };
    }

    if (phase === 2 && ex.category === 'main_lift') {
      // Strength phase: moderate adjustment
      return {
        ...ex,
        reps: ex.reps === '8' ? '6' : ex.reps,
        targetRPE: '8',
      };
    }

    return ex;
  });

  const estimatedDurations: Record<WorkoutDay, number> = {
    1: 55,
    2: 50,
    3: 50,
    4: 50,
    5: 45,  // For future 5-day programs
  };

  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: dayNames[day],
    exercises: adjustedExercises,
    estimatedDuration: estimatedDurations[day],
  };
}

// Generate all 12 weeks of workouts
export function generateProgram(): Workout[] {
  const workouts: Workout[] = [];
  
  for (let week = 1; week <= 12; week++) {
    for (let day = 1; day <= 4; day++) {
      workouts.push(generateWorkout(week, day as WorkoutDay));
    }
  }
  
  return workouts;
}

// Get a specific workout
export function getWorkout(week: number, day: WorkoutDay): Workout {
  return generateWorkout(week, day);
}

// Get all workouts for a week
export function getWeekWorkouts(week: number): Workout[] {
  return [1, 2, 3, 4].map((day) => generateWorkout(week, day as WorkoutDay));
}

// Phase info
export const phases = [
  { name: 'foundation', weeks: [1, 2, 3, 4], description: 'build base strength and movement patterns' },
  { name: 'strength', weeks: [5, 6, 7, 8], description: 'progressive overload focus' },
  { name: 'peak', weeks: [9, 10, 11, 12], description: 'peak performance and testing' },
];

export function getCurrentPhase(week: number): typeof phases[number] {
  if (week <= 4) return phases[0];
  if (week <= 8) return phases[1];
  return phases[2];
}

export function isDeloadWeek(week: number): boolean {
  return week === 4 || week === 8;
}
