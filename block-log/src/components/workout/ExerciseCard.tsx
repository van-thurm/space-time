'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SetInput } from './SetInput';
import type { Exercise, SetLog, ExerciseLog } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  exerciseIndex: number;
  lastWeekLog?: ExerciseLog;
  recommendedWeight?: number;
  isSkipped?: boolean;
  onSwapClick: () => void;
  onSkipClick: () => void;
  onRestoreClick?: () => void;
}

export function ExerciseCard({
  exercise,
  workoutId,
  exerciseIndex,
  lastWeekLog,
  recommendedWeight,
  isSkipped = false,
  onSwapClick,
  onSkipClick,
  onRestoreClick,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
  const logExerciseSet = useAppStore((state) => state.logExerciseSet);
  const getWorkoutLog = useAppStore((state) => state.getWorkoutLog);
  const getSubstitution = useAppStore((state) => state.getSubstitution);
  const userSettings = useAppStore((state) => state.userSettings);

  // Check for substitution
  const substitution = getSubstitution(exercise.id);
  const displayName = substitution?.replacementName || exercise.name;

  // Get current log for this exercise
  const currentLog = getWorkoutLog(workoutId);
  const exerciseLog = currentLog?.exercises.find((e) => e.exerciseId === exercise.id);

  // Get last week's weight for display
  const lastWeight = lastWeekLog?.sets[0]?.weight;

  // Category labels
  const categoryLabels: Record<string, string> = {
    power: 'power',
    main_lift: 'main',
    accessory: 'accessory',
    isolation: 'isolation',
    finisher: 'finisher',
  };

  const handleSetChange = (setIndex: number, setData: SetLog) => {
    logExerciseSet(workoutId, exercise.id, setIndex, setData);
  };

  // Count completed sets
  const completedSets = exerciseLog?.sets.filter((s) => s.weight > 0 && s.reps > 0).length || 0;
  const isExerciseComplete = completedSets >= exercise.sets;

  // If skipped, show collapsed state
  if (isSkipped) {
    return (
      <div className="border-2 border-border/50 bg-surface/50 opacity-60">
        <div className="p-4 flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted uppercase line-through">
                {exerciseIndex + 1}. {categoryLabels[exercise.category] || exercise.category}
              </span>
              <span className="font-mono text-xs text-muted">skipped</span>
            </div>
            <h3 className="font-mono font-bold text-base text-muted line-through">
              {displayName}
            </h3>
          </div>
          
          {onRestoreClick && (
            <button
              onClick={onRestoreClick}
              className="font-mono text-sm text-accent active:bg-accent active:text-background
                px-3 py-2 border-2 border-accent hover:bg-accent hover:text-background transition-colors touch-manipulation"
            >
              restore
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${isExerciseComplete ? 'border-success/50 bg-success/5' : 'border-border'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted uppercase">
                {exerciseIndex + 1}. {categoryLabels[exercise.category] || exercise.category}
              </span>
              {substitution && (
                <span className="font-mono text-xs text-accent">swapped</span>
              )}
            </div>
            <h3 className="font-mono font-bold text-lg mt-1">
              {displayName}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onSwapClick}
              className="font-mono text-sm text-muted active:text-foreground active:border-foreground
                hover:text-foreground transition-colors px-2 py-1 border border-border hover:border-foreground touch-manipulation"
            >
              swap
            </button>
            <button
              onClick={onSkipClick}
              aria-label="Skip this exercise"
              className="w-8 h-8 flex items-center justify-center font-mono text-sm text-muted 
                border border-border hover:border-danger hover:text-danger 
                active:bg-danger active:text-background transition-colors touch-manipulation"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Exercise info */}
        <div className="flex flex-wrap gap-3 mt-2 font-mono text-sm text-muted">
          <span>{exercise.sets} sets × {exercise.reps}</span>
          <span>rest {exercise.restSeconds}s</span>
          <span>rpe {exercise.targetRPE}</span>
        </div>

        {/* Last week / recommended */}
        <div className="flex flex-wrap gap-4 mt-3 font-mono text-sm">
          {lastWeight !== undefined && lastWeight > 0 && (
            <span className="text-muted">
              last week: <span className="text-foreground">{lastWeight} {userSettings.units}</span>
            </span>
          )}
          {recommendedWeight !== undefined && recommendedWeight > 0 && (
            <span className="text-accent">
              recommended: <span className="font-bold">{recommendedWeight} {userSettings.units}</span>
              {recommendedWeight > (lastWeight || 0) && ' ↗'}
            </span>
          )}
        </div>

        {/* Exercise notes */}
        {exercise.notes && (
          <p className="font-mono text-sm text-muted mt-2 italic">
            {exercise.notes}
          </p>
        )}
      </div>

      {/* Sets */}
      <div className="p-4 space-y-1">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <SetInput
            key={i}
            setIndex={i}
            targetReps={exercise.reps}
            targetRPE={exercise.targetRPE}
            previousSetInExercise={i > 0 ? exerciseLog?.sets[i - 1] : undefined}
            lastWeekSet={lastWeekLog?.sets[i]}
            recommendedWeight={recommendedWeight || lastWeight}
            value={exerciseLog?.sets[i]}
            onChange={(setData) => handleSetChange(i, setData)}
            units={userSettings.units}
          />
        ))}
      </div>

      {/* Notes toggle */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="font-mono text-sm text-muted hover:text-foreground transition-colors"
        >
          {showNotes ? '− hide notes' : '+ add notes'}
        </button>
        
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="how did this feel?"
            className="w-full mt-2 p-2 border-2 border-border bg-background font-mono text-sm
              focus:border-foreground focus:outline-none resize-none"
            rows={2}
          />
        )}
      </div>
    </div>
  );
}
