// 3-Day Upper/Lower Hybrid - Upper, Lower, and Full Body
// Efficient for busy schedules while hitting all muscle groups

import type { Exercise, Workout } from '@/types';

const lowerDayExercises: Exercise[] = [
  { id: 'hybrid-lower-1', name: 'barbell back squat', category: 'main_lift', sets: 4, reps: '6-8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['quadriceps', 'glutes'], equipment: ['barbell', 'squat rack'], movement: 'squat' },
  { id: 'hybrid-lower-2', name: 'romanian deadlift', category: 'main_lift', sets: 3, reps: '8-10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['hamstrings', 'glutes'], equipment: ['barbell'], movement: 'hinge' },
  { id: 'hybrid-lower-3', name: 'walking lunges', category: 'accessory', sets: 3, reps: '10/leg', targetRPE: '7', restSeconds: 60, muscleGroup: ['quadriceps', 'glutes'], equipment: ['dumbbell'], movement: 'squat' },
  { id: 'hybrid-lower-4', name: 'leg curl', category: 'isolation', sets: 3, reps: '12', targetRPE: '7-8', restSeconds: 60, muscleGroup: ['hamstrings'], equipment: ['machine'], movement: 'isolation' },
  { id: 'hybrid-lower-5', name: 'calf raises', category: 'isolation', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['calves'], equipment: ['machine', 'body weight'], movement: 'isolation' },
];

const upperDayExercises: Exercise[] = [
  { id: 'hybrid-upper-1', name: 'barbell bench press', category: 'main_lift', sets: 4, reps: '6-8', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['chest', 'triceps'], equipment: ['barbell', 'bench'], movement: 'push' },
  { id: 'hybrid-upper-2', name: 'barbell row', category: 'main_lift', sets: 4, reps: '6-8', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['lats', 'biceps'], equipment: ['barbell'], movement: 'pull' },
  { id: 'hybrid-upper-3', name: 'overhead press', category: 'accessory', sets: 3, reps: '8-10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['shoulders'], equipment: ['dumbbell', 'barbell'], movement: 'push' },
  { id: 'hybrid-upper-4', name: 'lat pulldown', category: 'accessory', sets: 3, reps: '10', targetRPE: '7', restSeconds: 60, muscleGroup: ['lats'], equipment: ['cable'], movement: 'pull' },
  { id: 'hybrid-upper-5', name: 'face pulls', category: 'isolation', sets: 3, reps: '15', targetRPE: '7', restSeconds: 45, muscleGroup: ['rear delts'], equipment: ['cable', 'band'], movement: 'pull' },
];

const fullBodyExercises: Exercise[] = [
  { id: 'hybrid-full-1', name: 'trap bar deadlift', category: 'main_lift', sets: 4, reps: '6', targetRPE: '7-8', restSeconds: 120, muscleGroup: ['hamstrings', 'glutes', 'back'], equipment: ['trap bar'], movement: 'hinge', notes: 'or conventional deadlift' },
  { id: 'hybrid-full-2', name: 'incline dumbbell press', category: 'accessory', sets: 3, reps: '10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['chest', 'shoulders'], equipment: ['dumbbell', 'bench'], movement: 'push' },
  { id: 'hybrid-full-3', name: 'chin-ups', category: 'accessory', sets: 3, reps: '6-10', targetRPE: '7-8', restSeconds: 90, muscleGroup: ['lats', 'biceps'], equipment: ['pull-up bar'], movement: 'pull' },
  { id: 'hybrid-full-4', name: 'leg press', category: 'accessory', sets: 3, reps: '12', targetRPE: '7', restSeconds: 90, muscleGroup: ['quadriceps', 'glutes'], equipment: ['leg press'], movement: 'squat' },
  { id: 'hybrid-full-5', name: 'plank', category: 'isolation', sets: 2, reps: '45-60s', targetRPE: '7', restSeconds: 45, muscleGroup: ['core'], equipment: ['body weight'], movement: 'stability' },
];

function generateWorkout(week: number, day: 1 | 2 | 3): Workout {
  const dayNames = { 1: 'lower', 2: 'upper', 3: 'full body' };
  const baseExercises = { 1: lowerDayExercises, 2: upperDayExercises, 3: fullBodyExercises };
  const durations = { 1: 50, 2: 50, 3: 55 };

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
  return [generateWorkout(week, 1), generateWorkout(week, 2), generateWorkout(week, 3)];
}
