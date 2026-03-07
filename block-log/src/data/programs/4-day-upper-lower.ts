// 4-Day Upper/Lower Split - The original program
// Re-exports from the main program.ts file

import { getWeekWorkouts } from '@/data/program';
import type { Workout } from '@/types';

export function getWorkouts(week: number): Workout[] {
  return getWeekWorkouts(week);
}
