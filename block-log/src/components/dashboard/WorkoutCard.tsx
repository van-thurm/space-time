'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ForwardArrowIcon, GeometricCheck, ReportIcon } from '@/components/ui/DieterIcons';
import type { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const router = useRouter();
  const getWorkoutStatus = useAppStore((state) => state.getWorkoutStatus);
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  
  const status = getWorkoutStatus(workout.id);
  const log = workoutLogs.find((l) => l.workoutId === workout.id);
  const reportHref = `/workout/${workout.week}-${workout.day}/complete`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const cardToneClass =
    status === 'completed'
      ? 'border-success/40 border-l-success bg-success/5'
      : status === 'in_progress'
        ? 'border-accent/50 border-l-accent bg-accent/5'
        : 'border-border border-l-border';

  const statusBoxClass =
    status === 'completed'
      ? 'bg-success border-success text-background'
      : status === 'in_progress'
        ? 'bg-accent/10 border-accent text-accent'
        : 'border-border text-muted';
  const ctaHoverClass = status === 'completed' ? 'group-hover:text-success' : 'group-hover:text-accent';

  return (
    <div className={`border border-l rounded-md transition-colors group ${cardToneClass}`}>
      <Link href={`/workout/${workout.week}-${workout.day}`} className="block p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-current flex items-center justify-center font-display text-lg tabular-nums">
              {workout.day}
            </div>
            <div>
              <h3 className="font-display font-bold">
                {workout.dayName}
              </h3>
            </div>
          </div>
          <div className={`w-6 h-6 border font-sans text-xs inline-flex items-center justify-center ${statusBoxClass}`}>
            {status === 'completed' ? <GeometricCheck size={13} /> : ''}
          </div>
        </div>

        {/* Footer row (fixed height keeps cards aligned across states) */}
        <div className="flex items-center justify-between pt-2 border-t border-border min-h-8">
          <span className="text-sm font-sans text-muted inline-flex items-center gap-2">
            <span>
              {log ? `${log.completed ? 'completed' : 'last'}: ${formatDate(log.date).toLowerCase()}` : '\u00A0'}
            </span>
            {status === 'completed' && (
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  router.push(reportHref);
                }}
                className="w-7 h-7 border border-border font-sans text-xs text-muted hover:text-foreground hover:border-foreground transition-colors touch-manipulation inline-flex items-center justify-center"
                aria-label="Go to workout report"
              >
                <ReportIcon size={12} />
              </button>
            )}
          </span>
          <span className={`font-sans text-sm transition-colors flex items-center gap-1 ${ctaHoverClass}`}>
            {status === 'completed' ? 'view' : status === 'in_progress' ? 'continue' : 'start'}
            <ForwardArrowIcon size={14} />
          </span>
        </div>
      </Link>
    </div>
  );
}
