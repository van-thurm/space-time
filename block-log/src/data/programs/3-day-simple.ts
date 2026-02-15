// 3-Day Simple Total Body - Minimal equipment (DBs, bands, bodyweight)
// No gym required, home workout friendly

import type { Exercise, Workout } from '@/types';

const dayAExercises: Exercise[] = [
  {
    id: 'simple3-a-squat',
    name: 'goblet squat',
    category: 'main_lift',
    sets: 3,
    reps: '12',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell'],
    movement: 'squat',
  },
  {
    id: 'simple3-a-push',
    name: 'push-ups',
    category: 'main_lift',
    sets: 3,
    reps: '10-15',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['chest', 'triceps'],
    equipment: ['body weight'],
    movement: 'push',
    notes: 'elevate hands to make easier, feet to make harder',
  },
  {
    id: 'simple3-a-row',
    name: 'dumbbell row',
    category: 'accessory',
    sets: 3,
    reps: '10/arm',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['dumbbell'],
    movement: 'pull',
  },
  {
    id: 'simple3-a-hinge',
    name: 'dumbbell romanian deadlift',
    category: 'accessory',
    sets: 3,
    reps: '12',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['hamstrings', 'glutes'],
    equipment: ['dumbbell'],
    movement: 'hinge',
  },
  {
    id: 'simple3-a-core',
    name: 'dead bug',
    category: 'isolation',
    sets: 2,
    reps: '10/side',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
];

const dayBExercises: Exercise[] = [
  {
    id: 'simple3-b-lunge',
    name: 'reverse lunges',
    category: 'main_lift',
    sets: 3,
    reps: '10/leg',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'body weight'],
    movement: 'squat',
  },
  {
    id: 'simple3-b-press',
    name: 'dumbbell overhead press',
    category: 'main_lift',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['dumbbell'],
    movement: 'push',
  },
  {
    id: 'simple3-b-pull',
    name: 'band pull-aparts',
    category: 'accessory',
    sets: 3,
    reps: '15',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['rear delts', 'upper back'],
    equipment: ['band'],
    movement: 'pull',
  },
  {
    id: 'simple3-b-bridge',
    name: 'glute bridge',
    category: 'accessory',
    sets: 3,
    reps: '15',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['glutes'],
    equipment: ['body weight'],
    movement: 'hinge',
  },
  {
    id: 'simple3-b-plank',
    name: 'plank',
    category: 'isolation',
    sets: 2,
    reps: '30-45s',
    targetRPE: '7',
    restSeconds: 30,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
];

const dayCExercises: Exercise[] = [
  {
    id: 'simple3-c-squat',
    name: 'sumo squat',
    category: 'main_lift',
    sets: 3,
    reps: '12',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes', 'adductors'],
    equipment: ['dumbbell'],
    movement: 'squat',
  },
  {
    id: 'simple3-c-push',
    name: 'pike push-ups',
    category: 'main_lift',
    sets: 3,
    reps: '8-10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['body weight'],
    movement: 'push',
  },
  {
    id: 'simple3-c-row',
    name: 'band rows',
    category: 'accessory',
    sets: 3,
    reps: '15',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['band'],
    movement: 'pull',
  },
  {
    id: 'simple3-c-step',
    name: 'step-ups',
    category: 'accessory',
    sets: 3,
    reps: '10/leg',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'step'],
    movement: 'squat',
  },
  {
    id: 'simple3-c-side',
    name: 'side plank',
    category: 'isolation',
    sets: 2,
    reps: '20-30s/side',
    targetRPE: '7',
    restSeconds: 30,
    muscleGroup: ['obliques'],
    equipment: ['body weight'],
    movement: 'stability',
  },
];

function generateWorkout(week: number, day: 1 | 2 | 3): Workout {
  const dayNames = { 1: 'full body a', 2: 'full body b', 3: 'full body c' };
  const baseExercises = { 1: dayAExercises, 2: dayBExercises, 3: dayCExercises };

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
    estimatedDuration: 35,
  };
}

export function getWorkouts(week: number): Workout[] {
  return [generateWorkout(week, 1), generateWorkout(week, 2), generateWorkout(week, 3)];
}
