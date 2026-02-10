'use client';

import { useState, useEffect } from 'react';
import type { SetLog } from '@/types';

interface SetInputProps {
  setIndex: number;
  targetReps: string;
  targetRPE: string;
  previousSetInExercise?: SetLog;  // The set above this one (same workout)
  lastWeekSet?: SetLog;            // Same set from last week
  recommendedWeight?: number;
  value?: SetLog;
  onChange: (setData: SetLog) => void;
  units: 'lbs' | 'kg';
}

export function SetInput({
  setIndex,
  targetReps,
  targetRPE,
  previousSetInExercise,
  lastWeekSet,
  recommendedWeight,
  value,
  onChange,
  units,
}: SetInputProps) {
  // Parse target reps (e.g., "8" or "12-15" -> 8 or 12)
  const defaultReps = parseInt(targetReps.split('-')[0]) || 0;
  
  // Initialize with smart defaults:
  // 1. Existing value if editing
  // 2. Last week's weight if available
  // 3. Recommended weight from progression
  // 4. Previous set's weight (for set 2+)
  const getInitialWeight = () => {
    if (value?.weight) return value.weight;
    if (lastWeekSet?.weight) return lastWeekSet.weight;
    if (recommendedWeight) return recommendedWeight;
    if (previousSetInExercise?.weight) return previousSetInExercise.weight;
    return 0;
  };

  const [weight, setWeight] = useState(getInitialWeight());
  const [reps, setReps] = useState(value?.reps || defaultReps);
  const [rpe, setRpe] = useState(value?.rpe || 0);
  const [isComplete, setIsComplete] = useState(value ? value.weight > 0 && value.reps > 0 : false);

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setWeight(value.weight);
      setReps(value.reps);
      setRpe(value.rpe);
      setIsComplete(value.weight > 0 && value.reps > 0);
    }
  }, [value]);

  // Re-initialize weight when lastWeekSet becomes available (async load)
  useEffect(() => {
    if (!value?.weight && !weight && lastWeekSet?.weight) {
      setWeight(lastWeekSet.weight);
    }
  }, [lastWeekSet, value, weight]);

  const handleComplete = () => {
    if (weight > 0 && reps > 0) {
      setIsComplete(true);
      onChange({ weight, reps, rpe: rpe || 7 });
    }
  };

  const handleChange = (field: 'weight' | 'reps' | 'rpe', newValue: number) => {
    if (field === 'weight') setWeight(newValue);
    if (field === 'reps') setReps(newValue);
    if (field === 'rpe') setRpe(newValue);
    
    // If already complete, update immediately
    if (isComplete) {
      onChange({
        weight: field === 'weight' ? newValue : weight,
        reps: field === 'reps' ? newValue : reps,
        rpe: field === 'rpe' ? newValue : rpe,
      });
    }
  };

  // Quick-fill from previous set (above this one)
  const copyFromAbove = () => {
    if (previousSetInExercise?.weight) {
      setWeight(previousSetInExercise.weight);
      if (previousSetInExercise.reps) {
        setReps(previousSetInExercise.reps);
      }
    }
  };

  // Quick-fill from last week
  const copyFromLastWeek = () => {
    if (lastWeekSet?.weight) {
      setWeight(lastWeekSet.weight);
      if (lastWeekSet.reps) {
        setReps(lastWeekSet.reps);
      }
    }
  };

  // Use recommended progression weight
  const useRecommended = () => {
    if (recommendedWeight) {
      setWeight(recommendedWeight);
    }
  };

  // Check if we have quick-fill options
  const hasQuickFill = previousSetInExercise?.weight || lastWeekSet?.weight || recommendedWeight;

  return (
    <div className={`py-2 ${isComplete ? 'opacity-60' : ''}`}>
      {/* Quick-fill buttons - only show if not complete and has options */}
      {!isComplete && hasQuickFill && setIndex === 0 && (
        <div className="flex flex-wrap gap-2 mb-2 ml-14">
          {lastWeekSet?.weight && (
            <button
              onClick={copyFromLastWeek}
              className="min-h-[44px] px-3 py-2 text-sm font-mono border-2 border-accent text-accent 
                active:bg-accent active:text-background
                hover:bg-accent hover:text-background transition-colors touch-manipulation"
            >
              last: {lastWeekSet.weight}{units}
            </button>
          )}
          {recommendedWeight && recommendedWeight !== lastWeekSet?.weight && (
            <button
              onClick={useRecommended}
              className="min-h-[44px] px-3 py-2 text-sm font-mono border-2 border-success text-success 
                active:bg-success active:text-background
                hover:bg-success hover:text-background transition-colors touch-manipulation"
            >
              +5: {recommendedWeight}{units}
            </button>
          )}
        </div>
      )}

      {/* Main input row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Set number */}
        <span className="font-mono text-sm text-muted w-6">
          {setIndex + 1}.
        </span>

        {/* Copy from above button (for sets 2+) */}
        {setIndex > 0 && previousSetInExercise?.weight && !isComplete && (
          <button
            onClick={copyFromAbove}
            className="w-10 h-10 border-2 border-accent/50 flex-shrink-0
              flex items-center justify-center font-mono text-base text-accent
              active:bg-accent active:text-background active:border-accent
              hover:border-accent hover:text-accent transition-colors touch-manipulation"
            aria-label="Copy weight from set above"
          >
            ↑
          </button>
        )}

        {/* Complete checkbox - only show for set 1 or when no copy button */}
        {(setIndex === 0 || !previousSetInExercise?.weight || isComplete) && (
          <button
            onClick={handleComplete}
            disabled={weight === 0 || reps === 0}
            aria-label={isComplete ? 'Set completed' : 'Mark set complete'}
            className={`
              w-10 h-10 border-2 flex-shrink-0
              flex items-center justify-center font-mono text-base
              transition-colors touch-manipulation
              ${isComplete 
                ? 'bg-success text-background border-success' 
                : 'border-border active:border-success active:bg-success/20 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed'
              }
            `}
          >
            {isComplete ? '✓' : ''}
          </button>
        )}

        {/* Weight input */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            value={weight || ''}
            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
            placeholder={lastWeekSet?.weight ? String(lastWeekSet.weight) : recommendedWeight ? String(recommendedWeight) : '0'}
            aria-label="Weight"
            className={`w-16 sm:w-20 h-10 px-2 border-2 bg-background font-mono text-right text-base
              focus:border-foreground focus:outline-none touch-manipulation
              ${weight > 0 ? 'border-foreground' : 'border-border'}`}
          />
          <span className="font-mono text-xs text-muted">{units}</span>
        </div>

        {/* Reps input - pre-filled with target */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            value={reps || ''}
            onChange={(e) => handleChange('reps', parseInt(e.target.value) || 0)}
            placeholder={String(defaultReps)}
            aria-label="Reps"
            className={`w-14 h-10 px-2 border-2 bg-background font-mono text-right text-base
              focus:border-foreground focus:outline-none touch-manipulation
              ${reps > 0 ? 'border-foreground' : 'border-border'}`}
          />
          <span className="font-mono text-xs text-muted">reps</span>
        </div>

        {/* RPE input */}
        <select
          value={rpe || ''}
          onChange={(e) => handleChange('rpe', parseInt(e.target.value) || 0)}
          aria-label="Rate of perceived exertion"
          className="w-16 h-10 px-1 border-2 border-border bg-background font-mono text-base
            focus:border-foreground focus:outline-none text-center touch-manipulation"
        >
          <option value="">rpe</option>
          {[5, 6, 7, 8, 9, 10].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Complete button for sets with copy button visible */}
        {setIndex > 0 && previousSetInExercise?.weight && !isComplete && (
          <button
            onClick={handleComplete}
            disabled={weight === 0 || reps === 0}
            aria-label="Mark set complete"
            className={`
              w-10 h-10 border-2 flex-shrink-0
              flex items-center justify-center font-mono text-base
              transition-colors touch-manipulation
              border-border active:border-success active:bg-success/20 
              hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
