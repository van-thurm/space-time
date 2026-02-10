import type { Exercise, ExerciseLog } from '@/types';
import { isDeloadWeek, getCurrentPhase } from '@/data/program';

interface ProgressionResult {
  recommendedWeight: number;
  reason: string;
}

// Get progression increment based on exercise type and phase
function getProgressionIncrement(exercise: Exercise, week: number): number {
  const phase = getCurrentPhase(week);
  
  // Main lifts progress more aggressively
  if (exercise.category === 'main_lift') {
    switch (phase.name) {
      case 'foundation':
        return 5; // 5 lbs per week
      case 'strength':
        return 5; // 5 lbs per week
      case 'peak':
        return 10; // 10 lbs per week (fewer reps, more weight)
      default:
        return 5;
    }
  }

  // Accessories
  if (exercise.category === 'accessory') {
    return 5; // 5 lbs per week
  }

  // Isolation/finishers - smaller increments
  return 2.5;
}

// Parse target RPE from string like "7-8" or "8"
function parseTargetRPE(targetRPE: string): number {
  const parts = targetRPE.split('-').map((p) => parseFloat(p));
  if (parts.length === 2) {
    return (parts[0] + parts[1]) / 2; // Average of range
  }
  return parts[0] || 7;
}

// Calculate average RPE from logged sets
function calculateAverageRPE(exerciseLog: ExerciseLog): number {
  const rpeValues = exerciseLog.sets
    .filter((s) => s.rpe > 0)
    .map((s) => s.rpe);
  
  if (rpeValues.length === 0) return 7; // Default
  
  return rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length;
}

// Get the max weight used in a logged exercise
function getMaxWeight(exerciseLog: ExerciseLog): number {
  return Math.max(...exerciseLog.sets.map((s) => s.weight), 0);
}

// Main progression calculator
export function calculateRecommendedWeight(
  exercise: Exercise,
  week: number,
  lastWeekLog?: ExerciseLog
): ProgressionResult {
  // If no previous data, return 0 (user enters their starting weight)
  if (!lastWeekLog || lastWeekLog.sets.length === 0) {
    return {
      recommendedWeight: 0,
      reason: 'no previous data - enter starting weight',
    };
  }

  const lastWeight = getMaxWeight(lastWeekLog);
  
  // If last weight was 0, no recommendation
  if (lastWeight === 0) {
    return {
      recommendedWeight: 0,
      reason: 'no weight logged last week',
    };
  }

  // Deload weeks: 70% of previous weight
  if (isDeloadWeek(week)) {
    const deloadWeight = Math.round(lastWeight * 0.7 / 5) * 5; // Round to nearest 5
    return {
      recommendedWeight: deloadWeight,
      reason: 'deload week - 70% of last week',
    };
  }

  // Check RPE from last week
  const averageRPE = calculateAverageRPE(lastWeekLog);
  const targetRPE = parseTargetRPE(exercise.targetRPE);

  // If RPE was too high last week, maintain weight
  if (averageRPE > targetRPE + 1) {
    return {
      recommendedWeight: lastWeight,
      reason: `rpe was high (${averageRPE.toFixed(1)}) - maintain weight`,
    };
  }

  // If RPE was on target or below, progress
  const increment = getProgressionIncrement(exercise, week);
  const newWeight = lastWeight + increment;

  // Round to nearest 2.5 or 5 depending on increment
  const roundedWeight = increment === 2.5 
    ? Math.round(newWeight / 2.5) * 2.5
    : Math.round(newWeight / 5) * 5;

  return {
    recommendedWeight: roundedWeight,
    reason: `+${increment} lbs from last week`,
  };
}

// Calculate 1RM estimate using Epley formula
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0 || weight === 0) return 0;
  
  // Epley formula: 1RM = weight × (1 + reps/30)
  return Math.round(weight * (1 + reps / 30));
}

// Get progression history for an exercise
export function getProgressionHistory(
  exerciseSlot: string,
  workoutLogs: { workoutId: string; exercises: ExerciseLog[] }[]
): { week: number; weight: number; reps: number }[] {
  const history: { week: number; weight: number; reps: number }[] = [];

  workoutLogs.forEach((log) => {
    // Parse week from workoutId (e.g., "week3-day1")
    const weekMatch = log.workoutId.match(/week(\d+)/);
    if (!weekMatch) return;
    
    const week = parseInt(weekMatch[1]);
    
    // Find the exercise in this log
    const exerciseLog = log.exercises.find((e) => e.exerciseId.includes(exerciseSlot));
    
    if (exerciseLog && exerciseLog.sets.length > 0) {
      const maxWeight = getMaxWeight(exerciseLog);
      const totalReps = exerciseLog.sets.reduce((sum, s) => sum + s.reps, 0);
      
      if (maxWeight > 0) {
        history.push({ week, weight: maxWeight, reps: totalReps });
      }
    }
  });

  return history.sort((a, b) => a.week - b.week);
}
