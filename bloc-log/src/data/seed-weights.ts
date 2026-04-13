/**
 * Seed weights for week 1 based on Vanessa's training history
 * 
 * Data source: Personal training log (Aug 2025)
 * - Squat: 185-195 lbs @ 4 reps (tempo)
 * - Deadlift: 175 lbs @ 5 reps (backdowns)
 * - Bench: 100-115 lbs @ 3-4 reps
 * - RDL: 135-155 lbs @ 10 reps
 * - Rows: 30-35 lbs DBs
 * - Lat Pulldown: 50 lbs
 * - Walking Lunges: 30-35 lbs DBs
 * 
 * Weights are adjusted for the program's rep ranges and RPE targets.
 */

export interface SeedWeight {
  exerciseBaseId: string;  // Without week/day prefix (e.g., "main", "c1")
  weight: number;          // Starting weight in lbs
  notes?: string;          // Why this weight was chosen
}

// Lower Body A (Day 1) - Squat focus
export const day1SeedWeights: SeedWeight[] = [
  {
    exerciseBaseId: 'power',
    weight: 0,  // Box jumps - bodyweight
    notes: 'Bodyweight plyometric',
  },
  {
    exerciseBaseId: 'main',
    weight: 155,  // Barbell back squat
    notes: 'Based on 185lb tempo squat @ 4 reps. 8 reps needs ~155lb @ RPE 7-8',
  },
  {
    exerciseBaseId: 'b2',
    weight: 0,  // Copenhagen plank - bodyweight
    notes: 'Isometric hold - bodyweight',
  },
  {
    exerciseBaseId: 'c1',
    weight: 25,  // RFESS - per dumbbell
    notes: 'Based on 30lb walking lunges. Split squat is harder, start lighter.',
  },
  {
    exerciseBaseId: 'c2',
    weight: 95,  // Barbell hip thrust
    notes: 'Conservative start. BootyBuilder was 140lb but different movement.',
  },
  {
    exerciseBaseId: 'd1',
    weight: 0,  // Stability ball hamstring curl
    notes: 'Bodyweight with stability ball',
  },
  {
    exerciseBaseId: 'd2',
    weight: 0,  // Dead bug
    notes: 'Bodyweight core work',
  },
  {
    exerciseBaseId: 'finisher',
    weight: 35,  // Farmer carry - per hand
    notes: 'Based on general DB work capacity',
  },
];

// Upper Body A (Day 2) - Bench focus
export const day2SeedWeights: SeedWeight[] = [
  {
    exerciseBaseId: 'power',
    weight: 12,  // Med ball chest pass
    notes: 'Standard med ball weight for explosive work',
  },
  {
    exerciseBaseId: 'main',
    weight: 85,  // Barbell bench press
    notes: 'Bench backdowns were 100lb @ 4 reps. 8 reps needs ~85lb @ RPE 7-8',
  },
  {
    exerciseBaseId: 'b2',
    weight: 25,  // Face pulls
    notes: 'Light cable work for rear delts',
  },
  {
    exerciseBaseId: 'c1',
    weight: 30,  // Dumbbell row - per hand
    notes: 'Tripod rows were 30-35lb. Same movement pattern.',
  },
  {
    exerciseBaseId: 'c2',
    weight: 25,  // Incline DB press - per hand
    notes: 'Lighter than flat bench equivalent',
  },
  {
    exerciseBaseId: 'd1',
    weight: 40,  // Cable tricep pushdown
    notes: 'V-swivel tricep work was 50lb. Slightly lighter for higher reps.',
  },
  {
    exerciseBaseId: 'd2',
    weight: 15,  // Dumbbell bicep curl - per hand
    notes: 'Standard curl weight for 12-15 reps',
  },
  {
    exerciseBaseId: 'finisher',
    weight: 25,  // Plate overhead carry
    notes: 'Moderate weight for time-based carry',
  },
];

