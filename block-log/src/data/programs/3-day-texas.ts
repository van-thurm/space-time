// 3-Day Total Body (Texas Method) - Volume, Recovery, Intensity
// Classic strength program proven for building strength

import type { Exercise, Workout } from '@/types';

// Day 1: Volume (5x5 at moderate weight)
const volumeDayExercises: Exercise[] = [
  {
    id: 'texas-vol-squat',
    name: 'barbell back squat',
    category: 'main_lift',
    sets: 5,
    reps: '5',
    targetRPE: '7-8',
    restSeconds: 180,
    muscleGroup: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
    notes: 'Use ~80-85% of 5RM. Focus on volume accumulation.',
  },
  {
    id: 'texas-vol-bench',
    name: 'barbell bench press',
    category: 'main_lift',
    sets: 5,
    reps: '5',
    targetRPE: '7-8',
    restSeconds: 180,
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    movement: 'push',
  },
  {
    id: 'texas-vol-row',
    name: 'barbell row',
    category: 'accessory',
    sets: 5,
    reps: '5',
    targetRPE: '7-8',
    restSeconds: 120,
    muscleGroup: ['lats', 'biceps', 'upper back'],
    equipment: ['barbell'],
    movement: 'pull',
  },
];

// Day 2: Recovery (light work, technique focus)
const recoveryDayExercises: Exercise[] = [
  {
    id: 'texas-rec-squat',
    name: 'front squat',
    category: 'main_lift',
    sets: 3,
    reps: '5',
    targetRPE: '6',
    restSeconds: 120,
    muscleGroup: ['quadriceps', 'core'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
    notes: 'Light weight. Focus on position and speed.',
  },
  {
    id: 'texas-rec-press',
    name: 'overhead press',
    category: 'main_lift',
    sets: 3,
    reps: '5',
    targetRPE: '6',
    restSeconds: 120,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    movement: 'push',
  },
  {
    id: 'texas-rec-chin',
    name: 'chin-ups',
    category: 'accessory',
    sets: 3,
    reps: '8-10',
    targetRPE: '6-7',
    restSeconds: 90,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['pull-up bar'],
    movement: 'pull',
  },
  {
    id: 'texas-rec-ext',
    name: 'back extensions',
    category: 'isolation',
    sets: 3,
    reps: '10',
    targetRPE: '6',
    restSeconds: 60,
    muscleGroup: ['lower back', 'glutes'],
    equipment: ['back extension bench'],
    movement: 'hinge',
  },
];

// Day 3: Intensity (work up to heavy singles/doubles/triples)
const intensityDayExercises: Exercise[] = [
  {
    id: 'texas-int-squat',
    name: 'barbell back squat',
    category: 'main_lift',
    sets: 1,
    reps: '5',
    targetRPE: '9-10',
    restSeconds: 300,
    muscleGroup: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
    notes: 'PR attempt. Beat last week\'s 5RM.',
    progressionRule: 'add 5lbs each week',
  },
  {
    id: 'texas-int-bench',
    name: 'barbell bench press',
    category: 'main_lift',
    sets: 1,
    reps: '5',
    targetRPE: '9-10',
    restSeconds: 300,
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    movement: 'push',
    notes: 'PR attempt.',
    progressionRule: 'add 2.5-5lbs each week',
  },
  {
    id: 'texas-int-dead',
    name: 'barbell deadlift',
    category: 'main_lift',
    sets: 1,
    reps: '5',
    targetRPE: '9-10',
    restSeconds: 300,
    muscleGroup: ['hamstrings', 'glutes', 'back'],
    equipment: ['barbell'],
    movement: 'hinge',
    notes: 'PR attempt.',
    progressionRule: 'add 5-10lbs each week',
  },
];

function generateWorkout(week: number, day: 1 | 2 | 3): Workout {
  const dayNames = { 1: 'volume', 2: 'recovery', 3: 'intensity' };
  const baseExercises = {
    1: volumeDayExercises,
    2: recoveryDayExercises,
    3: intensityDayExercises,
  };
  const durations = { 1: 60, 2: 45, 3: 50 };

  const exercises = baseExercises[day].map(ex => ({
    ...ex,
    id: `w${week}d${day}-${ex.id}`,
  }));

  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: dayNames[day],
    exercises,
    estimatedDuration: durations[day],
  };
}

export function getWorkouts(week: number): Workout[] {
  return [generateWorkout(week, 1), generateWorkout(week, 2), generateWorkout(week, 3)];
}
