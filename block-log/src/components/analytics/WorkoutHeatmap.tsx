'use client';

import { useAppStore } from '@/lib/store';

export function WorkoutHeatmap() {
  const workoutLogs = useAppStore((state) => state.workoutLogs);

  // Create a 12 (weeks) x 4 (days) grid
  const grid: ('completed' | 'in_progress' | 'not_started')[][] = [];

  for (let week = 1; week <= 12; week++) {
    const weekData: ('completed' | 'in_progress' | 'not_started')[] = [];
    
    for (let day = 1; day <= 4; day++) {
      const workoutId = `week${week}-day${day}`;
      const log = workoutLogs.find((l) => l.workoutId === workoutId);
      
      if (!log) {
        weekData.push('not_started');
      } else if (log.completed) {
        weekData.push('completed');
      } else {
        weekData.push('in_progress');
      }
    }
    
    grid.push(weekData);
  }

  const statusColors = {
    completed: 'bg-foreground',
    in_progress: 'bg-accent',
    not_started: 'bg-surface',
  };

  const dayLabels = ['L1', 'U1', 'L2', 'U2'];
  const completedCount = workoutLogs.filter((l) => l.completed).length;

  return (
    <div className="border-2 border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-mono font-bold">workout completion</h2>
        <span className="font-mono text-sm text-muted">
          {completedCount}/48 workouts
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs font-mono text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-foreground" />
          <span>completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent" />
          <span>in progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-surface border border-border" />
          <span>not started</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="font-mono text-xs text-muted text-left pb-2 pr-2">wk</th>
              {dayLabels.map((label) => (
                <th key={label} className="font-mono text-xs text-muted text-center pb-2 px-1">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, weekIndex) => (
              <tr key={weekIndex}>
                <td className="font-mono text-xs text-muted pr-2 py-0.5">
                  {weekIndex + 1}
                </td>
                {week.map((status, dayIndex) => (
                  <td key={dayIndex} className="px-1 py-0.5">
                    <div
                      className={`w-6 h-6 md:w-8 md:h-8 ${statusColors[status]} ${
                        status === 'not_started' ? 'border border-border' : ''
                      }`}
                      title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: ${status.replace('_', ' ')}`}
                    />
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
