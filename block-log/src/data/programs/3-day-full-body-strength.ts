// 3-Day Full Body Strength (Intermediate)
// Popular structure: heavy / volume / power emphasis across the week.

import type { Exercise, Workout } from '@/types';

const day1Heavy: Exercise[] = [
  {
    id: 'fb-heavy-squat',
    name: 'barbell back squat',
    category: 'main_lift',
    sets: 4,
    reps: '5',
    targetRPE: '7-8',
    restSeconds: 180,
    muscleGroup: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
  },
  {
    id: 'fb-heavy-bench',
    name: 'barbell bench press',
    category: 'main_lift',
    sets: 4,
    reps: '5',
    targetRPE: '7-8',
    restSeconds: 180,
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    movement: 'push',
  },
  {
    id: 'fb-heavy-row',
    name: 'barbell row',
    category: 'accessory',
    sets: 3,
    reps: '6-8',
    targetRPE: '8',
    restSeconds: 120,
    muscleGroup: ['lats', 'upper back', 'biceps'],
    equipment: ['barbell'],
    movement: 'pull',
  },
];

const day2Volume: Exercise[] = [
  {
    id: 'fb-vol-dead',
    name: 'barbell deadlift',
    category: 'main_lift',
    sets: 3,
    reps: '4-6',
    targetRPE: '7-8',
    restSeconds: 180,
    muscleGroup: ['hamstrings', 'glutes', 'back'],
    equipment: ['barbell'],
    movement: 'hinge',
  },
  {
    id: 'fb-vol-press',
    name: 'overhead press',
    category: 'main_lift',
    sets: 4,
    reps: '6',
    targetRPE: '7-8',
    restSeconds: 150,
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    movement: 'push',
  },
  {
    id: 'fb-vol-chin',
    name: 'chin-ups',
    category: 'accessory',
    sets: 4,
    reps: '6-10',
    targetRPE: '8',
    restSeconds: 120,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['pull-up bar'],
    movement: 'pull',
  },
];

const day3Power: Exercise[] = [
  {
    id: 'fb-pwr-front',
    name: 'front squat',
    category: 'main_lift',
    sets: 5,
    reps: '3',
    targetRPE: '7',
    restSeconds: 150,
    muscleGroup: ['quadriceps', 'core'],
    equipment: ['barbell', 'squat rack'],
    movement: 'squat',
  },
  {
    id: 'fb-pwr-incline',
    name: 'incline bench press',
    category: 'main_lift',
    sets: 4,
    reps: '6',
    targetRPE: '7-8',
    restSeconds: 120,
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    movement: 'push',
  },
  {
    id: 'fb-pwr-rdl',
    name: 'romanian deadlift',
    category: 'accessory',
    sets: 3,
    reps: '8',
    targetRPE: '8',
    restSeconds: 120,
    muscleGroup: ['hamstrings', 'glutes'],
    equipment: ['barbell'],
    movement: 'hinge',
  },
];

function buildWorkout(week: number, day: 1 | 2 | 3): Workout {
  const byDay = {
    1: { name: 'full body a', exercises: day1Heavy, duration: 55 },
    2: { name: 'full body b', exercises: day2Volume, duration: 55 },
    3: { name: 'full body c', exercises: day3Power, duration: 50 },
  } as const;

  const selected = byDay[day];
  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: selected.name,
    estimatedDuration: selected.duration,
    exercises: selected.exercises.map((exercise) => ({
      ...exercise,
      id: `w${week}d${day}-${exercise.id}`,
    })),
  };
}

export function getWorkouts(week: number): Workout[] {
  return [buildWorkout(week, 1), buildWorkout(week, 2), buildWorkout(week, 3)];
}
