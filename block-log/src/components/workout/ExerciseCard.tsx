'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { SetInput } from './SetInput';
import { GeometricCheck, TimerIcon, TrashIcon } from '@/components/ui/DieterIcons';
import type { Exercise, SetLog, ExerciseLog } from '@/types';

function isTimeBasedExerciseName(name: string): boolean {
  const normalized = name.toLowerCase();
  return [
    'plank',
    'hold',
    'carry',
    'hang',
    'wall sit',
    'dead bug',
    'hollow',
    'bird dog',
  ].some((keyword) => normalized.includes(keyword));
}

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
  onOpenTimer?: (seconds: number) => void;
  defaultCollapsed?: boolean;
  onDeleteExercise?: () => void;
  onUpdateExercise?: (
    updates: Partial<Pick<Exercise, 'sets' | 'reps' | 'targetRPE'>>
  ) => void;
}

export function ExerciseCard({
  exercise,
  workoutId,
  exerciseIndex: _exerciseIndex,
  lastWeekLog,
  recommendedWeight,
  isSkipped: isSkippedProp = false, // Keep prop for backward compatibility
  onSwapClick,
  onSkipClick,
  onRestoreClick,
  onOpenTimer,
  defaultCollapsed = false,
  onDeleteExercise,
  onUpdateExercise,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cascadeWeight, setCascadeWeight] = useState<number | undefined>(undefined);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [editedSets, setEditedSets] = useState(exercise.sets);
  const [editedReps, setEditedReps] = useState(exercise.reps);
  const [editedRpe, setEditedRpe] = useState(exercise.targetRPE);
  
  const logExerciseSet = useAppStore((state) => state.logExerciseSet);
  const getSubstitution = useAppStore((state) => state.getSubstitution);
  const userSettings = useAppStore((state) => state.userSettings);
  // Subscribe directly to workoutLogs for reactivity
  const currentLog = useAppStore((state) => 
    state.workoutLogs.find((l) => l.workoutId === workoutId)
  );

  // Derive isSkipped from subscription for proper reactivity
  const isSkipped = currentLog?.skippedExercises?.includes(exercise.id) ?? isSkippedProp;

  // Check for substitution
  const substitution = getSubstitution(exercise.id);
  const displayName = substitution?.replacementName || exercise.name;
  const notesFieldId = `${workoutId}-${exercise.id}-notes`;
  const effectiveReps =
    substitution && isTimeBasedExerciseName(substitution.replacementName) && !/s|sec|min/i.test(exercise.reps)
      ? '30s'
      : exercise.reps;

  // Get exercise log from current workout log
  const exerciseLog = currentLog?.exercises.find((e) => e.exerciseId === exercise.id);

  const handleSaveEdit = () => {
    onUpdateExercise?.({
      sets: Math.max(1, Math.min(10, editedSets)),
      reps: editedReps,
      targetRPE: editedRpe,
    });
    setIsEditing(false);
  };

  const handleSetChange = useCallback((setIndex: number, setData: SetLog) => {
    logExerciseSet(workoutId, exercise.id, setIndex, setData);
  }, [logExerciseSet, workoutId, exercise.id]);

  // Handle weight change from first set - cascade if setting enabled
  const handleFirstSetWeightChange = useCallback((weight: number) => {
    if (userSettings.cascadeWeightToSets) {
      setCascadeWeight(weight);
    }
  }, [userSettings.cascadeWeightToSets]);

  // Count only the currently configured set slots (ignore stale extra logged sets).
  const scopedSets = exerciseLog?.sets.slice(0, exercise.sets) || [];
  const completedSets = scopedSets.filter((s) => s.reps > 0 && s.status !== 'skipped').length;
  const skippedSets = scopedSets.filter((s) => s.status === 'skipped').length;
  const isExerciseComplete = completedSets >= exercise.sets;
  const resolvedSets = completedSets + skippedSets;
  const isExerciseResolved = resolvedSets >= exercise.sets;
  const compactStatus = isExerciseComplete ? 'completed' : isExerciseResolved ? 'resolved' : '';
  const compactStatusBoxClass =
    compactStatus === 'completed'
      ? 'bg-success text-background border-success'
      : compactStatus === 'resolved'
        ? 'bg-background text-success border-success'
        : 'bg-background border-border text-muted';

  // If skipped, show collapsed state
  if (isSkipped) {
    return (
      <div className="border border-border/30 bg-surface/30 opacity-50">
        <div className="p-3 flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="font-mono text-xs text-muted line-through">
              {displayName}
            </span>
            <span className="font-mono text-[10px] text-muted border border-border px-1">skipped</span>
          </div>
          
          {onRestoreClick && (
            <button
              onClick={onRestoreClick}
              aria-label="Restore exercise"
              className="font-mono text-xs text-accent active:bg-accent active:text-background
                px-2 py-1 border border-accent hover:bg-accent hover:text-background transition-colors touch-manipulation"
            >
              restore
            </button>
          )}
        </div>
      </div>
    );
  }

  // Collapsed compact view
  if (isCollapsed) {
    return (
      <div 
        className={`border-l-[3px] border-l-accent/40 border cursor-pointer ${
          compactStatus === 'completed'
            ? 'border-success/40 border-l-success bg-success/5'
            : compactStatus === 'resolved'
              ? 'border-success/60 border-l-success'
              : 'border-border'
        }`}
        onClick={() => setIsCollapsed(false)}
      >
        <div className="p-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 border-2 font-mono text-xs flex items-center justify-center ${compactStatusBoxClass}`}
            >
              {compactStatus === 'completed' || compactStatus === 'resolved' ? <GeometricCheck size={13} /> : ''}
            </span>
            <span className="font-mono text-sm font-bold">{displayName}</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm text-muted">
              {completedSets}/{exercise.sets} sets finished
            </span>
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <div className={`border-2 border-l-[3px] ${
      isExerciseComplete
        ? 'border-success/40 border-l-success bg-success/5'
        : isExerciseResolved
          ? 'border-success/60 border-l-success'
          : 'border-border border-l-accent/40'
    }`}>
      {/* Compact Header */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {substitution && (
                <span className="font-mono text-[10px] text-accent">swapped</span>
              )}
              <span className="font-mono text-[10px] text-muted">tap to collapse</span>
            </div>
            <h3 className="font-mono font-bold text-base">
              {displayName}
            </h3>
            {/* Compact info line */}
            <div className="font-mono text-xs text-muted mt-0.5">
              {exercise.sets}×{effectiveReps} · rest {exercise.restSeconds}s · rpe {exercise.targetRPE === 'optional' ? '-' : exercise.targetRPE}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onOpenTimer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTimer(exercise.restSeconds > 0 ? exercise.restSeconds : 60);
                }}
                className="font-mono text-xs text-muted active:text-foreground
                  hover:text-foreground transition-colors px-2 py-1.5 border border-border text-sm touch-manipulation inline-flex items-center gap-1"
                aria-label={`Open ${exercise.restSeconds > 0 ? exercise.restSeconds : 60} second timer`}
              >
                <TimerIcon size={12} />
                {exercise.restSeconds > 0 ? `${exercise.restSeconds}s` : '60s'}
              </button>
            )}
            {onUpdateExercise && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditing) {
                    setEditedSets(exercise.sets);
                    setEditedReps(exercise.reps);
                    setEditedRpe(exercise.targetRPE);
                  }
                  setIsEditing((prev) => !prev);
                }}
                className="font-mono text-xs text-muted active:text-foreground
                  hover:text-foreground transition-colors px-2 py-1.5 border border-border text-sm touch-manipulation"
              >
                edit
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onSkipClick(); }}
              aria-label="Skip this exercise"
              className="font-mono text-sm text-muted active:text-danger
                hover:text-danger transition-colors px-2 py-1.5 border border-border hover:border-danger touch-manipulation"
            >
              skip
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="p-3 space-y-2 bg-surface/30" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min={1}
              max={10}
              value={editedSets}
              onChange={(e) => setEditedSets(parseInt(e.target.value, 10) || 1)}
              className="h-10 px-2 border-2 border-border bg-background font-mono text-sm focus:border-foreground focus:outline-none"
              aria-label="Edit sets"
            />
            <input
              type="text"
              value={editedReps}
              onChange={(e) => setEditedReps(e.target.value)}
              className="h-10 px-2 border-2 border-border bg-background font-mono text-sm focus:border-foreground focus:outline-none"
              aria-label="Edit reps"
            />
            <input
              type="text"
              value={editedRpe}
              onChange={(e) => setEditedRpe(e.target.value)}
              className="h-10 px-2 border-2 border-border bg-background font-mono text-sm focus:border-foreground focus:outline-none"
              aria-label="Edit target RPE"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
              className="flex-1 h-10 border-2 border-foreground bg-foreground text-background font-mono text-sm hover:bg-foreground/90 transition-colors touch-manipulation"
            >
              save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwapClick();
              }}
              className="h-10 px-3 border-2 border-border font-mono text-sm hover:border-foreground transition-colors touch-manipulation"
            >
              swap
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="h-10 px-3 border-2 border-border font-mono text-sm hover:border-foreground transition-colors touch-manipulation"
            >
              cancel
            </button>
            {onDeleteExercise && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="w-10 h-10 border-2 border-danger text-danger inline-flex items-center justify-center hover:bg-danger hover:text-background transition-colors touch-manipulation"
                aria-label="Delete exercise"
              >
                <TrashIcon size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sets - more compact */}
      <div className="p-3 space-y-0">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <SetInput
            key={i}
            setIndex={i}
            targetReps={effectiveReps}
            targetRPE={exercise.targetRPE}
            previousSetInExercise={i > 0 ? exerciseLog?.sets[i - 1] : undefined}
            lastWeekSet={lastWeekLog?.sets[i]}
            recommendedWeight={recommendedWeight}
            value={exerciseLog?.sets[i]}
            onChange={(setData) => handleSetChange(i, setData)}
            onWeightChange={i === 0 ? handleFirstSetWeightChange : undefined}
            cascadeWeight={i > 0 ? cascadeWeight : undefined}
            units={userSettings.units}
            showColumnLabels={i === 0}
            chipTone={isExerciseComplete ? 'complete' : 'default'}
            isRowActive={activeSetIndex === i}
            onActivateRow={() => setActiveSetIndex(i)}
          />
        ))}
      </div>

      {/* Notes toggle - minimal */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          aria-expanded={showNotes}
          aria-controls={notesFieldId}
          className={`h-9 px-3 border-2 font-mono text-xs transition-colors touch-manipulation ${
            showNotes
              ? 'border-foreground text-foreground bg-surface/40'
              : 'border-border text-muted hover:border-foreground hover:text-foreground'
          }`}
        >
          {showNotes ? '− notes' : '+ notes'}
        </button>
        
        {showNotes && (
          <textarea
            id={notesFieldId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="how did this feel?"
            className="w-full mt-2 p-2 border border-border bg-background font-mono text-sm
              focus:border-foreground focus:outline-none resize-none"
            rows={2}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {cardContent}
      {confirmDelete && onDeleteExercise && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 p-4 flex items-center justify-center"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-md border-2 border-border bg-background p-4 space-y-3"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-mono text-sm text-muted">
              are you sure you want to delete? your workout data will also be deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-10 border-2 border-border font-mono text-sm hover:border-foreground transition-colors touch-manipulation"
              >
                cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setIsEditing(false);
                  onDeleteExercise();
                }}
                className="flex-1 h-10 border-2 border-danger bg-danger text-background font-mono text-sm hover:bg-danger/90 transition-colors touch-manipulation"
              >
                yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
