'use client';

import { useAppStore } from '@/lib/store';
import { getWeekWorkouts } from '@/data/program';
import { WeekSelector } from '@/components/dashboard/WeekSelector';
import { WorkoutCard } from '@/components/dashboard/WorkoutCard';
import { ProgressSummary } from '@/components/dashboard/ProgressSummary';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DotsIcon } from '@/components/ui/DieterIcons';
import Link from 'next/link';

export default function Dashboard() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const workouts = getWeekWorkouts(currentWeek);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <DotsIcon size={28} className="text-accent" />
              <div>
                <h1 className="font-pixel font-bold text-xl md:text-2xl tracking-wide">
                  block log
                </h1>
                <p className="font-mono text-sm text-muted">
                  week {currentWeek} of 12
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/analytics"
                className="font-mono text-sm text-muted hover:text-foreground transition-colors"
              >
                analytics
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Week selector */}
        <section>
          <WeekSelector />
        </section>

        {/* Workout cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </section>

        {/* Progress summary */}
        <section>
          <ProgressSummary />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="font-mono text-sm text-muted text-center">
            12-week progressive overload program
          </p>
        </div>
      </footer>
    </main>
  );
}
