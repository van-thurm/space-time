'use client';

import { useAppStore } from '@/lib/store';

// Main lift IDs to track
const MAIN_LIFTS = [
  { pattern: 'main', name: 'squat', day: 1 },
  { pattern: 'main', name: 'bench', day: 2 },
  { pattern: 'main', name: 'deadlift', day: 3 },
  { pattern: 'main', name: 'press', day: 4 },
];

export function ProgressSummary() {
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  const userSettings = useAppStore((state) => state.userSettings);

  // Calculate progress for each main lift
  const liftProgress = MAIN_LIFTS.map((lift) => {
    // Find all logs for this exercise across all weeks
    const liftLogs: { week: number; weight: number }[] = [];

    workoutLogs.forEach((log) => {
      // Parse week/day from ids like "week3-day1" or "custom-week3-day1"
      const weekMatch = log.workoutId.match(/(?:^|-)week(\d+)-day(\d+)/);
      if (!weekMatch) return;
      
      const week = parseInt(weekMatch[1]);
      const day = parseInt(weekMatch[2]);
      
      if (day !== lift.day) return;

      // Find the main lift exercise in this log
      const exerciseLog = log.exercises.find((e) => 
        e.exerciseId.includes(`d${day}-${lift.pattern}`)
      );
      
      if (exerciseLog && exerciseLog.sets.length > 0) {
        // Guard against malformed or implausible values polluting progress cards.
        const validWeights = exerciseLog.sets
          .map((set) => Number(set.weight))
          .filter((weight) => Number.isFinite(weight) && weight > 0 && weight <= 2000);
        if (validWeights.length === 0) return;
        const maxWeight = Math.max(...validWeights);
        if (maxWeight > 0) {
          liftLogs.push({ week, weight: maxWeight });
        }
      }
    });

    // Sort by week and get first and last
    liftLogs.sort((a, b) => a.week - b.week);
    const first = liftLogs[0];
    const last = liftLogs[liftLogs.length - 1];
    
    const change = first && last ? last.weight - first.weight : 0;

    return {
      name: lift.name,
      first: first?.weight || 0,
      last: last?.weight || 0,
      change,
    };
  });

  const hasData = liftProgress.some((l) => l.first > 0);
  const unit = userSettings.units;

  if (!hasData) {
    return (
      <div className="border border-border rounded-md p-4">
        <h2 className="font-sans font-bold mb-2">key lifts progress</h2>
        <p className="text-muted font-sans text-sm">
          complete workouts to track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 space-y-4">
      <h2 className="font-sans font-bold">key lifts progress</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {liftProgress.map((lift) => (
          <div key={lift.name} className="space-y-1">
            <div className="font-sans text-sm text-muted">{lift.name}</div>
            {lift.first > 0 ? (
              <>
                <div className="font-sans font-bold text-lg">
                  {lift.last} <span className="text-sm">{unit}</span>
                </div>
                <div className={`font-sans text-sm ${lift.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {lift.change >= 0 ? '+' : ''}{lift.change} {unit}
                </div>
              </>
            ) : (
              <div className="font-sans text-muted">—</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
