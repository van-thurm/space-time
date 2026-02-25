'use client';

import { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getWorkout } from '@/data/program';
import { getCustomWorkouts } from '@/data/programs/custom';
import { getTemplate } from '@/data/program-templates';
import { calculateRecommendedWeight } from '@/lib/progression';
import { getSeedWeight } from '@/data/seed-weights';
import { clampTimerSeconds } from '@/lib/timer';
import { WarmupSection } from '@/components/workout/WarmupSection';
import { SortableExerciseList } from '@/components/workout/SortableExerciseList';
import { SwapModal } from '@/components/workout/SwapModal';
import { AddExerciseModal } from '@/components/workout/AddExerciseModal';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import type { WorkoutDay, ExerciseLog, Exercise } from '@/types';

interface WorkoutPageProps {
  params: Promise<{ weekDay: string }>;
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [swapModalExerciseId, setSwapModalExerciseId] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [confirmClearWorkout, setConfirmClearWorkout] = useState(false);
  const [confirmResetReady, setConfirmResetReady] = useState(false);
  const [copyDayStatus, setCopyDayStatus] = useState<'idle' | 'done' | 'needs_setup'>('idle');
  const [startTime] = useState(() => new Date());

  // Parse week and day from URL (format: "1-1" for week 1, day 1)
  const [weekStr, dayStr] = resolvedParams.weekDay.split('-');
  const week = parseInt(weekStr);
  const day = parseInt(dayStr) as WorkoutDay;
  
  const logWorkout = useAppStore((state) => state.logWorkout);
  const getWorkoutLog = useAppStore((state) => state.getWorkoutLog);
  const resetWorkoutLog = useAppStore((state) => state.resetWorkoutLog);
  const getLastWorkoutLog = useAppStore((state) => state.getLastWorkoutLog);
  const setCurrentWeek = useAppStore((state) => state.setCurrentWeek);
  const skipExercise = useAppStore((state) => state.skipExercise);
  const unskipExercise = useAppStore((state) => state.unskipExercise);
  const isExerciseSkipped = useAppStore((state) => state.isExerciseSkipped);
  const addExerciseToWorkout = useAppStore((state) => state.addExerciseToWorkout);
  const deleteExerciseFromWorkout = useAppStore((state) => state.deleteExerciseFromWorkout);
  const getAddedExercises = useAppStore((state) => state.getAddedExercises);
  const reorderExercises = useAppStore((state) => state.reorderExercises);
  const updateExerciseOverride = useAppStore((state) => state.updateExerciseOverride);
  const copyCustomWorkoutDayAcrossProgram = useAppStore((state) => state.copyCustomWorkoutDayAcrossProgram);
  const showSmartTimer = useAppStore((state) => state.userSettings.showRestTimer);
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;
  const totalWeeks = activeProgram?.customWeeksTotal || template?.weeksTotal || 12;
  const daysPerWeek = activeProgram?.customDaysPerWeek || template?.daysPerWeek || 4;
  const dayNameOverride = activeProgram?.workoutDayNameOverrides?.[day];

  const workout = useMemo(() => {
    if (isNaN(week) || week < 1 || week > totalWeeks || isNaN(day) || day < 1 || day > daysPerWeek) {
      return null;
    }
    if (!activeProgram) return getWorkout(week, day);
    const dayLabels =
      activeProgram.customDayLabels && activeProgram.customDayLabels.length > 0
        ? activeProgram.customDayLabels
        : Array.from({ length: daysPerWeek }, (_, i) => `day ${i + 1}`);
    const workouts = getCustomWorkouts(week, dayLabels);
    return workouts.find((w) => w.day === day) || workouts[0] || null;
  }, [activeProgram, week, day, totalWeeks, daysPerWeek]);
  const workoutId = workout?.id;

  // Subscribe directly to workoutLogs for proper reactivity
  const currentLog = useAppStore((state) =>
    workoutId ? state.workoutLogs.find((l) => l.workoutId === workoutId) : undefined
  );
  const lastWeekLog = getLastWorkoutLog(week, day);

