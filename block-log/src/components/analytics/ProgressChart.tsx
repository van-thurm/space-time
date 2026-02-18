'use client';

import { useState, useMemo, useCallback } from 'react';
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

const COLORS = ['var(--accent)', 'var(--success)', 'var(--foreground)', 'var(--muted)', 'var(--danger)', 'var(--accent)'];
const MAX_TRACKED = 6;

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

function ExercisePickerModal({
  allExercises,
  defaultTop4,
  currentSelection,
  onSave,
  onClose,
}: {
  allExercises: { name: string; total: number }[];
  defaultTop4: string[];
  currentSelection: string[];
  onSave: (exercises: string[] | null) => void;
  onClose: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(currentSelection));
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allExercises;
    const q = search.toLowerCase();
    return allExercises.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [allExercises, search]);

  const toggleExercise = useCallback((name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < MAX_TRACKED) {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleReset = () => {
    onSave(null);
  };

  const handleClear = () => {
    setChecked(new Set());
  };

  const handleSave = () => {
    if (checked.size === 0) {
      onSave(null);
    } else {
      onSave(Array.from(checked));
    }
  };

  const atLimit = checked.size >= MAX_TRACKED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-background border-2 border-border w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="font-pixel text-lg">tracked lifts</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground
              active:text-foreground border border-border hover:border-foreground touch-manipulation"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search exercises..."
            className="w-full h-10 px-3 border-2 border-border bg-background font-mono text-sm
              focus:border-foreground focus:outline-none placeholder:text-muted/50"
          />
          <p className="font-mono text-xs text-muted mt-1">
            {checked.size}/{MAX_TRACKED} selected
            {atLimit && ' (max reached)'}
          </p>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {filtered.length === 0 ? (
            <p className="font-mono text-sm text-muted py-4 text-center">no matching exercises</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((ex) => {
                const isChecked = checked.has(ex.name);
                const isDefault = defaultTop4.includes(ex.name);
                const disabled = !isChecked && atLimit;
                return (
                  <button
                    key={ex.name}
                    onClick={() => !disabled && toggleExercise(ex.name)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 py-2 px-2 font-mono text-sm transition-colors touch-manipulation text-left
                      ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-foreground/5'}`}
                  >
                    <span
                      className={`w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center text-xs
                        ${isChecked
                          ? 'border-success bg-success text-background'
                          : 'border-border'
                        }`}
                    >
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className="flex-1 truncate">{titleCase(ex.name)}</span>
                    {isDefault && !search.trim() && (
                      <span className="text-xs text-muted flex-shrink-0">top 4</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-3 h-10 border-2 border-border font-mono text-xs hover:border-foreground transition-colors touch-manipulation"
          >
            reset
          </button>
          <button
            onClick={handleClear}
            className="px-3 h-10 border-2 border-border font-mono text-xs hover:border-foreground transition-colors touch-manipulation"
          >
            clear
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-3 h-10 border-2 border-border font-mono text-xs hover:border-foreground transition-colors touch-manipulation"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 h-10 border-2 border-foreground bg-foreground text-background font-mono text-xs
              hover:bg-foreground/90 transition-colors touch-manipulation"
          >
            save
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProgressChart() {
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const userSettings = useAppStore((state) => state.userSettings);
  const updateTrackedChartExercises = useAppStore((state) => state.updateTrackedChartExercises);

  const [pickerOpen, setPickerOpen] = useState(false);

  const workoutLogs = activeProgram?.workoutLogs || [];
  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;

  const totalWeeks = template?.weeksTotal || 12;

  const getPlannedWorkoutsForWeek = useCallback((week: number) => {
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
  }, [activeProgram]);

  // Collect max weights by movement family across weeks.
  const exerciseMaxWeights = useMemo(() => {
    const map = new Map<string, Map<number, number>>();
    for (const log of workoutLogs) {
      const match = log.workoutId.match(/week(\d+)/);
      if (!match) continue;
      const week = parseInt(match[1]);
      const dayMatch = log.workoutId.match(/day(\d+)/);
      const day = dayMatch ? parseInt(dayMatch[1], 10) : null;
      const plannedWorkout = day ? getPlannedWorkoutsForWeek(week).find((workout) => workout.day === day) : undefined;

      const deletedIds = new Set(log.deletedExercises || []);
      for (const exerciseLog of log.exercises) {
        if (deletedIds.has(exerciseLog.exerciseId)) continue;
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

          if (!map.has(exerciseName)) {
            map.set(exerciseName, new Map());
          }
          const existing = map.get(exerciseName)!.get(week) || 0;
          map.get(exerciseName)!.set(week, Math.max(existing, maxWeight));
        }
      }
    }
    return map;
  }, [workoutLogs, activeProgram, getPlannedWorkoutsForWeek]);

  // All exercises sorted by total volume
  const allExerciseTotals = useMemo(() => {
    return Array.from(exerciseMaxWeights.entries())
      .map(([name, weekMap]) => ({
        name,
        total: Array.from(weekMap.values()).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [exerciseMaxWeights]);

  // Default top 4
  const defaultTop4 = useMemo(() => allExerciseTotals.slice(0, 4).map((ex) => ex.name), [allExerciseTotals]);

  // Determine which exercises to show on chart
  const userOverride = activeProgram?.trackedChartExercises;
  const selectedExercises = useMemo(() => {
    if (userOverride && userOverride.length > 0) {
      // Only keep exercises that still have data
      const valid = userOverride.filter((name) => exerciseMaxWeights.has(name));
      return valid.length > 0 ? valid : defaultTop4;
    }
    return defaultTop4;
  }, [userOverride, exerciseMaxWeights, defaultTop4]);

  const isCustomSelection = Boolean(userOverride && userOverride.length > 0);

  // Build chart data
  const chartData: ChartDataPoint[] = useMemo(() => {
    const data: ChartDataPoint[] = [];
    for (let week = 1; week <= totalWeeks; week++) {
      const dataPoint: ChartDataPoint = { week };
      for (const name of selectedExercises) {
        const maxWeight = exerciseMaxWeights.get(name)?.get(week);
        if (maxWeight !== undefined) {
          dataPoint[name] = maxWeight;
        }
      }
      data.push(dataPoint);
    }
    return data;
  }, [totalWeeks, selectedExercises, exerciseMaxWeights]);

  const hasData = allExerciseTotals.length > 0;
  const maxValue = Math.max(
    0,
    ...chartData.flatMap((point) =>
      selectedExercises.map((name) => Number(point[name] || 0))
    )
  );
  const yDomainMax = Math.max(50, Math.ceil(maxValue / 10) * 10);

  const handlePickerSave = useCallback((exercises: string[] | null) => {
    if (activeProgram) {
      updateTrackedChartExercises(activeProgram.id, exercises);
    }
    setPickerOpen(false);
  }, [activeProgram, updateTrackedChartExercises]);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel font-bold">main lifts progress</h2>
        <button
          onClick={() => setPickerOpen(true)}
          className="px-2 py-1 border border-border font-mono text-xs text-muted
            hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
          aria-label="Edit tracked lifts"
        >
          edit
        </button>
      </div>

      {isCustomSelection && (
        <p className="font-mono text-xs text-muted mb-2">
          custom selection ·{' '}
          <button
            onClick={() => activeProgram && updateTrackedChartExercises(activeProgram.id, null)}
            className="text-accent hover:text-foreground transition-colors"
          >
            reset to default
          </button>
        </p>
      )}

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
            {selectedExercises.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {pickerOpen && (
        <ExercisePickerModal
          allExercises={allExerciseTotals}
          defaultTop4={defaultTop4}
          currentSelection={selectedExercises}
          onSave={handlePickerSave}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
