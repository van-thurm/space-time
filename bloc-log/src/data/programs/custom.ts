// Custom program - starts with configurable blank days
// Users can add their own exercises through the workout interface

import type { Workout, WorkoutDay } from '@/types';

// Each day starts empty - user adds their own exercises through the + button.
// Uses standard workout ID format for compatibility with analytics.
export function getCustomWorkouts(week: number, dayLabels: string[]): Workout[] {
  return dayLabels.map((label, index) => {
    const day = (index + 1) as WorkoutDay;
    return {
      id: `week${week}-day${day}`,
      week,
      day,
      dayName: label,
      exercises: [],
      estimatedDuration: 45,
    };
  });
}

// Backward-compatible default custom program shape.
export function getWorkouts(week: number): Workout[] {
  return getCustomWorkouts(week, ['day 1', 'day 2', 'day 3', 'day 4']);
}