  useEffect(() => {
    const scrollYParam = searchParams.get('scrollY');
    if (!scrollYParam) return;
    const parsed = parseInt(scrollYParam, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: parsed, behavior: 'auto' });
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  // Validate based on program
  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-muted">invalid workout</p>
          <Link href="/" className="font-sans text-sm underline mt-2 inline-block">
            back to block
          </Link>
        </div>
      </div>
    );
  }
  const openTimerWithSeconds = (seconds: number) => {
    const currentScroll = typeof window !== 'undefined' ? Math.round(window.scrollY) : 0;
    const returnTo = `/workout/${resolvedParams.weekDay}?scrollY=${currentScroll}`;
    const duration = clampTimerSeconds(seconds);
    router.push(`/timer?duration=${duration}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  const exerciseOverrides = currentLog?.exerciseOverrides || {};
  const deletedExerciseIds = currentLog?.deletedExercises || [];
  // Filter out warmup exercises, deleted exercises, and apply per-workout overrides.
  const workingExercises = workout.exercises
    .filter((exercise) => exercise.category !== 'warmup' && !deletedExerciseIds.includes(exercise.id))
    .map((exercise) => {
      const override = exerciseOverrides[exercise.id];
      return override ? { ...exercise, ...override } : exercise;
    });

  // Get list of skipped exercises for this workout
  const skippedExerciseIds = currentLog?.skippedExercises || [];

  // Get added exercises for this workout (excluding deleted ones)
  const addedExercises = getAddedExercises(workout.id).filter((e) => !deletedExerciseIds.includes(e.id));

  // Calculate progress (excluding skipped exercises, including added exercises)
  const activeExercises = workingExercises.filter((e) => !skippedExerciseIds.includes(e.id));
  const activeAddedExercises = addedExercises.filter((e) => !skippedExerciseIds.includes(e.id));
  const totalSets = activeExercises.reduce((acc, e) => acc + e.sets, 0) 
    + activeAddedExercises.reduce((acc, e) => acc + e.sets, 0);
  
  // Count completed sets for base exercises
  const baseCompletedSets = currentLog?.exercises.reduce((acc, e) => {
    // Only count sets for non-skipped base exercises
    if (skippedExerciseIds.includes(e.exerciseId)) return acc;
    // Skip added exercises (they start with 'api-' or 'custom-')
    if (e.exerciseId.startsWith('api-') || e.exerciseId.startsWith('custom-')) return acc;
    // Allow 0 weight (bodyweight exercises) - just need reps > 0
    return acc + e.sets.filter((s) => s.reps > 0 && s.status !== 'skipped').length;
  }, 0) || 0;
  
  // Count completed sets for added exercises
  const addedCompletedSets = currentLog?.exercises.reduce((acc, e) => {
    // Only count added exercises
    if (!e.exerciseId.startsWith('api-') && !e.exerciseId.startsWith('custom-')) return acc;
    if (skippedExerciseIds.includes(e.exerciseId)) return acc;
    return acc + e.sets.filter((s) => s.reps > 0 && s.status !== 'skipped').length;
  }, 0) || 0;
  
  const completedSets = baseCompletedSets + addedCompletedSets;
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  // Check if all exercises are complete or skipped (for save & exit prompt)
  const allExercisesDone = progressPercent >= 100 || (totalSets > 0 && completedSets >= totalSets);
  const isWorkoutCompleted = Boolean(currentLog?.completed);

  // Get last week's log for a specific exercise
  const getLastExerciseLog = (exerciseId: string): ExerciseLog | undefined => {
    if (!lastWeekLog) return undefined;
    
    // Match by exact id first, then by shared slot suffix for week-scoped ids.
    const slot = exerciseId.split('-').pop() || exerciseId;

    return lastWeekLog.exercises.find(
      (exerciseLog) =>
        exerciseLog.exerciseId === exerciseId ||
        exerciseLog.exerciseId === slot ||
        exerciseLog.exerciseId.endsWith(`-${slot}`)
    );
  };

  // Get recommended weight for an exercise
  const getRecommendedWeight = (exercise: Exercise): number | undefined => {
    const byIdOrSlotLog = getLastExerciseLog(exercise.id);
    const currentExerciseIndex = workingExercises.findIndex((item) => item.id === exercise.id);
    const byIndexLog =
      !byIdOrSlotLog && currentExerciseIndex >= 0 ? lastWeekLog?.exercises[currentExerciseIndex] : undefined;
    const lastLog = byIdOrSlotLog || byIndexLog;
    
    // Prefer the best prior successful load for the same exercise slot.
    if (lastLog && lastLog.sets.some(s => s.weight > 0)) {
      const maxPriorWeight = Math.max(...lastLog.sets.map((set) => set.weight || 0));
      if (maxPriorWeight > 0) return maxPriorWeight;
    }
    
    // For week 1 or no prior data, use personalized seed weights
    const seedWeight = getSeedWeight(day, exercise.id);
    if (seedWeight !== undefined && seedWeight > 0) {
      return seedWeight;
    }
    
    // Fallback to progression algorithm
    const result = calculateRecommendedWeight(exercise, week, lastLog);
    return result.recommendedWeight > 0 ? result.recommendedWeight : undefined;
  };

  // Complete workout
  const handleComplete = () => {
    // Read fresh log at click time to avoid stale data
    const freshLog = getWorkoutLog(workout.id);
    const updatedLog = {
      workoutId: workout.id,
      date: startTime.toISOString(),
      exercises: freshLog?.exercises || [],
      completed: true,
      skippedExercises: freshLog?.skippedExercises,
      addedExercises: freshLog?.addedExercises,
      exerciseOrder: freshLog?.exerciseOrder,
    };
    
    logWorkout(updatedLog);
    setCurrentWeek(week);
    const startedAt = startTime.getTime();
    const completedAt = Date.now();
    router.push(`/workout/${resolvedParams.weekDay}/complete?startedAt=${startedAt}&completedAt=${completedAt}`);
  };

  // Save and exit - prompt to complete if all done
  const handleSaveExit = () => {
    // Read fresh log at click time to avoid stale data
    const freshLog = getWorkoutLog(workout.id);
    
    // If all exercises are done, ask user if they want to mark complete
    if (allExercisesDone && completedSets > 0) {
      const shouldComplete = window.confirm(
        'All exercises are done! Mark workout as complete?'
      );
      if (shouldComplete) {
        handleComplete();
        return;
      }
    }
    
    // Preserve existing completion state when exiting.
    // This prevents "view completed workout" from unintentionally downgrading status.
    if (freshLog) logWorkout(freshLog);
    router.push('/');
  };

  const handleUnfinishWorkout = () => {
    const freshLog = getWorkoutLog(workout.id);
    if (!freshLog) return;
    logWorkout({ ...freshLog, completed: false });
  };

  const handleClearWorkoutProgress = () => {
    setConfirmResetReady(false);
    setConfirmClearWorkout(true);
  };

  const handleConfirmClearWorkout = () => {
    // True reset to ready state: remove the workout log entirely.
    resetWorkoutLog(workout.id);
    setConfirmClearWorkout(false);
  };

  const handleResetToReady = () => {
    setConfirmClearWorkout(false);
    setConfirmResetReady(true);
  };

  const handleConfirmResetToReady = () => {
    resetWorkoutLog(workout.id);
    setConfirmResetReady(false);
    setConfirmClearWorkout(false);
  };

  const handleCopyDayAcrossBlock = () => {
    const copied = copyCustomWorkoutDayAcrossProgram(workout.id);
    setCopyDayStatus(copied ? 'done' : 'needs_setup');
    setTimeout(() => setCopyDayStatus('idle'), 1600);
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <SecondaryPageHeader
        subtitle="workout"
        backFallbackHref="/"
      />

      <section className="max-w-2xl mx-auto px-4 pt-3">
        <div className="px-1 py-1.5 space-y-2">
          <h1 className="font-display text-lg">{activeProgram?.name || 'my block'}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-8 px-3 inline-flex items-center border border-border bg-surface/60 font-sans text-xs uppercase tracking-wide text-muted">
              week {week}
            </span>
            <span className="h-8 px-3 inline-flex items-center border border-border bg-surface/60 font-sans text-xs uppercase tracking-wide text-muted">
              {dayNameOverride || workout.dayName || `day ${day}`}
            </span>
          </div>
        </div>
      </section>

      {/* Header progress bar */}
      <div className="max-w-2xl mx-auto px-4 pt-3">
        <div className="flex justify-between text-xs font-sans text-muted mb-1">
          <span>progress</span>
          <span className="tabular-nums">{completedSets}/{totalSets} sets</span>
        </div>
        <div className="h-1 bg-surface w-full">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Warmup */}
        <WarmupSection />

        {/* Working exercises with drag-and-drop reordering */}
        <SortableExerciseList
          exercises={workingExercises}
          addedExercises={addedExercises}
          workoutId={workout.id}
          skippedExerciseIds={skippedExerciseIds}
          savedExerciseOrder={currentLog?.exerciseOrder}
          getLastExerciseLog={getLastExerciseLog}
          getRecommendedWeight={getRecommendedWeight}
          isExerciseSkipped={isExerciseSkipped}
          onSwapClick={(id) => setSwapModalExerciseId(id)}
          onSkipClick={(id) => skipExercise(workout.id, id)}
          onRestoreClick={(id) => unskipExercise(workout.id, id)}
          onSkipAddedClick={(id) => skipExercise(workout.id, id)}
          onRestoreAddedClick={(id) => unskipExercise(workout.id, id)}
          onOpenTimer={showSmartTimer ? openTimerWithSeconds : undefined}
          onDeleteExercise={(id) => deleteExerciseFromWorkout(workout.id, id)}
          onDeleteAddedExercise={(id) => deleteExerciseFromWorkout(workout.id, id)}
          onUpdateExercise={(exerciseId, updates) => updateExerciseOverride(workout.id, exerciseId, updates)}
          onReorder={(order) => reorderExercises(workout.id, order)}
        />

        {activeProgram && (
          <div className="flex justify-end">
            <button
              onClick={handleCopyDayAcrossBlock}
              className={`min-h-11 px-4 border font-sans text-sm transition-colors touch-manipulation ${
                copyDayStatus === 'done'
                  ? 'border-success text-success bg-success/10'
                  : copyDayStatus === 'needs_setup'
                    ? 'border-danger text-danger'
                    : 'border-border text-muted hover:border-foreground hover:text-foreground'
              }`}
            >
              {copyDayStatus === 'done'
                ? 'copied across block'
                : copyDayStatus === 'needs_setup'
                  ? 'add exercises first'
                  : 'copy this day across block'}
            </button>
          </div>
        )}

        {/* Add exercise button */}
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full py-4 border border-dashed border-border hover:border-accent 
            text-muted hover:text-accent active:bg-accent/10 font-sans text-sm
            transition-colors touch-manipulation flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>add exercise</span>
        </button>

        {currentLog && (
          <div className="pt-1">
            {!confirmClearWorkout ? (
              <button
                onClick={handleClearWorkoutProgress}
                className="w-full py-2.5 px-4 border border-danger/70 text-muted font-sans text-xs uppercase tracking-wide
                  hover:border-danger hover:text-danger transition-colors touch-manipulation"
              >
                clear workout
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClearWorkout(false)}
                  className="flex-1 py-2.5 px-3 border border-border font-sans text-xs text-muted
                    hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                >
                  cancel clear
                </button>
                <button
                  onClick={handleConfirmClearWorkout}
                  className="flex-1 py-2.5 px-3 border border-danger bg-danger text-background font-sans text-xs
                    hover:bg-danger/90 transition-colors touch-manipulation"
                >
                  yes, clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions - inverse colors for contrast */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-foreground border-t border-background/20">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] space-y-2">
          {!isWorkoutCompleted ? (
            <div className="flex gap-3">
              <button
                onClick={handleSaveExit}
                className="flex-1 py-3 px-4 border border-background/30 text-background font-sans font-medium 
                  hover:bg-background/10 active:bg-background/20 transition-colors touch-manipulation"
              >
                save & exit
              </button>
              <button
                onClick={handleComplete}
                disabled={totalSets === 0 || completedSets === 0}
                className="flex-1 py-3 px-4 bg-background text-foreground font-sans font-medium 
                  hover:bg-background/90 active:bg-success active:text-background transition-colors touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                complete
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <button
                  onClick={handleUnfinishWorkout}
                  className="flex-1 py-3 px-4 border border-background/30 text-background font-sans font-medium 
                    hover:bg-background/10 active:bg-background/20 transition-colors touch-manipulation"
                >
                  mark as unfinished
                </button>
                {!confirmResetReady ? (
                  <button
                    onClick={handleResetToReady}
                    className="flex-1 py-3 px-4 border border-background/30 text-background font-sans font-medium 
                      hover:bg-background/10 active:bg-background/20 transition-colors touch-manipulation"
                  >
                    clear + reset to ready
                  </button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => setConfirmResetReady(false)}
                      className="flex-1 py-3 px-2 border border-background/30 text-background font-sans text-xs
                        hover:bg-background/10 transition-colors touch-manipulation"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleConfirmResetToReady}
                      className="flex-1 py-3 px-2 border border-background bg-background text-foreground font-sans text-xs
                        hover:bg-background/90 transition-colors touch-manipulation"
                    >
                      confirm
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full h-0" />
            </>
          )}
        </div>
      </footer>

      {/* Swap modal */}
      {swapModalExerciseId && (() => {
        const exerciseToSwap = workingExercises.find((e) => e.id === swapModalExerciseId);
        if (!exerciseToSwap) return null;
        return (
          <SwapModal
            exercise={exerciseToSwap}
            onClose={() => setSwapModalExerciseId(null)}
          />
        );
      })()}

      {/* Add exercise modal */}
      {showAddExerciseModal && (
        <AddExerciseModal
          onAdd={(exercise) => addExerciseToWorkout(workout.id, exercise)}
          onClose={() => setShowAddExerciseModal(false)}
        />
      )}
    </main>
  );
}
