'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { getTemplate } from '@/data/program-templates';
import { getWeekWorkouts } from '@/data/program';
import { getProgramWorkouts } from '@/data/programs';
import { getCustomWorkouts } from '@/data/programs/custom';

// Use theme tokens so line colors stay readable in light/dark modes.
const COLORS = ['var(--accent)', 'var(--success)', 'var(--foreground)', 'var(--muted)'];

interface ChartDataPoint {
  week: number;
  [key: string]: number | undefined;
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function canonicalMovementName(rawName: string): string {
  const value = rawName.toLowerCase();
  if (value.includes('squat')) return 'squat';
  if (value.includes('bench')) return 'bench press';
  if (value.includes('deadlift') || value.includes('rdl')) return 'deadlift';
  if (value.includes('overhead press') || value.includes('ohp')) return 'overhead press';
  if (value.includes('row')) return 'row';
  if (value.includes('chin') || value.includes('pull up') || value.includes('lat pulldown')) return 'vertical pull';
  return rawName.toLowerCase();
}

export function ProgressChart() {
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const userSettings = useAppStore((state) => state.userSettings);

  const workoutLogs = activeProgram?.workoutLogs || [];
  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;

  const totalWeeks = template?.weeksTotal || 12;

  const getPlannedWorkoutsForWeek = (week: number) => {
    if (!activeProgram) return getWeekWorkouts(week);
    if (activeProgram.templateId === 'custom') {
      const labels = activeProgram.customDayLabels && activeProgram.customDayLabels.length > 0
        ? activeProgram.customDayLabels
        : Array.from({ length: activeProgram.customDaysPerWeek || 4 }, (_, i) => `day ${i + 1}`);
      return getCustomWorkouts(week, labels);
    }
    const base =
      activeProgram.templateId !== '4-day-upper-lower'
        ? getProgramWorkouts(activeProgram.templateId, week)
        : getWeekWorkouts(week);
    const targetDays = activeProgram.customDaysPerWeek || base.length;
    if (targetDays <= base.length) return base;
    const labels = activeProgram.customDayLabels || [];
    const extra = Array.from({ length: targetDays - base.length }, (_, idx) => {
      const day = base.length + idx + 1;
      return {
        id: `week${week}-day${day}`,
        week,
        day: day as 1 | 2 | 3 | 4 | 5,
        dayName: labels[day - 1] || `day ${day}`,
        exercises: [],
        estimatedDuration: 45,
      };
    });
    return [...base, ...extra];
  };
  
  // Collect max weights by movement family across weeks.
  const exerciseMaxWeights = new Map<string, Map<number, number>>();
  
  for (const log of workoutLogs) {
    const match = log.workoutId.match(/week(\d+)/);
    if (!match) continue;
    const week = parseInt(match[1]);
    const dayMatch = log.workoutId.match(/day(\d+)/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : null;
    const plannedWorkout = day ? getPlannedWorkoutsForWeek(week).find((workout) => workout.day === day) : undefined;
    
    for (const exerciseLog of log.exercises) {
      const maxWeight = Math.max(...exerciseLog.sets.map((s) => s.weight), 0);
      if (maxWeight > 0) {
        const substitutionName = activeProgram?.exerciseSubstitutions?.[exerciseLog.exerciseId]?.replacementName;
        const addedExerciseName = log.addedExercises?.find((exercise) => exercise.id === exerciseLog.exerciseId)?.name;
        const plannedExerciseName = plannedWorkout?.exercises.find((exercise) => {
          if (exercise.id === exerciseLog.exerciseId) return true;
          const slot = exerciseLog.exerciseId.split('-').pop();
          return Boolean(slot && exercise.id.endsWith(`-${slot}`));
        })?.name;
        const fallbackName = exerciseLog.exerciseId
          .replace(/^week\d+-day\d+-/i, '')
          .replace(/^w\d+d\d+-/i, '')
          .replace(/[-_]/g, ' ')
          .trim();
        const rawName = substitutionName || addedExerciseName || plannedExerciseName || fallbackName || 'exercise';
        const exerciseName = canonicalMovementName(rawName);
        
        if (!exerciseMaxWeights.has(exerciseName)) {
          exerciseMaxWeights.set(exerciseName, new Map());
        }
        const existing = exerciseMaxWeights.get(exerciseName)!.get(week) || 0;
        exerciseMaxWeights.get(exerciseName)!.set(week, Math.max(existing, maxWeight));
      }
    }
  }
  
  // Pick top 4 exercises by total volume across all weeks
  const exerciseTotals = Array.from(exerciseMaxWeights.entries())
    .map(([name, weekMap]) => ({
      name,
      total: Array.from(weekMap.values()).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  
  // Build chart data
  const chartData: ChartDataPoint[] = [];
  for (let week = 1; week <= totalWeeks; week++) {
    const dataPoint: ChartDataPoint = { week };
    for (const { name } of exerciseTotals) {
      const maxWeight = exerciseMaxWeights.get(name)?.get(week);
      if (maxWeight !== undefined) {
        dataPoint[name] = maxWeight;
      }
    }
    chartData.push(dataPoint);
  }

  // Check if there's any data
  const hasData = exerciseTotals.length > 0;
  const maxValue = Math.max(
    0,
    ...chartData.flatMap((point) =>
      exerciseTotals.map((ex) => Number(point[ex.name] || 0))
    )
  );
  const yDomainMax = Math.max(50, Math.ceil(maxValue / 10) * 10);

  if (!hasData) {
    return (
      <div className="border-2 border-border p-6 text-center">
        <p className="font-mono text-muted">
          complete workouts to see your progress chart
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-border p-4">
      <h2 className="font-pixel font-bold mb-4">main lifts progress</h2>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fontFamily: 'monospace', fill: 'var(--muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
              tickFormatter={(week) => `w${week}`}
            />
            <YAxis 
              tick={{ fontSize: 12, fontFamily: 'monospace', fill: 'var(--muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
              tickFormatter={(val) => `${val}`}
              domain={[0, yDomainMax]}
              label={{ 
                value: userSettings.units, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fontFamily: 'monospace', fill: 'var(--muted)' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontFamily: 'monospace',
                fontSize: 12,
                border: '2px solid var(--border)',
                borderRadius: 0,
              }}
              formatter={(value, name) => [`${value} ${userSettings.units}`, titleCase(String(name))]}
              labelFormatter={(week) => `week ${week}`}
            />
            <Legend 
              formatter={(value) => titleCase(String(value))}
              wrapperStyle={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--foreground)' }}
            />
            {exerciseTotals.map((ex, i) => (
              <Line
                key={ex.name}
                type="monotone"
                dataKey={ex.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