// Lower Body B (Day 3) - Deadlift focus
export const day3SeedWeights: SeedWeight[] = [
  {
    exerciseBaseId: 'power',
    weight: 35,  // Kettlebell swing
    notes: 'Moderate KB for power development',
  },
  {
    exerciseBaseId: 'main',
    weight: 165,  // Trap bar deadlift
    notes: 'Deadlift backdowns were 175lb @ 5 reps. 6 reps needs ~165lb.',
  },
  {
    exerciseBaseId: 'b2',
    weight: 20,  // Pallof press
    notes: 'Anti-rotation work, moderate cable weight',
  },
  {
    exerciseBaseId: 'c1',
    weight: 30,  // Walking lunges - per hand
    notes: 'Direct match: walking lunges were 30-35lb DBs',
  },
  {
    exerciseBaseId: 'c2',
    weight: 115,  // Romanian deadlift
    notes: 'BB RDL was 135-155lb @ 10 reps. Conservative start.',
  },
  {
    exerciseBaseId: 'd1',
    weight: 60,  // Leg curl machine
    notes: 'Moderate machine weight for isolation',
  },
  {
    exerciseBaseId: 'd2',
    weight: 0,  // Calf raises
    notes: 'Bodyweight or machine - start light',
  },
];

// Upper Body B (Day 4) - OHP focus
export const day4SeedWeights: SeedWeight[] = [
  {
    exerciseBaseId: 'power',
    weight: 0,  // Explosive push-ups
    notes: 'Bodyweight plyometric',
  },
  {
    exerciseBaseId: 'main',
    weight: 55,  // Overhead press
    notes: 'Typically ~50-60% of bench. Conservative start for 8 reps.',
  },
  {
    exerciseBaseId: 'b2',
    weight: 50,  // Chin-ups or lat pulldown
    notes: 'Lat pulldown was 50lb. Direct match.',
  },
  {
    exerciseBaseId: 'c1',
    weight: 10,  // Cable lateral raise
    notes: 'Light isolation work for shoulders',
  },
  {
    exerciseBaseId: 'c2',
    weight: 55,  // Seated cable row
    notes: 'Similar to lat pulldown capacity',
  },
  {
    exerciseBaseId: 'd1',
    weight: 20,  // Skull crushers - total weight (EZ bar or DBs)
    notes: 'Based on DB skull crusher history',
  },
  {
    exerciseBaseId: 'd2',
    weight: 17.5,  // Hammer curls - per hand
    notes: 'Slightly heavier than regular curls due to grip advantage',
  },
  {
    exerciseBaseId: 'finisher',
    weight: 0,  // Battle ropes
    notes: 'Cardio finisher - no additional weight',
  },
];

// Map day number to seed weights
export const seedWeightsByDay: Record<number, SeedWeight[]> = {
  1: day1SeedWeights,
  2: day2SeedWeights,
  3: day3SeedWeights,
  4: day4SeedWeights,
};

/**
 * Get the seed weight for a specific exercise
 * @param day - Workout day (1-4)
 * @param exerciseId - Full exercise ID (e.g., "w1d1-main")
 * @returns The seed weight in lbs, or undefined if not found
 */
export function getSeedWeight(day: number, exerciseId: string): number | undefined {
  // Extract the base ID from the full exercise ID (e.g., "w1d1-main" -> "main")
  const baseId = exerciseId.split('-').slice(1).join('-');
  
  const dayWeights = seedWeightsByDay[day];
  if (!dayWeights) return undefined;
  
  const seedWeight = dayWeights.find(sw => sw.exerciseBaseId === baseId);
  return seedWeight?.weight;
}

/**
 * Get all seed weights for a workout day
 * @param day - Workout day (1-4)
 * @returns Map of exercise base ID to weight
 */
export function getDaySeedWeights(day: number): Map<string, number> {
  const weights = new Map<string, number>();
  const dayWeights = seedWeightsByDay[day];
  
  if (dayWeights) {
    dayWeights.forEach(sw => {
      weights.set(sw.exerciseBaseId, sw.weight);
    });
  }
  
  return weights;
}
