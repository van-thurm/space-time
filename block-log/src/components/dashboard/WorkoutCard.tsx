'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { RecordIcon, ConcentricIcon, LinesIcon } from '@/components/ui/DieterIcons';
import type { Workout } from '@/types';

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const getWorkoutStatus = useAppStore((state) => state.getWorkoutStatus);
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  
  const status = getWorkoutStatus(workout.id);
  const log = workoutLogs.find((l) => l.workoutId === workout.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Status icon component
  const StatusIcon = () => {
    switch (status) {
      case 'completed':
        return <RecordIcon size={20} hasAccent className="text-success" />;
      case 'in_progress':
        return <ConcentricIcon size={20} filled className="text-accent" />;
      default:
        return <ConcentricIcon size={20} className="text-muted" />;
    }
  };

  const statusLabels = {
    not_started: 'ready',
    in_progress: 'in progress',
    completed: 'done',
  };

  return (
    <Link
      href={`/workout/${workout.week}-${workout.day}`}
      className="block border-2 border-border hover:border-foreground transition-colors group"
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center font-pixel text-lg">
              {workout.day}
            </div>
            <div>
              <h3 className="font-pixel font-bold">
                {workout.dayName}
              </h3>
              <p className="font-mono text-xs text-muted">
                day {workout.day}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon />
            <span className="font-mono text-xs text-muted">
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {/* Info with icon */}
        <div className="flex items-center gap-2 text-sm text-muted font-mono">
          <LinesIcon size={14} />
          <span>{workout.exercises.length} exercises</span>
          <span className="text-border">|</span>
          <span>~{workout.estimatedDuration} min</span>
        </div>

        {/* Last completed */}
        {log && (
          <div className="text-xs font-mono text-muted">
            last: {formatDate(log.date)}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-end pt-2 border-t border-border">
          <span className="font-mono text-sm group-hover:text-accent transition-colors">
            {status === 'completed' ? 'view' : status === 'in_progress' ? 'continue' : 'start'} →
          </span>
        </div>
      </div>
    </Link>
  );
}
