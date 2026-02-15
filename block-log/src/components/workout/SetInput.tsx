'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeometricCheck } from '@/components/ui/DieterIcons';
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
  onWeightChange?: (weight: number) => void;  // Notify parent of weight changes for cascade
  units: 'lbs' | 'kg';
  cascadeWeight?: number;  // Weight cascaded from a previous set
  showColumnLabels?: boolean;
  isRowActive?: boolean;
  onActivateRow?: () => void;
  chipTone?: 'default' | 'complete';
}

export function SetInput({
  setIndex,
  targetReps,
  targetRPE: _targetRPE,
  previousSetInExercise,
  lastWeekSet,
  recommendedWeight,
  value,
  onChange,
  onWeightChange,
  units,
  cascadeWeight,
  showColumnLabels = false,
  isRowActive = false,
  onActivateRow,
  chipTone = 'default',
}: SetInputProps) {
  type SetState = 'empty' | 'completed' | 'skipped';

  // Parse target reps (e.g., "8" or "12-15" or "30s")
  const defaultReps = parseInt(targetReps.split('-')[0]) || 0;
  const isTimeBased = /s|sec|min/i.test(targetReps);
  const repsLabel = isTimeBased ? 'sec' : 'reps';
  
  // Best guess weight: cascaded > value > lastWeek > recommended > previous > 0
  const suggestedWeight = cascadeWeight || recommendedWeight || lastWeekSet?.weight || previousSetInExercise?.weight || 0;
  
  const [weight, setWeight] = useState(value?.weight ?? 0);
  const [reps, setReps] = useState(value?.reps || defaultReps);
  const [rpe, setRpe] = useState(value?.rpe || 0);
  const [setState, setSetState] = useState<SetState>(
    value?.status === 'skipped' ? 'skipped' : value && value.reps > 0 ? 'completed' : 'empty'
  );
  const [weightTouched, setWeightTouched] = useState(false);

  const sanitizeWeight = (raw: number): number => {
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(2000, Math.round(raw)));
  };

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setWeight(value.weight);
      setReps(value.reps);
      setRpe(value.rpe);
      setSetState(value.status === 'skipped' ? 'skipped' : value.reps > 0 ? 'completed' : 'empty');
      return;
    }
    // When a workout is cleared, value becomes undefined.
    // Reset local fields so the UI immediately returns to ready state.
    setWeight(0);
    setReps(defaultReps);
    setRpe(0);
    setSetState('empty');
    setWeightTouched(false);
  }, [defaultReps, value]);

  // Apply cascade weight when it changes (from first set).
  // Do not override values that are already logged/saved for this set.
  useEffect(() => {
    const hasSavedWeight = Boolean(value && value.weight > 0);
    if (cascadeWeight && !weightTouched && !hasSavedWeight && setState === 'empty' && setIndex > 0) {
      setWeight(cascadeWeight);
    }
  }, [cascadeWeight, weightTouched, setState, setIndex, value]);

  const cycleSetState = useCallback(() => {
    if (setState === 'empty') {
      const repsToLog = reps > 0 ? reps : defaultReps;
      if (repsToLog <= 0) return;

      const finalWeight = sanitizeWeight(weight || suggestedWeight);
      setWeight(finalWeight);
      if (reps !== repsToLog) {
        setReps(repsToLog);
      }
      setSetState('completed');
      onChange({ weight: finalWeight, reps: repsToLog, rpe: rpe > 0 ? rpe : 0, status: 'completed' });
      if (setIndex === 0 && onWeightChange) {
        onWeightChange(finalWeight);
      }
      return;
    }

    if (setState === 'completed') {
      setSetState('skipped');
      onChange({ weight: 0, reps: 0, rpe: 0, status: 'skipped' });
      return;
    }

    setSetState('empty');
    setWeight(0);
    setReps(defaultReps);
    setRpe(0);
    onChange({ weight: 0, reps: 0, rpe: 0 });
  }, [defaultReps, onChange, onWeightChange, reps, rpe, setIndex, setState, suggestedWeight, weight]);

  const handleWeightChange = (newValue: number) => {
    const nextWeight = sanitizeWeight(newValue);
    setWeight(nextWeight);
    setWeightTouched(true);
    
    // Notify parent for cascade (only from first set)
    if (setIndex === 0 && onWeightChange) {
      onWeightChange(nextWeight);
    }
    
    if (setState === 'completed') {
      onChange({ weight: nextWeight, reps, rpe, status: 'completed' });
    }
  };

  const handleRepsChange = (newValue: number) => {
    setReps(newValue);
    if (setState === 'completed') {
      onChange({ weight, reps: newValue, rpe, status: 'completed' });
    }
  };

  const handleRpeChange = (newValue: number) => {
    setRpe(newValue);
    if (setState === 'completed') {
      onChange({ weight, reps, rpe: newValue, status: 'completed' });
    }
  };

  // Display weight or grey placeholder
  const displayWeight = weight > 0 ? String(weight) : '';
  const displayReps = reps > 0 ? String(reps) : '';
  const placeholderWeight = suggestedWeight > 0 ? String(suggestedWeight) : '';

  const setToggleClass =
    setState === 'completed'
      ? 'bg-success text-background border-success'
      : setState === 'skipped'
        ? 'bg-accent/10 text-accent border-accent'
        : 'bg-background border-border text-muted hover:border-foreground';
  const chipClass =
    chipTone === 'complete'
      ? 'border-success/70 bg-success/15 text-success'
      : 'border-accent/60 bg-accent/10 text-accent dark:border-white/50 dark:bg-white/10 dark:text-white';
  const inputBorderClass = isRowActive ? 'border-foreground text-foreground' : 'border-border text-muted';

  return (
    <div className="py-1">
      {showColumnLabels && (
        <div className="grid grid-cols-[34px_minmax(0,1fr)_10px_minmax(0,0.88fr)_68px] gap-1.5 items-center pb-1">
          <span aria-hidden="true" />
          <span className={`h-5 px-1.5 inline-flex items-center justify-center border font-mono text-[10px] uppercase tracking-wide ${chipClass}`}>
            {units}
          </span>
          <span className="font-mono text-[10px] text-muted text-center">x</span>
          <span className={`h-5 px-1.5 inline-flex items-center justify-center border font-mono text-[10px] uppercase tracking-wide ${chipClass}`}>
            {repsLabel}
          </span>
          <span className={`h-5 px-1.5 inline-flex items-center justify-center border font-mono text-[10px] uppercase tracking-wide ${chipClass}`}>
            rpe
          </span>
        </div>
      )}
      {/* Compact single-row grid layout */}
      <div className="grid grid-cols-[34px_1fr] gap-1.5 items-center">
        {/* Left: Complete button */}
        <button
          onClick={cycleSetState}
          disabled={reps === 0 && defaultReps === 0 && setState === 'empty'}
          onFocus={onActivateRow}
          aria-label={
            setState === 'completed'
              ? 'Set completed. Tap to mark skipped'
              : setState === 'skipped'
                ? 'Set skipped. Tap to clear'
                : 'Mark set complete'
          }
          className={`
            w-9 h-9 border-2 flex-shrink-0
            flex items-center justify-center font-mono text-sm leading-none
            transition-colors touch-manipulation
            ${setToggleClass}
            disabled:opacity-30
          `}
        >
          {setState === 'completed' ? <GeometricCheck size={13} /> : setState === 'skipped' ? '−' : ''}
        </button>

        {/* Right: Input row */}
        <div className="grid grid-cols-[minmax(0,1fr)_10px_minmax(0,0.88fr)_68px] gap-1.5 items-center">
          {/* Weight group */}
          <div className="min-w-0">
            <input
              type="text"
              inputMode="decimal"
              value={displayWeight}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d]/g, '');
                handleWeightChange(parseInt(next, 10) || 0);
              }}
              onFocus={onActivateRow}
              placeholder={placeholderWeight}
              aria-label="Weight"
              className={`w-full h-9 px-2 border-2 bg-background font-mono text-right text-sm
                focus:border-foreground focus:outline-none touch-manipulation
                ${inputBorderClass} placeholder:text-muted/50`}
            />
          </div>

          <div className="font-mono text-[11px] text-muted text-center">x</div>

          {/* Reps group */}
          <div className="min-w-0">
            <input
              type="text"
              inputMode="numeric"
              value={displayReps}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d]/g, '');
                handleRepsChange(parseInt(next, 10) || 0);
              }}
              onFocus={onActivateRow}
              placeholder={String(defaultReps)}
              aria-label={isTimeBased ? 'Seconds' : 'Reps'}
              className={`w-full h-9 px-2 border-2 bg-background font-mono text-right text-sm
                focus:border-foreground focus:outline-none touch-manipulation
                ${inputBorderClass}`}
            />
          </div>

          {/* RPE select */}
          <div className="min-w-0">
            <select
              value={rpe || ''}
              onChange={(e) => handleRpeChange(parseInt(e.target.value, 10) || 0)}
              onFocus={onActivateRow}
              aria-label="RPE (rating of perceived exertion)"
              className={`w-full h-9 px-2 pr-6 border-2 ${inputBorderClass} bg-background font-mono text-sm
                focus:border-foreground focus:outline-none text-center touch-manipulation`}
            >
              <option value="">-</option>
              {[5, 6, 7, 8, 9, 10].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
