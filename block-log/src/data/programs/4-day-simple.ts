// 4-Day Simple Total Body - Minimal equipment (DBs, bands, bodyweight)
// 4 days per week, home workout friendly

import type { Exercise, Workout } from '@/types';

const dayAExercises: Exercise[] = [
  { id: 'simple4-a-1', name: 'goblet squat', category: 'main_lift', sets: 4, reps: '10', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['quadriceps', 'glutes'], equipment: ['dumbbell'], movement: 'squat' },
  { id: 'simple4-a-2', name: 'push-ups', category: 'main_lift', sets: 3, reps: '12-15', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['chest', 'triceps'], equipment: ['body weight'], movement: 'push' },
  { id: 'simple4-a-3', name: 'dumbbell row', category: 'accessory', sets: 3, reps: '10/arm', targetRPE: '7', restSeconds: 60, muscleGroup: ['lats', 'biceps'], equipment: ['dumbbell'], movement: 'pull' },
  { id: 'simple4-a-4', name: 'glute bridge', category: 'isolation', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['glutes'], equipment: ['body weight'], movement: 'hinge' },
];

const dayBExercises: Exercise[] = [
  { id: 'simple4-b-1', name: 'dumbbell romanian deadlift', category: 'main_lift', sets: 4, reps: '10', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['hamstrings', 'glutes'], equipment: ['dumbbell'], movement: 'hinge' },
  { id: 'simple4-b-2', name: 'dumbbell overhead press', category: 'main_lift', sets: 3, reps: '10', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['shoulders'], equipment: ['dumbbell'], movement: 'push' },
  { id: 'simple4-b-3', name: 'band pull-aparts', category: 'accessory', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['rear delts'], equipment: ['band'], movement: 'pull' },
  { id: 'simple4-b-4', name: 'dead bug', category: 'isolation', sets: 2, reps: '10/side', targetRPE: '7', restSeconds: 45, muscleGroup: ['core'], equipment: ['body weight'], movement: 'stability' },
];

const dayCExercises: Exercise[] = [
  { id: 'simple4-c-1', name: 'reverse lunges', category: 'main_lift', sets: 3, reps: '10/leg', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['quadriceps', 'glutes'], equipment: ['dumbbell'], movement: 'squat' },
  { id: 'simple4-c-2', name: 'dumbbell floor press', category: 'main_lift', sets: 3, reps: '12', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['chest', 'triceps'], equipment: ['dumbbell'], movement: 'push' },
  { id: 'simple4-c-3', name: 'band rows', category: 'accessory', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['lats'], equipment: ['band'], movement: 'pull' },
  { id: 'simple4-c-4', name: 'plank', category: 'isolation', sets: 2, reps: '30-45s', targetRPE: '7', restSeconds: 30, muscleGroup: ['core'], equipment: ['body weight'], movement: 'stability' },
];

const dayDExercises: Exercise[] = [
  { id: 'simple4-d-1', name: 'sumo squat', category: 'main_lift', sets: 3, reps: '12', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['quadriceps', 'glutes', 'adductors'], equipment: ['dumbbell'], movement: 'squat' },
  { id: 'simple4-d-2', name: 'pike push-ups', category: 'main_lift', sets: 3, reps: '8-10', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['shoulders'], equipment: ['body weight'], movement: 'push' },
  { id: 'simple4-d-3', name: 'single-leg rdl', category: 'accessory', sets: 3, reps: '8/leg', targetRPE: '7', restSeconds: 60, muscleGroup: ['hamstrings', 'glutes'], equipment: ['dumbbell'], movement: 'hinge' },
  { id: 'simple4-d-4', name: 'bird dog', category: 'isolation', sets: 2, reps: '10/side', targetRPE: '6', restSeconds: 30, muscleGroup: ['core'], equipment: ['body weight'], movement: 'stability' },
];

function generateWorkout(week: number, day: 1 | 2 | 3 | 4): Workout {
  const dayNames = { 1: 'full a', 2: 'full b', 3: 'full c', 4: 'full d' };
  const baseExercises = { 1: dayAExercises, 2: dayBExercises, 3: dayCExercises, 4: dayDExercises };

  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: dayNames[day],
    exercises: baseExercises[day].map(ex => ({ ...ex, id: `w${week}d${day}-${ex.id}` })),
    estimatedDuration: 30,
  };
}

export function getWorkouts(week: number): Workout[] {
  return [1, 2, 3, 4].map(d => generateWorkout(week, d as 1 | 2 | 3 | 4));
}
