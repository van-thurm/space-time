// 4-Day Total Body - Full body each session with varied intensity
// Great for hypertrophy with high frequency

import type { Exercise, Workout } from '@/types';

const dayAExercises: Exercise[] = [
  { id: '4total-a-1', name: 'barbell back squat', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['quadriceps', 'glutes'], equipment: ['barbell', 'squat rack'], movement: 'squat' },
  { id: '4total-a-2', name: 'barbell bench press', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['chest', 'triceps'], equipment: ['barbell', 'bench'], movement: 'push' },
  { id: '4total-a-3', name: 'barbell row', category: 'accessory', sets: 3, reps: '10', targetRPE: '7', restSeconds: 90, muscleGroup: ['lats', 'biceps'], equipment: ['barbell'], movement: 'pull' },
  { id: '4total-a-4', name: 'leg curl', category: 'isolation', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['hamstrings'], equipment: ['machine'], movement: 'isolation' },
];

const dayBExercises: Exercise[] = [
  { id: '4total-b-1', name: 'romanian deadlift', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['hamstrings', 'glutes'], equipment: ['barbell'], movement: 'hinge' },
  { id: '4total-b-2', name: 'overhead press', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['shoulders', 'triceps'], equipment: ['barbell'], movement: 'push' },
  { id: '4total-b-3', name: 'lat pulldown', category: 'accessory', sets: 3, reps: '10', targetRPE: '7', restSeconds: 90, muscleGroup: ['lats'], equipment: ['cable'], movement: 'pull' },
  { id: '4total-b-4', name: 'leg extension', category: 'isolation', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['quadriceps'], equipment: ['machine'], movement: 'isolation' },
];

const dayCExercises: Exercise[] = [
  { id: '4total-c-1', name: 'front squat', category: 'main_lift', sets: 4, reps: '6', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['quadriceps', 'core'], equipment: ['barbell', 'squat rack'], movement: 'squat' },
  { id: '4total-c-2', name: 'incline dumbbell press', category: 'main_lift', sets: 4, reps: '10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['chest', 'shoulders'], equipment: ['dumbbell', 'bench'], movement: 'push' },
  { id: '4total-c-3', name: 'cable row', category: 'accessory', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['lats', 'biceps'], equipment: ['cable'], movement: 'pull' },
  { id: '4total-c-4', name: 'hip thrust', category: 'accessory', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['glutes'], equipment: ['barbell', 'bench'], movement: 'hinge' },
];

const dayDExercises: Exercise[] = [
  { id: '4total-d-1', name: 'trap bar deadlift', category: 'main_lift', sets: 4, reps: '6', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['hamstrings', 'glutes', 'back'], equipment: ['trap bar'], movement: 'hinge' },
  { id: '4total-d-2', name: 'dumbbell shoulder press', category: 'main_lift', sets: 3, reps: '10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['shoulders'], equipment: ['dumbbell'], movement: 'push' },
  { id: '4total-d-3', name: 'chin-ups', category: 'accessory', sets: 3, reps: '8', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['lats', 'biceps'], equipment: ['pull-up bar'], movement: 'pull' },
  { id: '4total-d-4', name: 'walking lunges', category: 'accessory', sets: 3, reps: '10/leg', targetRPE: '7', restSeconds: 60, muscleGroup: ['quadriceps', 'glutes'], equipment: ['dumbbell'], movement: 'squat' },
];

function generateWorkout(week: number, day: 1 | 2 | 3 | 4): Workout {
  const dayNames = { 1: 'full body a', 2: 'full body b', 3: 'full body c', 4: 'full body d' };
  const baseExercises = { 1: dayAExercises, 2: dayBExercises, 3: dayCExercises, 4: dayDExercises };

  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: dayNames[day],
    exercises: baseExercises[day].map(ex => ({ ...ex, id: `w${week}d${day}-${ex.id}` })),
    estimatedDuration: 50,
  };
}

export function getWorkouts(week: number): Workout[] {
  return [1, 2, 3, 4].map(d => generateWorkout(week, d as 1 | 2 | 3 | 4));
}
