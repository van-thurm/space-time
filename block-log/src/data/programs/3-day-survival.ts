// 3-Day Survival Mode - 30-35 min workouts for busy times
// Focus: Maintain strength and mobility with minimal time investment

import type { Exercise, Workout } from '@/types';
import { warmupExercises } from '@/data/program';

// Abbreviated warmup for survival mode (3 moves)
const quickWarmup: Exercise[] = [
  warmupExercises[3], // spiderman lunge
  warmupExercises[4], // band pull-aparts
  warmupExercises[5], // glute bridges
];

// Day 1: Strength A - Lower emphasis
const day1Exercises: Exercise[] = [
  {
    id: 'survival-1a-main',
    name: 'goblet squat',
    category: 'main_lift',
    sets: 3,
    reps: '8-10',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['dumbbell', 'kettlebell'],
    movement: 'squat',
    progressionRule: 'add 5lbs when all sets complete at RPE 7',
  },
  {
    id: 'survival-1a-acc1',
    name: 'romanian deadlift',
    category: 'accessory',
    sets: 3,
    reps: '8',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['hamstrings', 'glutes'],
    equipment: ['dumbbell', 'barbell'],
    movement: 'hinge',
  },
  {
    id: 'survival-1a-acc2',
    name: 'push-ups',
    category: 'accessory',
    sets: 3,
    reps: '10-15',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['body weight'],
    movement: 'push',
  },
  {
    id: 'survival-1a-acc3',
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
];

// Day 2: Strength B - Upper emphasis
const day2Exercises: Exercise[] = [
  {
    id: 'survival-2a-main',
    name: 'dumbbell bench press',
    category: 'main_lift',
    sets: 3,
    reps: '8-10',
    targetRPE: '7-8',
    restSeconds: 90,
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbell', 'bench'],
    movement: 'push',
    progressionRule: 'add 5lbs when all sets complete at RPE 7',
  },
  {
    id: 'survival-2a-acc1',
    name: 'lat pulldown',
    category: 'accessory',
    sets: 3,
    reps: '10',
    targetRPE: '7-8',
    restSeconds: 60,
    muscleGroup: ['lats', 'biceps'],
    equipment: ['cable machine'],
    movement: 'pull',
  },
  {
    id: 'survival-2a-acc2',
    name: 'split squat',
    category: 'accessory',
    sets: 2,
    reps: '8/leg',
    targetRPE: '7',
    restSeconds: 60,
    muscleGroup: ['quadriceps', 'glutes'],
    equipment: ['body weight', 'dumbbell'],
    movement: 'squat',
  },
  {
    id: 'survival-2a-acc3',
    name: 'face pulls',
    category: 'accessory',
    sets: 2,
    reps: '15',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['rear delts', 'upper back'],
    equipment: ['cable', 'band'],
    movement: 'pull',
  },
];

// Day 3: Mobility & Core
const day3Exercises: Exercise[] = [
  {
    id: 'survival-3a-mob1',
    name: 'world\'s greatest stretch',
    category: 'isolation',
    sets: 2,
    reps: '5/side',
    targetRPE: '5',
    restSeconds: 30,
    muscleGroup: ['hip flexors', 'hamstrings', 'upper back'],
    equipment: ['body weight'],
    movement: 'mobility',
  },
  {
    id: 'survival-3a-mob2',
    name: 'cat-cow',
    category: 'isolation',
    sets: 2,
    reps: '10',
    targetRPE: '4',
    restSeconds: 30,
    muscleGroup: ['spine'],
    equipment: ['body weight'],
    movement: 'mobility',
  },
  {
    id: 'survival-3a-core1',
    name: 'dead bug',
    category: 'isolation',
    sets: 3,
    reps: '8/side',
    targetRPE: '7',
    restSeconds: 45,
    muscleGroup: ['core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
  {
    id: 'survival-3a-core2',
    name: 'side plank',
    category: 'isolation',
    sets: 2,
    reps: '20-30s/side',
    targetRPE: '7',
    restSeconds: 30,
    muscleGroup: ['obliques', 'core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
  {
    id: 'survival-3a-core3',
    name: 'glute bridge march',
    category: 'isolation',
    sets: 2,
    reps: '10/side',
    targetRPE: '7',
    restSeconds: 30,
    muscleGroup: ['glutes', 'core'],
    equipment: ['body weight'],
    movement: 'stability',
  },
];

function generateWorkout(week: number, day: 1 | 2 | 3): Workout {
  const dayNames = {
    1: 'strength a',
    2: 'strength b',
    3: 'mobility',
  };

  const baseExercises = {
    1: day1Exercises,
    2: day2Exercises,
    3: day3Exercises,
  };

  const durations = {
    1: 30,
    2: 30,
    3: 25,
  };

  // Clone exercises with week-specific IDs
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
  return [
    generateWorkout(week, 1),
    generateWorkout(week, 2),
    generateWorkout(week, 3),
  ];
}
