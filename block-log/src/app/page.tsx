'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { getWeekWorkouts } from '@/data/program';
import { getProgramWorkouts } from '@/data/programs';
import { getCustomWorkouts } from '@/data/programs/custom';
import { WeekSelector } from '@/components/dashboard/WeekSelector';
import { WorkoutCard } from '@/components/dashboard/WorkoutCard';
import { ProgressSummary } from '@/components/dashboard/ProgressSummary';
import { AppFooter } from '@/components/ui/AppFooter';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import Link from 'next/link';

export default function Dashboard() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const programs = useAppStore((state) => state.programs);
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const migrateToMultiProgram = useAppStore((state) => state.migrateToMultiProgram);
  
  // Get workouts based on active program's template
  const workouts = useMemo(() => {
    if (!activeProgram) return getWeekWorkouts(currentWeek);
    if (activeProgram.templateId === 'custom') {
      const dayLabels =
        activeProgram.customDayLabels && activeProgram.customDayLabels.length > 0
          ? activeProgram.customDayLabels
          : ['day 1', 'day 2', 'day 3', 'day 4'];
      return getCustomWorkouts(currentWeek, dayLabels);
    }
    const baseWorkouts =
      activeProgram.templateId !== '4-day-upper-lower'
        ? getProgramWorkouts(activeProgram.templateId, currentWeek)
        : getWeekWorkouts(currentWeek);
    const targetDays = activeProgram.customDaysPerWeek || baseWorkouts.length;
    if (targetDays <= baseWorkouts.length) return baseWorkouts;
    const dayLabels = activeProgram.customDayLabels || [];
    const extra = Array.from({ length: targetDays - baseWorkouts.length }, (_, idx) => {
      const day = baseWorkouts.length + idx + 1;
      return {
        id: `week${currentWeek}-day${day}`,
        week: currentWeek,
        day: day as 1 | 2 | 3 | 4 | 5,
        dayName: dayLabels[day - 1] || `day ${day}`,
        exercises: [],
        estimatedDuration: 45,
      };
    });
    return [...baseWorkouts, ...extra];
  }, [activeProgram, currentWeek]);

  // Auto-migrate legacy data on first load
  useEffect(() => {
    migrateToMultiProgram();
  }, [migrateToMultiProgram]);
  
  const applyWorkoutOverrides = (day: number, fallbackName: string): string => {
    const override = activeProgram?.workoutDayNameOverrides?.[day];
    return override?.trim() ? override : fallbackName;
  };

  const dayOrder = useMemo(() => {
    const fallback = workouts.map((workout) => Number(workout.day));
    if (!activeProgram?.workoutDayOrder || activeProgram.workoutDayOrder.length === 0) {
      return fallback;
    }
    const valid = activeProgram.workoutDayOrder.filter((day) => fallback.includes(Number(day)));
    const missing = fallback.filter((day) => !valid.includes(day));
    return [...valid, ...missing];
  }, [activeProgram?.workoutDayOrder, workouts]);

  const orderedWorkouts = useMemo(() => {
    const withOverrides = workouts.map((workout) => ({
      ...workout,
      dayName: applyWorkoutOverrides(workout.day, workout.dayName),
    }));
    return [...withOverrides].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  }, [workouts, dayOrder]);

  const hasPrograms = programs.some((program) => !program.isArchived);
  const hasActiveProgram = Boolean(activeProgram);

  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader
        subtitle={hasActiveProgram ? 'block' : 'no active block'}
        backFallbackHref="/"
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {!hasPrograms || !hasActiveProgram ? (
          <section className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm">
              <h2 className="font-mono text-lg">no block yet</h2>
              <p className="font-mono text-sm text-muted">
                create your first training block to start logging
              </p>
              <Link
                href="/programs/new"
                className="inline-block px-6 py-3 bg-foreground text-background font-mono font-medium hover:bg-foreground/90 transition-colors touch-manipulation"
              >
                + new program
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="px-1 py-1">
              <h1 className="font-pixel text-lg">{activeProgram?.name || 'my block'}</h1>
            </section>
            <section className="flex items-center">
              <WeekSelector />
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orderedWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </section>
            <section>
              <ProgressSummary />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <AppFooter />
    </main>
  );
}
