import type { ExerciseDbExercise } from '@/types';

const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// ExerciseDB body part mapping
// Our program uses different muscle group names than ExerciseDB
const BODY_PART_MAP: Record<string, string> = {
  // Lower body
  quadriceps: 'upper legs',
  quads: 'upper legs',
  glutes: 'upper legs',
  hamstrings: 'upper legs',
  calves: 'lower legs',
  adductors: 'upper legs',
  'hip flexors': 'upper legs',
  
  // Upper body
  chest: 'chest',
  shoulders: 'shoulders',
  triceps: 'upper arms',
  biceps: 'upper arms',
  forearms: 'lower arms',
  back: 'back',
  'upper back': 'back',
  lats: 'back',
  
  // Core
  core: 'waist',
  abs: 'waist',
  obliques: 'waist',
  
  // Other
  neck: 'neck',
  cardio: 'cardio',
};

// Equipment mapping
const EQUIPMENT_MAP: Record<string, string> = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  kettlebell: 'kettlebell',
  cable: 'cable',
  machine: 'leverage machine',
  'body weight': 'body weight',
  band: 'band',
  'stability ball': 'stability ball',
  bench: 'body weight', // bench is usually used with other equipment
  box: 'body weight',
  'squat rack': 'barbell',
  'trap bar': 'barbell',
  'ez bar': 'ez barbell',
  'medicine ball': 'medicine ball',
  'battle ropes': 'rope',
  'weight plate': 'weighted',
  'pull-up bar': 'body weight',
};

export class ExerciseDbApi {
  private apiKey: string;
  private cache: Map<string, ExerciseDbExercise[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY || '';
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('ExerciseDB API key not configured');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get exercises by body part
  async getByBodyPart(bodyPart: string): Promise<ExerciseDbExercise[]> {
    const mappedPart = BODY_PART_MAP[bodyPart.toLowerCase()] || bodyPart.toLowerCase();
    const cacheKey = `bodyPart:${mappedPart}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const exercises = await this.fetch<ExerciseDbExercise[]>(
      `/exercises/bodyPart/${encodeURIComponent(mappedPart)}?limit=50`
    );
    
    this.cache.set(cacheKey, exercises);
    return exercises;
  }

  // Get exercises by equipment
  async getByEquipment(equipment: string): Promise<ExerciseDbExercise[]> {
    const mappedEquipment = EQUIPMENT_MAP[equipment.toLowerCase()] || equipment.toLowerCase();
    const cacheKey = `equipment:${mappedEquipment}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const exercises = await this.fetch<ExerciseDbExercise[]>(
      `/exercises/equipment/${encodeURIComponent(mappedEquipment)}?limit=50`
    );
    
    this.cache.set(cacheKey, exercises);
    return exercises;
  }

  // Search exercises by name
  async searchByName(name: string): Promise<ExerciseDbExercise[]> {
    const exercises = await this.fetch<ExerciseDbExercise[]>(
      `/exercises/name/${encodeURIComponent(name.toLowerCase())}?limit=20`
    );
    return exercises;
  }

  // Get exercise by ID
  async getById(id: string): Promise<ExerciseDbExercise> {
    return this.fetch<ExerciseDbExercise>(`/exercises/exercise/${id}`);
  }
}

// Singleton instance
let apiInstance: ExerciseDbApi | null = null;

export function getExerciseDbApi(): ExerciseDbApi {
  if (!apiInstance) {
    apiInstance = new ExerciseDbApi();
  }
  return apiInstance;
}

// Find alternative exercises based on muscle groups and equipment
export async function findAlternatives(
  muscleGroups: string[],
  equipment: string[],
  excludeName?: string
): Promise<ExerciseDbExercise[]> {
  const api = getExerciseDbApi();
  
  // Get exercises for primary muscle group
  const primaryMuscle = muscleGroups[0];
  if (!primaryMuscle) return [];

  try {
    const exercises = await api.getByBodyPart(primaryMuscle);
    
    // Filter by equipment if possible
    const mappedEquipment = equipment.map(
      (e) => EQUIPMENT_MAP[e.toLowerCase()] || e.toLowerCase()
    );
    
    const filtered = exercises.filter((ex) => {
      // Exclude the current exercise
      if (excludeName && ex.name.toLowerCase().includes(excludeName.toLowerCase())) {
        return false;
      }
      
      // Check if equipment matches (or allow body weight)
      const hasMatchingEquipment = mappedEquipment.some(
        (eq) => ex.equipment.toLowerCase() === eq || ex.equipment === 'body weight'
      );
      
      return hasMatchingEquipment;
    });

    // Return top 10
    return filtered.slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch alternatives:', error);
    return [];
  }
}

// Check if API is configured
export function isApiConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY;
}
