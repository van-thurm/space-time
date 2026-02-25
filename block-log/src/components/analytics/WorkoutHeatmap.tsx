'use client';

import { useAppStore } from '@/lib/store';
import { getTemplate } from '@/data/program-templates';
import { useRouter } from 'next/navigation';
import type { WorkoutLog } from '@/types';

function deriveLogStatus(log: WorkoutLog | undefined): 'completed' | 'in_progress' | 'not_started' {
  if (!log) return 'not_started';
  if (log.completed) return 'completed';
  const hasCompletedSet = log.exercises.some((ex) =>
    ex.sets.some((s) => s.reps > 0 || s.status === 'skipped')
  );
  const hasSkippedExercise = Boolean(log.skippedExercises && log.skippedExercises.length > 0);
  if (!hasCompletedSet && !hasSkippedExercise) return 'not_started';
  return 'in_progress';
}

export function WorkoutHeatmap() {
  const router = useRouter();
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const workoutLogs = activeProgram?.workoutLogs || [];
  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;
  
  const totalWeeks = activeProgram?.customWeeksTotal || template?.weeksTotal || 12;
  const daysPerWeek = activeProgram?.customDaysPerWeek || template?.daysPerWeek || 4;
  const dayLabels =
    activeProgram?.customDayLabels && activeProgram.customDayLabels.length > 0
      ? activeProgram.customDayLabels
      : template?.dayLabels || Array.from({ length: daysPerWeek }, (_, i) => `day ${i + 1}`);

  // Create a grid based on program dimensions — use same status logic as getWorkoutStatus
  const grid: { week: number; day: number; status: 'completed' | 'in_progress' | 'not_started' }[][] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    const weekData: { week: number; day: number; status: 'completed' | 'in_progress' | 'not_started' }[] = [];
    
    for (let day = 1; day <= daysPerWeek; day++) {
      const workoutId = `week${week}-day${day}`;
      const log = workoutLogs.find((l) => l.workoutId === workoutId);
      weekData.push({ week, day, status: deriveLogStatus(log) });
    }
    
    grid.push(weekData);
  }

  const statusColors = {
    completed: 'bg-success',
    in_progress: 'bg-accent',
    not_started: 'bg-surface',
  };

  const allStatuses = grid.flat().map((c) => c.status);
  const completedCount = allStatuses.filter((s) => s === 'completed').length;
  const inProgressCount = allStatuses.filter((s) => s === 'in_progress').length;
  const notStartedCount = allStatuses.filter((s) => s === 'not_started').length;
  const heatmapTileClass = 'w-11 h-11 mx-auto border border-border touch-manipulation';

  return (
    <div className="border border-border p-4">
      <div className="mb-3">
        <h2 className="font-display font-bold">workout completion</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 font-sans text-xs">
        <span className="min-h-11 px-2 inline-flex items-center justify-center border border-border bg-success/10 text-success whitespace-nowrap">
          {completedCount} completed
        </span>
        <span className="min-h-11 px-2 inline-flex items-center justify-center border border-border bg-accent/10 text-accent whitespace-nowrap">
          {inProgressCount} incomplete
        </span>
        <span className="min-h-11 px-2 inline-flex items-center justify-center border border-border bg-surface text-muted whitespace-nowrap">
          {notStartedCount} not started
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate [border-spacing:0_4px] md:[border-spacing:0_6px]">
          <colgroup>
            <col className="w-12" />
            {dayLabels.map((label) => (
              <col key={`col-${label}`} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="font-sans text-xs text-muted text-center pb-1 px-1">wk</th>
              {dayLabels.map((label) => (
                <th key={label} className="font-sans text-xs text-muted text-center pb-1 px-1">
                  {label.toLowerCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, weekIndex) => (
              <tr key={weekIndex}>
                <td className="font-sans text-xs text-muted text-center px-1 py-0 align-middle">
                  {weekIndex + 1}
                </td>
                {week.map((cell, dayIndex) => (
                  <td key={dayIndex} className="px-1 py-0 text-center align-middle">
                    {cell.status === 'not_started' ? (
                      <button
                        type="button"
                        disabled
                        aria-label={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: not started`}
                        className={`${heatmapTileClass} ${statusColors[cell.status]} cursor-default`}
                        title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: not started`}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            cell.status === 'completed'
                              ? `/workout/${cell.week}-${cell.day}/complete`
                              : `/workout/${cell.week}-${cell.day}`
                          )
                        }
                        className={`${heatmapTileClass} ${statusColors[cell.status]} hover:border-foreground transition-colors`}
                        title={`Week ${cell.week}, Day ${cell.day}: ${
                          cell.status === 'completed' ? 'completed (open summary)' : 'incomplete (open workout)'
                        }`}
                        aria-label={`Open ${
                          cell.status === 'completed' ? 'workout summary' : 'workout'
                        } for week ${cell.week}, day ${cell.day}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
