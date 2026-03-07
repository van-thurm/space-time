// Program workout registry - maps template IDs to workout generators

import type { ProgramTemplateId, Workout, Exercise, WorkoutDay } from '@/types';
import { getTemplate } from '@/data/program-templates';

// Import program-specific workout definitions
import { getWorkouts as get4DayUpperLower } from './4-day-upper-lower';
import { getWorkouts as get3DayFullBodyStrength } from './3-day-full-body-strength';
import { getWorkouts as get3DaySurvival } from './3-day-survival';
import { getWorkouts as get3DayTexas } from './3-day-texas';
import { getWorkouts as get2DayTotal } from './2-day-total';
import { getWorkouts as get3DaySimple } from './3-day-simple';
import { getWorkouts as get4DaySimple } from './4-day-simple';
import { getWorkouts as get3DayHybrid } from './3-day-hybrid';
import { getWorkouts as get4DayTotal } from './4-day-total';
import { getWorkouts as get5DayCircuit } from './5-day-circuit';
import { getWorkouts as getCustom } from './custom';

// Registry of workout generators by program template
const workoutGenerators: Record<ProgramTemplateId, (week: number) => Workout[]> = {
  '4-day-upper-lower': get4DayUpperLower,
  '4-day-total-body': get4DayTotal,
  '3-day-full-body-strength': get3DayFullBodyStrength,
  '3-day-upper-lower-hybrid': get3DayHybrid,
  '3-day-total-body-texas': get3DayTexas,
  '2-day-total-body': get2DayTotal,
  '5-day-total-body-circuit': get5DayCircuit,
  '3-day-survival-mode': get3DaySurvival,
  '3-day-simple-total-body': get3DaySimple,
  '4-day-simple-total-body': get4DaySimple,
  'custom': getCustom,
};

function normalizeWorkoutCase(workouts: Workout[]): Workout[] {
  return workouts.map((workout) => ({
    ...workout,
    dayName: workout.dayName.toLowerCase(),
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      name: exercise.name.toLowerCase(),
      notes: exercise.notes ? exercise.notes.toLowerCase() : exercise.notes,
    })),
  }));
}

// Get workouts for a specific program template and week
export function getProgramWorkouts(templateId: ProgramTemplateId, week: number): Workout[] {
  const generator = workoutGenerators[templateId];
  if (!generator) {
    console.warn(`No workout generator for template: ${templateId}`);
    return [];
  }
  return normalizeWorkoutCase(generator(week));
}

// Get the total weeks for a program
export function getProgramWeeks(templateId: ProgramTemplateId): number {
  const template = getTemplate(templateId);
  return template?.weeksTotal || 12;
}

// Get days per week for a program
export function getProgramDaysPerWeek(templateId: ProgramTemplateId): number {
  const template = getTemplate(templateId);
  return template?.daysPerWeek || 4;
}
