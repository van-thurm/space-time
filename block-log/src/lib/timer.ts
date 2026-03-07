import type { Exercise } from '@/types';

const MIN_TIMER_SECONDS = 10;
const MAX_TIMER_SECONDS = 240;
const DEFAULT_TIMER_SECONDS = 60;
const TIMER_STEP_SECONDS = 15;

export function clampTimerSeconds(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TIMER_SECONDS;
  return Math.max(MIN_TIMER_SECONDS, Math.min(MAX_TIMER_SECONDS, Math.round(value)));
}

function normalizeTimerDisplaySeconds(value: number): number {
  const snapped = Math.round(value / TIMER_STEP_SECONDS) * TIMER_STEP_SECONDS;
  return clampTimerSeconds(snapped);
}

export function getSmartRestSeconds(exercises: Exercise[]): number {
  const restValues = exercises
    .filter((exercise) => exercise.category !== 'warmup')
    .map((exercise) => Number(exercise.restSeconds))
    .filter((rest) => Number.isFinite(rest) && rest > 0)
    .map((rest) => clampTimerSeconds(rest));

  if (restValues.length === 0) return DEFAULT_TIMER_SECONDS;

  const sorted = [...restValues].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
      : sorted[middle];

  // Snap to clean, expected timer values (e.g. 45s/60s/75s).
  return normalizeTimerDisplaySeconds(median);
}
