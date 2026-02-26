'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseCard } from './ExerciseCard';
import { AddedExerciseCard } from './AddedExerciseCard';
import type { Exercise, ExerciseLog, AddedExercise } from '@/types';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  editMode: boolean;
}

function SortableItem({ id, children, editMode }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style = editMode ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  if (!editMode) {
    // Normal mode - no drag functionality, just render children
    return <div>{children}</div>;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative">
        {/* Drag handle - only shown in edit mode */}
        <button
          {...listeners}
          className="absolute -left-2 top-4 w-8 h-8 flex items-center justify-center
            text-accent hover:text-foreground cursor-grab active:cursor-grabbing
            touch-manipulation z-10 bg-background border border-accent"
          aria-label="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </button>
        <div className="ml-6">{children}</div>
      </div>
    </div>
  );
}

interface SortableExerciseListProps {
  exercises: Exercise[];
  addedExercises: AddedExercise[];
  workoutId: string;
  skippedExerciseIds: string[];
  savedExerciseOrder?: string[];
  getLastExerciseLog: (exerciseId: string) => ExerciseLog | undefined;
  getRecommendedWeight: (exercise: Exercise) => number | undefined;
  isExerciseSkipped: (workoutId: string, exerciseId: string) => boolean;
  onSwapClick: (exerciseId: string) => void;
  onSwapAddedClick?: (exerciseId: string) => void;
  onSkipClick: (exerciseId: string) => void;
  onRestoreClick: (exerciseId: string) => void;
  onSkipAddedClick?: (exerciseId: string) => void;
  onRestoreAddedClick?: (exerciseId: string) => void;
  onOpenTimer?: (seconds: number) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onDeleteAddedExercise: (exerciseId: string) => void;
  onUpdateExercise: (
    exerciseId: string,
    updates: Partial<Pick<Exercise, 'sets' | 'reps' | 'targetRPE' | 'restSeconds'>>
  ) => void;
  onReorder: (exerciseOrder: string[]) => void;
}

export function SortableExerciseList({
  exercises,
  addedExercises,
  workoutId,
  skippedExerciseIds: _skippedExerciseIds,
  savedExerciseOrder,
  getLastExerciseLog,
  getRecommendedWeight,
  isExerciseSkipped,
  onSwapClick,
  onSwapAddedClick,
  onSkipClick,
  onRestoreClick,
  onSkipAddedClick,
  onRestoreAddedClick,
  onOpenTimer,
  onDeleteExercise,
  onDeleteAddedExercise,
  onUpdateExercise,
  onReorder,
}: SortableExerciseListProps) {
  const [editMode, setEditMode] = useState(false);
  const [collapseAllToken, setCollapseAllToken] = useState(0);
  
  // Combine all exercise IDs
  const allExerciseIds = [
    ...exercises.map(e => e.id),
    ...addedExercises.map(e => e.id),
  ];

  // Apply saved order: put saved IDs first (in saved order), then append any new IDs
  const initialOrder = (() => {
    if (!savedExerciseOrder || savedExerciseOrder.length === 0) return allExerciseIds;
    const validSaved = savedExerciseOrder.filter((id) => allExerciseIds.includes(id));
    const remaining = allExerciseIds.filter((id) => !validSaved.includes(id));
    return [...validSaved, ...remaining];
  })();

  const [orderedIds, setOrderedIds] = useState<string[]>(initialOrder);

  // Update orderedIds when exercises change (additions/removals)
  const currentIds = allExerciseIds.join(',');
  const orderedValid = orderedIds.filter((id) => allExerciseIds.includes(id));
  if (orderedValid.length !== orderedIds.length || allExerciseIds.some((id) => !orderedIds.includes(id))) {
    const remaining = allExerciseIds.filter((id) => !orderedValid.includes(id));
    const next = [...orderedValid, ...remaining];
    if (next.join(',') !== orderedIds.join(',')) {
      setOrderedIds(next);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedIds.indexOf(active.id as string);
      const newIndex = orderedIds.indexOf(over.id as string);
      
      const newOrder = arrayMove(orderedIds, oldIndex, newIndex);
      setOrderedIds(newOrder);
      onReorder(newOrder);
    }
  };

  // Merge all exercises in order
  const allItems: { type: 'exercise' | 'added'; id: string; data: Exercise | AddedExercise }[] = [];
  
  for (const id of orderedIds) {
    const exercise = exercises.find(e => e.id === id);
    if (exercise) {
      allItems.push({ type: 'exercise', id, data: exercise });
      continue;
    }
    const added = addedExercises.find(e => e.id === id);
    if (added) {
      allItems.push({ type: 'added', id, data: added });
    }
  }

  // Add any new exercises not in orderedIds
  for (const exercise of exercises) {
    if (!orderedIds.includes(exercise.id)) {
      allItems.push({ type: 'exercise', id: exercise.id, data: exercise });
    }
  }
  for (const added of addedExercises) {
    if (!orderedIds.includes(added.id)) {
      allItems.push({ type: 'added', id: added.id, data: added });
    }
  }

  return (
    <div className="space-y-4">
      {/* Edit mode toggle */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setCollapseAllToken((value) => value + 1)}
          className="px-3 py-2 font-sans text-sm border transition-colors touch-manipulation border-border text-muted hover:border-foreground hover:text-foreground"
        >
          collapse all
        </button>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-3 py-2 font-sans text-sm border transition-colors touch-manipulation
            ${editMode 
              ? 'border-accent text-accent bg-accent/10' 
              : 'border-border text-muted hover:border-foreground hover:text-foreground'
            }`}
        >
          {editMode ? 'done editing' : 'reorder'}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {allItems.map((item, index) => (
              <SortableItem key={`${item.id}-${collapseAllToken}`} id={item.id} editMode={editMode}>
                {item.type === 'exercise' ? (
                  <ExerciseCard
                    exercise={item.data as Exercise}
                    workoutId={workoutId}
                    exerciseIndex={index}
                    lastWeekLog={getLastExerciseLog(item.id)}
                    recommendedWeight={getRecommendedWeight(item.data as Exercise)}
                    isSkipped={isExerciseSkipped(workoutId, item.id)}
                    onSwapClick={() => onSwapClick(item.id)}
                    onSkipClick={() => onSkipClick(item.id)}
                    onRestoreClick={() => onRestoreClick(item.id)}
                    onOpenTimer={onOpenTimer}
                    defaultCollapsed={collapseAllToken > 0}
                    onDeleteExercise={() => onDeleteExercise(item.id)}
                    onUpdateExercise={(updates) => onUpdateExercise(item.id, updates)}
                  />
                ) : (
                  <AddedExerciseCard
                    exercise={item.data as AddedExercise}
                    workoutId={workoutId}
                    exerciseIndex={index}
                    isSkipped={isExerciseSkipped(workoutId, item.id)}
                    onSkipClick={onSkipAddedClick ? () => onSkipAddedClick(item.id) : undefined}
                    onRestoreClick={onRestoreAddedClick ? () => onRestoreAddedClick(item.id) : undefined}
                    onOpenTimer={onOpenTimer}
                    defaultCollapsed={collapseAllToken > 0}
                    onDeleteExercise={() => onDeleteAddedExercise(item.id)}
                    onSwap={onSwapAddedClick ? () => onSwapAddedClick(item.id) : undefined}
                  />
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
