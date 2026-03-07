// 5-Day Total Body Circuit - High frequency conditioning
// Push, Pull, Legs focus days plus two full circuit days

import type { Exercise, Workout } from '@/types';

const pushDayExercises: Exercise[] = [
  { id: '5circuit-push-1', name: 'barbell bench press', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['chest', 'triceps'], equipment: ['barbell', 'bench'], movement: 'push' },
  { id: '5circuit-push-2', name: 'overhead press', category: 'main_lift', sets: 3, reps: '10', targetRPE: '7', restSeconds: 90, muscleGroup: ['shoulders'], equipment: ['dumbbell'], movement: 'push' },
  { id: '5circuit-push-3', name: 'incline dumbbell press', category: 'accessory', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['chest'], equipment: ['dumbbell', 'bench'], movement: 'push' },
  { id: '5circuit-push-4', name: 'tricep pushdown', category: 'isolation', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['triceps'], equipment: ['cable'], movement: 'push' },
];

const pullDayExercises: Exercise[] = [
  { id: '5circuit-pull-1', name: 'barbell row', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['lats', 'biceps'], equipment: ['barbell'], movement: 'pull' },
  { id: '5circuit-pull-2', name: 'lat pulldown', category: 'main_lift', sets: 3, reps: '10', targetRPE: '7', restSeconds: 90, muscleGroup: ['lats'], equipment: ['cable'], movement: 'pull' },
  { id: '5circuit-pull-3', name: 'face pulls', category: 'accessory', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['rear delts'], equipment: ['cable', 'band'], movement: 'pull' },
  { id: '5circuit-pull-4', name: 'bicep curls', category: 'isolation', sets: 3, reps: '12', targetRPE: '7', restSeconds: 45, muscleGroup: ['biceps'], equipment: ['dumbbell'], movement: 'pull' },
];

const legsDayExercises: Exercise[] = [
  { id: '5circuit-legs-1', name: 'barbell back squat', category: 'main_lift', sets: 4, reps: '8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['quadriceps', 'glutes'], equipment: ['barbell', 'squat rack'], movement: 'squat' },
  { id: '5circuit-legs-2', name: 'romanian deadlift', category: 'main_lift', sets: 3, reps: '10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['hamstrings', 'glutes'], equipment: ['barbell'], movement: 'hinge' },
  { id: '5circuit-legs-3', name: 'leg press', category: 'accessory', sets: 3, reps: '12', targetRPE: '7', restSeconds: 60, muscleGroup: ['quadriceps'], equipment: ['leg press'], movement: 'squat' },
  { id: '5circuit-legs-4', name: 'calf raises', category: 'isolation', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['calves'], equipment: ['machine'], movement: 'isolation' },
];

const circuitAExercises: Exercise[] = [
  { id: '5circuit-a-1', name: 'kettlebell swings', category: 'power', sets: 4, reps: '15', targetRPE: '7', restSeconds: 30, muscleGroup: ['hamstrings', 'glutes'], equipment: ['kettlebell'], movement: 'hinge', notes: 'circuit: 30s rest between exercises' },
  { id: '5circuit-a-2', name: 'push-ups', category: 'accessory', sets: 4, reps: '12', targetRPE: '7', restSeconds: 30, muscleGroup: ['chest', 'triceps'], equipment: ['body weight'], movement: 'push' },
  { id: '5circuit-a-3', name: 'goblet squat', category: 'accessory', sets: 4, reps: '12', targetRPE: '7', restSeconds: 30, muscleGroup: ['quadriceps', 'glutes'], equipment: ['dumbbell', 'kettlebell'], movement: 'squat' },
  { id: '5circuit-a-4', name: 'dumbbell row', category: 'accessory', sets: 4, reps: '10/arm', targetRPE: '7', restSeconds: 60, muscleGroup: ['lats', 'biceps'], equipment: ['dumbbell'], movement: 'pull', notes: '60s rest after completing circuit' },
];

const circuitBExercises: Exercise[] = [
  { id: '5circuit-b-1', name: 'box jumps', category: 'power', sets: 4, reps: '8', targetRPE: '7', restSeconds: 30, muscleGroup: ['quadriceps', 'glutes'], equipment: ['box'], movement: 'jump', notes: 'or squat jumps' },
  { id: '5circuit-b-2', name: 'dumbbell thrusters', category: 'accessory', sets: 4, reps: '10', targetRPE: '7-8', restSeconds: 30, muscleGroup: ['quadriceps', 'shoulders'], equipment: ['dumbbell'], movement: 'combo' },
  { id: '5circuit-b-3', name: 'renegade rows', category: 'accessory', sets: 4, reps: '8/arm', targetRPE: '7', restSeconds: 30, muscleGroup: ['lats', 'core'], equipment: ['dumbbell'], movement: 'pull' },
  { id: '5circuit-b-4', name: 'mountain climbers', category: 'finisher', sets: 4, reps: '20', targetRPE: '8', restSeconds: 60, muscleGroup: ['core', 'hip flexors'], equipment: ['body weight'], movement: 'cardio' },
];

function generateWorkout(week: number, day: 1 | 2 | 3 | 4 | 5): Workout {
  const dayNames = { 1: 'push focus', 2: 'pull focus', 3: 'legs focus', 4: 'circuit a', 5: 'circuit b' };
  const baseExercises = { 1: pushDayExercises, 2: pullDayExercises, 3: legsDayExercises, 4: circuitAExercises, 5: circuitBExercises };
  const durations = { 1: 40, 2: 40, 3: 45, 4: 35, 5: 35 };

  return {
    id: `week${week}-day${day}`,
    week,
    day,
    dayName: dayNames[day],
    exercises: baseExercises[day].map(ex => ({ ...ex, id: `w${week}d${day}-${ex.id}` })),
    estimatedDuration: durations[day],
  };
}

export function getWorkouts(week: number): Workout[] {
  return [1, 2, 3, 4, 5].map(d => generateWorkout(week, d as 1 | 2 | 3 | 4 | 5));
}
