'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getWorkout, isDeloadWeek, getCurrentPhase } from '@/data/program';
import { calculateRecommendedWeight } from '@/lib/progression';
import { getSeedWeight } from '@/data/seed-weights';
import { WarmupSection } from '@/components/workout/WarmupSection';
import { SortableExerciseList } from '@/components/workout/SortableExerciseList';
import { SwapModal } from '@/components/workout/SwapModal';
import { AddExerciseModal } from '@/components/workout/AddExerciseModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DialIcon } from '@/components/ui/DieterIcons';
import type { WorkoutDay, ExerciseLog, Exercise, AddedExercise } from '@/types';

interface WorkoutPageProps {
  params: Promise<{ weekDay: string }>;
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [swapModalExerciseId, setSwapModalExerciseId] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [startTime] = useState(() => new Date());

  // Parse week and day from URL (format: "1-1" for week 1, day 1)
  const [weekStr, dayStr] = resolvedParams.weekDay.split('-');
  const week = parseInt(weekStr);
  const day = parseInt(dayStr) as WorkoutDay;

  // Validate
  if (isNaN(week) || week < 1 || week > 12 || isNaN(day) || day < 1 || day > 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-muted">invalid workout</p>
          <Link href="/" className="font-mono text-sm underline mt-2 inline-block">
            ← back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const workout = getWorkout(week, day);
  const phase = getCurrentPhase(week);
  const isDeload = isDeloadWeek(week);

  const logWorkout = useAppStore((state) => state.logWorkout);
  const getWorkoutLog = useAppStore((state) => state.getWorkoutLog);
  const getLastWorkoutLog = useAppStore((state) => state.getLastWorkoutLog);
  const setCurrentWeek = useAppStore((state) => state.setCurrentWeek);
  const skipExercise = useAppStore((state) => state.skipExercise);
  const unskipExercise = useAppStore((state) => state.unskipExercise);
  const isExerciseSkipped = useAppStore((state) => state.isExerciseSkipped);
  const addExerciseToWorkout = useAppStore((state) => state.addExerciseToWorkout);
  const removeAddedExercise = useAppStore((state) => state.removeAddedExercise);
  const getAddedExercises = useAppStore((state) => state.getAddedExercises);
  const reorderExercises = useAppStore((state) => state.reorderExercises);

  const currentLog = getWorkoutLog(workout.id);
  const lastWeekLog = getLastWorkoutLog(week, day);

  // Filter out warmup exercises (handled separately)
  const workingExercises = workout.exercises.filter((e) => e.category !== 'warmup');

  // Get list of skipped exercises for this workout
  const skippedExerciseIds = currentLog?.skippedExercises || [];

  // Get added exercises for this workout
  const addedExercises = getAddedExercises(workout.id);

  // Calculate progress (excluding skipped exercises, including added exercises)
  const activeExercises = workingExercises.filter((e) => !skippedExerciseIds.includes(e.id));
  const totalSets = activeExercises.reduce((acc, e) => acc + e.sets, 0) 
    + addedExercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSets = currentLog?.exercises.reduce((acc, e) => {
    // Only count sets for non-skipped exercises
    if (skippedExerciseIds.includes(e.exerciseId)) return acc;
    return acc + e.sets.filter((s) => s.weight > 0 && s.reps > 0).length;
  }, 0) || 0;

  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Get last week's log for a specific exercise
  const getLastExerciseLog = (exerciseId: string): ExerciseLog | undefined => {
    if (!lastWeekLog) return undefined;
    
    // Extract the exercise slot (e.g., "main" from "w1d1-main")
    const slot = exerciseId.split('-').pop();
    
    return lastWeekLog.exercises.find((e) => e.exerciseId.endsWith(`-${slot}`));
  };

  // Get recommended weight for an exercise
  const getRecommendedWeight = (exercise: Exercise): number | undefined => {
    const lastLog = getLastExerciseLog(exercise.id);
    
    // If we have last week's data, use progression algorithm
    if (lastLog && lastLog.sets.some(s => s.weight > 0)) {
      const result = calculateRecommendedWeight(exercise, week, lastLog);
      return result.recommendedWeight > 0 ? result.recommendedWeight : undefined;
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
    const updatedLog = {
      workoutId: workout.id,
      date: startTime.toISOString(),
      exercises: currentLog?.exercises || [],
      completed: true,
    };
    
    logWorkout(updatedLog);
    setCurrentWeek(week);
    router.push('/');
  };

  // Save and exit
  const handleSaveExit = () => {
    if (currentLog) {
      logWorkout({
        ...currentLog,
        completed: false,
      });
    }
    router.push('/');
  };

  // Calculate elapsed time
  const [elapsed, setElapsed] = useState('0:00');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b-2 border-border sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="font-mono text-sm text-muted hover:text-foreground">
              ← back
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted tabular-nums">{elapsed}</span>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-3">
            <DialIcon size={32} progress={progressPercent / 100} className="text-foreground" />
            <div>
              <h1 className="font-pixel font-bold text-lg">
                week {week} · day {day}
              </h1>
              <p className="font-mono text-sm text-muted">
                {workout.dayName}
              </p>
            </div>
          </div>

          {/* Phase / deload indicator */}
          <div className="flex gap-2 mt-2">
            <span className="font-mono text-xs text-muted">{phase.name}</span>
            {isDeload && (
              <span className="bg-accent text-background px-2 py-0.5 text-xs font-mono">
                deload
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs font-mono text-muted mb-1">
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
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Warmup */}
        <WarmupSection />

        {/* Working exercises with drag-and-drop reordering */}
        <SortableExerciseList
          exercises={workingExercises}
          addedExercises={addedExercises}
          workoutId={workout.id}
          skippedExerciseIds={skippedExerciseIds}
          getLastExerciseLog={getLastExerciseLog}
          getRecommendedWeight={getRecommendedWeight}
          isExerciseSkipped={isExerciseSkipped}
          onSwapClick={(id) => setSwapModalExerciseId(id)}
          onSkipClick={(id) => skipExercise(workout.id, id)}
          onRestoreClick={(id) => unskipExercise(workout.id, id)}
          onRemoveAdded={(id) => removeAddedExercise(workout.id, id)}
          onReorder={(order) => reorderExercises(workout.id, order)}
        />

        {/* Add exercise button */}
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full py-4 border-2 border-dashed border-border hover:border-accent 
            text-muted hover:text-accent active:bg-accent/10 font-mono text-sm
            transition-colors touch-manipulation flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>add exercise</span>
        </button>
      </div>

      {/* Footer actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-4">
          <button
            onClick={handleSaveExit}
            className="flex-1 py-3 px-4 border-2 border-border font-mono font-medium hover:border-foreground transition-colors"
          >
            save & exit
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-3 px-4 bg-foreground text-background font-mono font-medium hover:bg-foreground/90 transition-colors"
          >
            complete workout
          </button>
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
