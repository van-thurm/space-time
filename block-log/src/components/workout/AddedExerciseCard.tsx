'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SetInput } from './SetInput';
import type { AddedExercise, SetLog, ExerciseLog } from '@/types';

interface AddedExerciseCardProps {
  exercise: AddedExercise;
  workoutId: string;
  exerciseIndex: number;
  onRemove: () => void;
}

export function AddedExerciseCard({
  exercise,
  workoutId,
  exerciseIndex,
  onRemove,
}: AddedExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
  const logExerciseSet = useAppStore((state) => state.logExerciseSet);
  const getWorkoutLog = useAppStore((state) => state.getWorkoutLog);
  const userSettings = useAppStore((state) => state.userSettings);

  // Get current log for this exercise
  const currentLog = getWorkoutLog(workoutId);
  const exerciseLog = currentLog?.exercises.find((e) => e.exerciseId === exercise.id);

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

  return (
    <div className={`border-2 border-dashed ${isExerciseComplete ? 'border-success/50 bg-success/5' : 'border-accent/50'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-accent uppercase">
                +{exerciseIndex + 1}. {categoryLabels[exercise.category] || exercise.category}
              </span>
              <span className="font-mono text-xs text-accent">added</span>
            </div>
            <h3 className="font-mono font-bold text-lg mt-1">
              {exercise.name}
            </h3>
          </div>
          
          <button
            onClick={onRemove}
            aria-label="Remove this exercise"
            className="w-8 h-8 flex items-center justify-center font-mono text-sm text-muted 
              border border-border hover:border-danger hover:text-danger 
              active:bg-danger active:text-background transition-colors touch-manipulation"
          >
            ✕
          </button>
        </div>

        {/* Exercise info */}
        <div className="flex flex-wrap gap-3 mt-2 font-mono text-sm text-muted">
          <span>{exercise.sets} sets × {exercise.reps}</span>
          <span>rest {exercise.restSeconds}s</span>
          <span>rpe {exercise.targetRPE}</span>
        </div>
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
