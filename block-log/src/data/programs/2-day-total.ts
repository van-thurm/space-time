// 2-Day Total Body - Minimum effective dose
// Full body 2x per week for maintenance or busy schedules

import type { Exercise, Workout } from '@/types';

// Day A: Push emphasis full body
const dayAExercises: Exercise[] = [
  {
    id: '2day-a-squat',
    name: 'goblet squat',
    category: 'main_lift',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'kettlebell'],
    movement: 'squat',
  },
  {
    id: '2day-a-push',
    name: 'dumbbell bench press',
    category: 'main_lift',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['chest', 'triceps'],
    equipment: ['dumbbell', 'bench'],
    movement: 'push',
  },
  {
    id: '2day-a-hinge',
    name: 'romanian deadlift',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['hamstrings', 'glutes'],
    equipment: ['dumbbell', 'barbell'],
    movement: 'hinge',
  },
  {
    id: '2day-a-pull',
    name: 'cable row',
    category: 'accessory',
    sets: 3,
    reps: '12',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['cable machine'],
    movement: 'pull',
  },
  {
    id: '2day-a-core',
    name: 'plank',
    category: 'isolation',
    sets: 2,
    reps: '30-45s',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
];

// Day B: Pull emphasis full body
const dayBExercises: Exercise[] = [
  {
    id: '2day-b-hinge',
    name: 'trap bar deadlift',
    category: 'main_lift',
    sets: 3,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 120,
    muscleGroup: ['hamstrings', 'glutes', 'back'],
    equipment: ['trap bar'],
    movement: 'hinge',
    notes: 'or conventional deadlift',
  },
  {
    id: '2day-b-pull',
    name: 'lat pulldown',
    category: 'main_lift',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['cable machine'],
    movement: 'pull',
  },
  {
    id: '2day-b-lunge',
    name: 'walking lunges',
    category: 'accessory',
    sets: 3,
    reps: '10/leg',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'body weight'],
    movement: 'squat',
  },
  {
    id: '2day-b-push',
    name: 'overhead press',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['dumbbell', 'barbell'],
    movement: 'push',
  },
  {
    id: '2day-b-core',
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

function generateWorkout(week: number, day: 1 | 2): Workout {
  const dayNames = { 1: 'full body a', 2: 'full body b' };
  const baseExercises = { 1: dayAExercises, 2: dayBExercises };

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
    estimatedDuration: 40,
  };
}

export function getWorkouts(week: number): Workout[] {
  return [generateWorkout(week, 1), generateWorkout(week, 2)];
}
