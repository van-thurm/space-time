'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import { AppFooter } from '@/components/ui/AppFooter';

interface WorkoutCompletePageProps {
  params: Promise<{ weekDay: string }>;
}

const SUPPORT_QUOTES = [
  'no one lifts alone. your labor builds more than muscle.',
  'discipline is collective power practiced one rep at a time.',
  'strength for yourself, solidarity for everyone around you.',
  'every finished set is proof that workers can endure and organize.',
];

function stableQuoteSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
}

function preventQuoteOrphan(text: string): string {
  return text.replace(/\s+([^\s]+\s*[^\s]*)$/, (match) => match.replace(/\s+/, '\u00A0'));
}

export default function WorkoutCompletePage({ params }: WorkoutCompletePageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const userUnits = useAppStore((state) => state.userSettings.units);
  const getWorkoutLog = useAppStore((state) => state.getWorkoutLog);
  const activeProgram = useAppStore((state) =>
    state.programs.find((program) => program.id === state.activeProgramId)
  );

  const [weekStr, dayStr] = resolvedParams.weekDay.split('-');
  const week = Number(weekStr);
  const day = Number(dayStr);
  const workoutId = `week${week}-day${day}`;
  const log = getWorkoutLog(workoutId);

  const completedAt = Number(searchParams.get('completedAt'));

  const stats = useMemo(() => {
    if (!log) {
      return {
        totalVolume: 0,
        totalReps: 0,
        finishedSets: 0,
        skippedSets: 0,
        trackedExercises: 0,
        averageRpe: null as number | null,
      };
    }

    let totalVolume = 0;
    let totalReps = 0;
    let finishedSets = 0;
    let skippedSets = 0;
    let trackedExercises = 0;
    let rpeSum = 0;
    let rpeCount = 0;

    for (const exerciseLog of log.exercises) {
      let hasTrackedSet = false;
      for (const set of exerciseLog.sets) {
        if (set.status === 'skipped') {
          skippedSets += 1;
          continue;
        }
        if (set.reps > 0) {
          finishedSets += 1;
          totalReps += set.reps;
          if (set.weight > 0) {
            totalVolume += set.weight * set.reps;
          }
          if (set.rpe > 0) {
            rpeSum += set.rpe;
            rpeCount += 1;
          }
          hasTrackedSet = true;
        }
      }
      if (hasTrackedSet) trackedExercises += 1;
    }

    return {
      totalVolume,
      totalReps,
      finishedSets,
      skippedSets,
      trackedExercises,
      averageRpe: rpeCount > 0 ? Number((rpeSum / rpeCount).toFixed(1)) : null,
    };
  }, [log]);

  const logCompletedAt = log?.date ? Date.parse(log.date) : Number.NaN;
  const quoteSeed = Number.isFinite(completedAt)
    ? completedAt
    : Number.isFinite(logCompletedAt)
      ? logCompletedAt
      : stableQuoteSeed(`${workoutId}-${activeProgram?.id || 'block-log'}`);
  const quote = SUPPORT_QUOTES[Math.abs(quoteSeed % SUPPORT_QUOTES.length)];
  const quoteNoOrphan = preventQuoteOrphan(quote);
  const blockName = activeProgram?.name || 'block';

  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader subtitle="work complete" backFallbackHref="/" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <section className="border-2 border-border border-l-4 border-l-success bg-success/5 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-pixel text-xl tracking-wide text-success">session complete</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-8 px-3 inline-flex items-center border border-border bg-background font-mono text-xs uppercase tracking-wide text-muted">
              {blockName}
            </span>
            <span className="h-8 px-3 inline-flex items-center border border-border bg-background font-mono text-xs uppercase tracking-wide text-muted">
              week {week}
            </span>
            <span className="h-8 px-3 inline-flex items-center border border-border bg-background font-mono text-xs uppercase tracking-wide text-muted">
              day {day}
            </span>
          </div>
        </section>

        <section className="border-2 border-border p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-xs text-muted">total volume</p>
            <p className="font-mono text-xl">{stats.totalVolume.toLocaleString()} {userUnits}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted">finished sets</p>
            <p className="font-mono text-xl">{stats.finishedSets}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted">total reps</p>
            <p className="font-mono text-xl">{stats.totalReps}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted">average rpe</p>
            <p className="font-mono text-xl">{stats.averageRpe ?? '—'}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted">tracked exercises</p>
            <p className="font-mono text-xl">{stats.trackedExercises}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted">skipped sets</p>
            <p className="font-mono text-xl">{stats.skippedSets}</p>
          </div>
        </section>

        <section className="px-1 py-2 flex flex-col items-center justify-center gap-4 text-center">
          <p className="font-mono text-base leading-relaxed text-foreground lowercase max-w-xl" style={{ textWrap: 'balance' }}>
            {quoteNoOrphan}
          </p>
        </section>

        <div className="flex gap-3">
          <Link
            href={`/workout/${resolvedParams.weekDay}`}
            className="flex-1 h-11 border-2 border-border font-mono text-sm inline-flex items-center justify-center hover:border-foreground transition-colors touch-manipulation"
          >
            review workout
          </Link>
          <Link
            href="/"
            className="flex-1 h-11 bg-foreground text-background border-2 border-foreground font-mono text-sm inline-flex items-center justify-center hover:bg-foreground/90 transition-colors touch-manipulation"
          >
            back to block
          </Link>
        </div>
      </div>

      <AppFooter />
    </main>
  );
}

