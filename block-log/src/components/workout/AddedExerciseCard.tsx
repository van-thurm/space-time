'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { SetInput } from './SetInput';
import { GeometricCheck, TimerIcon, TrashIcon } from '@/components/ui/DieterIcons';
import type { AddedExercise, SetLog } from '@/types';

interface AddedExerciseCardProps {
  exercise: AddedExercise;
  workoutId: string;
  exerciseIndex: number;
  isSkipped?: boolean;
  onSkipClick?: () => void;
  onRestoreClick?: () => void;
  onOpenTimer?: (seconds: number) => void;
  onDeleteExercise: () => void;
  defaultCollapsed?: boolean;
  onSwap?: () => void;
}

export function AddedExerciseCard({
  exercise,
  workoutId,
  exerciseIndex,
  isSkipped = false,
  onSkipClick,
  onRestoreClick,
  onOpenTimer,
  onDeleteExercise,
  defaultCollapsed = false,
  onSwap,
}: AddedExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [cascadeWeight, setCascadeWeight] = useState<number | undefined>(undefined);
  const [editedSets, setEditedSets] = useState(exercise.sets);
  const [editedReps, setEditedReps] = useState(exercise.reps);
  const [editedRPE, setEditedRPE] = useState(exercise.targetRPE);
  const [editedRestSeconds, setEditedRestSeconds] = useState(exercise.restSeconds);
  const notesFieldId = `${workoutId}-${exercise.id}-notes`;
  
  const logExerciseSet = useAppStore((state) => state.logExerciseSet);
  const updateAddedExercise = useAppStore((state) => state.updateAddedExercise);
  const userSettings = useAppStore((state) => state.userSettings);
  // Subscribe directly to workoutLogs for reactivity
  const currentLog = useAppStore((state) => 
    state.workoutLogs.find((l) => l.workoutId === workoutId)
  );

  const handleSaveEdit = () => {
    updateAddedExercise(workoutId, exercise.id, {
      sets: editedSets,
      reps: editedReps,
      targetRPE: editedRPE,
      restSeconds: Math.max(5, Math.min(600, editedRestSeconds)),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedSets(exercise.sets);
    setEditedReps(exercise.reps);
    setEditedRPE(exercise.targetRPE);
    setEditedRestSeconds(exercise.restSeconds);
    setIsEditing(false);
  };

  // Get exercise log from current workout log
  const exerciseLog = currentLog?.exercises.find((e) => e.exerciseId === exercise.id);

  const handleSetChange = (setIndex: number, setData: SetLog) => {
    logExerciseSet(workoutId, exercise.id, setIndex, setData);
  };

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

  if (isSkipped) {
    return (
      <div className="border border-border/30 bg-surface/30 opacity-50">
        <div className="p-3 flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="font-mono text-xs text-muted line-through">{exercise.name}</span>
            <span className="font-mono text-[10px] text-muted border border-border px-1">skipped</span>
          </div>
          {onRestoreClick && (
            <button
              onClick={onRestoreClick}
              className="font-mono text-xs text-accent active:bg-accent active:text-background
                px-2 py-1 border border-accent hover:bg-accent hover:text-background transition-colors touch-manipulation"
            >
              restore exercise
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div
        className={`border-l-[3px] border-l-accent/60 border cursor-pointer ${
          compactStatus === 'completed'
            ? 'border-success/40 border-l-success bg-success/5'
            : compactStatus === 'resolved'
              ? 'border-success/60 border-l-success'
              : 'border-accent/40'
        }`}
        onClick={() => setIsCollapsed(false)}
      >
        <div className="p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 border-2 font-mono text-xs inline-flex items-center justify-center ${compactStatusBoxClass}`}>
              {compactStatus === 'completed' || compactStatus === 'resolved' ? <GeometricCheck size={13} /> : ''}
            </span>
            <span className="font-mono text-[10px] uppercase text-accent">added</span>
            <span className="font-mono text-sm font-bold">{exercise.name}</span>
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
    <div className={`border-2 border-dashed border-l-[3px] ${
      isExerciseComplete
        ? 'border-success/50 border-l-success bg-success/5'
        : isExerciseResolved
          ? 'border-success/60 border-l-success'
          : 'border-accent/50 border-l-accent'
    }`}>
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={() => setIsCollapsed(true)}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-muted">tap to collapse</span>
            </div>
            <h3 className="font-mono font-bold text-lg mt-1">
              {exercise.name}
            </h3>
          </div>
          
          <div className="flex gap-1">
            {onOpenTimer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTimer(exercise.restSeconds > 0 ? exercise.restSeconds : 60);
                }}
                className="px-2 h-8 flex items-center justify-center font-mono text-xs text-muted
                  border border-border text-sm hover:border-foreground hover:text-foreground
                  active:bg-foreground active:text-background transition-colors touch-manipulation gap-1"
                aria-label={`Open ${exercise.restSeconds > 0 ? exercise.restSeconds : 60} second timer`}
              >
                <TimerIcon size={12} />
                {exercise.restSeconds > 0 ? `${exercise.restSeconds}s` : '60s'}
              </button>
            )}
            {onSkipClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSkipClick();
                }}
                aria-label="Skip this exercise"
                className="px-2 h-8 flex items-center justify-center font-mono text-sm text-muted
                  border border-border hover:border-danger hover:text-danger
                  active:text-danger transition-colors touch-manipulation"
              >
                skip
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing) {
                  setEditedSets(exercise.sets);
                  setEditedReps(exercise.reps);
                  setEditedRPE(exercise.targetRPE);
                  setEditedRestSeconds(exercise.restSeconds);
                }
                setIsEditing(!isEditing);
              }}
              aria-label="Edit this exercise"
              className="w-8 h-8 flex items-center justify-center text-muted 
                border border-border hover:border-accent hover:text-accent 
                active:bg-accent active:text-background transition-colors touch-manipulation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M4 20h4l10-10-4-4L4 16v4z" />
                <path d="M13.5 6.5l4 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Edit mode */}
        {isEditing ? (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="font-mono text-xs text-muted">sets</label>
                <input
                  type="number"
                  value={editedSets}
                  onChange={(e) => setEditedSets(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="w-full h-10 px-2 border-2 border-border bg-background font-mono text-sm
                    focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted">reps</label>
                <input
                  type="text"
                  value={editedReps}
                  onChange={(e) => setEditedReps(e.target.value)}
                  placeholder="8-10"
                  className="w-full h-10 px-2 border-2 border-border bg-background font-mono text-sm
                    focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted">rpe</label>
                <input
                  type="text"
                  value={editedRPE}
                  onChange={(e) => setEditedRPE(e.target.value)}
                  placeholder="7-8"
                  className="w-full h-10 px-2 border-2 border-border bg-background font-mono text-sm
                    focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted">rest</label>
                <input
                  type="number"
                  value={editedRestSeconds}
                  onChange={(e) => setEditedRestSeconds(parseInt(e.target.value, 10) || 0)}
                  min={5}
                  max={600}
                  className="w-full h-10 px-2 border-2 border-border bg-background font-mono text-sm
                    focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
                className="flex-1 py-2 bg-accent text-background font-mono text-sm
                  hover:bg-accent/90 transition-colors touch-manipulation"
              >
                save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="py-2 px-4 border border-border font-mono text-sm
                  hover:border-foreground transition-colors touch-manipulation"
              >
                cancel
              </button>
            {onSwap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
                className="py-2 px-4 border border-border font-mono text-sm
                  hover:border-foreground transition-colors touch-manipulation"
              >
                swap
              </button>
            )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmRemove(true);
                }}
                className="w-10 h-10 border-2 border-danger text-danger inline-flex items-center justify-center
                  hover:bg-danger hover:text-background transition-colors touch-manipulation"
                aria-label="Delete added exercise"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Exercise info */
          <div className="flex flex-wrap gap-3 mt-2 font-mono text-sm text-muted">
            <span>{exercise.sets} sets × {exercise.reps}</span>
            <span>rest {exercise.restSeconds}s</span>
            <span>rpe {exercise.targetRPE}</span>
          </div>
        )}
      </div>

      {/* Sets - use editedSets if editing, otherwise exercise.sets */}
      <div className="p-4 space-y-1">
        {Array.from({ length: isEditing ? editedSets : exercise.sets }, (_, i) => (
          <SetInput
            key={i}
            setIndex={i}
            targetReps={isEditing ? editedReps : exercise.reps}
            targetRPE={isEditing ? editedRPE : exercise.targetRPE}
            previousSetInExercise={i > 0 ? exerciseLog?.sets[i - 1] : undefined}
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

      {/* Notes toggle */}
      <div className="px-4 pb-4">
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
            className="w-full mt-2 p-2 border-2 border-border bg-background font-mono text-sm
              focus:border-foreground focus:outline-none resize-none"
            rows={2}
          />
        )}
      </div>

      {confirmRemove && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 p-4 flex items-center justify-center"
          onClick={() => setConfirmRemove(false)}
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
                onClick={() => setConfirmRemove(false)}
                className="flex-1 h-10 border-2 border-border font-mono text-sm hover:border-foreground transition-colors touch-manipulation"
              >
                cancel
              </button>
              <button
                onClick={() => {
                  setConfirmRemove(false);
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
    </div>
  );

  return cardContent;
}
