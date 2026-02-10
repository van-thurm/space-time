'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { downloadCSV, getExportSummary } from '@/lib/export';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { WorkoutHeatmap } from '@/components/analytics/WorkoutHeatmap';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MeterIcon, LinesIcon } from '@/components/ui/DieterIcons';

export default function AnalyticsPage() {
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  const exerciseSubstitutions = useAppStore((state) => state.exerciseSubstitutions);
  const userSettings = useAppStore((state) => state.userSettings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const summary = getExportSummary({ workoutLogs, exerciseSubstitutions });

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(
      { workoutLogs, exerciseSubstitutions },
      `block-log-export-${date}.csv`
    );
  };

  const toggleUnits = () => {
    updateSettings({
      units: userSettings.units === 'lbs' ? 'kg' : 'lbs',
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="font-mono text-sm text-muted hover:text-foreground">
                ← back
              </Link>
              <div className="flex items-center gap-3 mt-2">
                <MeterIcon size={28} value={summary.totalWorkouts > 0 ? summary.completedWorkouts / summary.totalWorkouts : 0} className="text-foreground" />
                <h1 className="font-pixel font-bold text-xl">
                  analytics
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Summary stats */}
        <section className="border-2 border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <LinesIcon size={16} />
            <h2 className="font-pixel font-bold">summary</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="font-mono text-sm text-muted">workouts</div>
              <div className="font-mono font-bold text-2xl">
                {summary.completedWorkouts}
                <span className="text-muted text-sm font-normal">/{summary.totalWorkouts}</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-sm text-muted">total sets</div>
              <div className="font-mono font-bold text-2xl">{summary.totalSets}</div>
            </div>
            <div>
              <div className="font-mono text-sm text-muted">total volume</div>
              <div className="font-mono font-bold text-2xl">
                {summary.totalVolume.toLocaleString()}
                <span className="text-sm font-normal"> {userSettings.units}</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-sm text-muted">date range</div>
              <div className="font-mono text-sm">
                {summary.dateRange 
                  ? `${summary.dateRange.start} - ${summary.dateRange.end}`
                  : '—'
                }
              </div>
            </div>
          </div>
        </section>

        {/* Progress chart */}
        <section>
          <ProgressChart />
        </section>

        {/* Workout heatmap */}
        <section>
          <WorkoutHeatmap />
        </section>

        {/* Settings & Export */}
        <section className="border-2 border-border p-4 space-y-4">
          <h2 className="font-pixel font-bold">settings & export</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Units toggle */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted">units:</span>
              <button
                onClick={toggleUnits}
                className="font-mono text-sm border-2 border-border px-3 py-1 hover:border-foreground"
              >
                {userSettings.units}
              </button>
            </div>

            {/* Rest timer toggle */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted">rest timer:</span>
              <button
                onClick={() => updateSettings({ showRestTimer: !userSettings.showRestTimer })}
                className={`font-mono text-sm border-2 px-3 py-1 ${
                  userSettings.showRestTimer 
                    ? 'border-foreground bg-foreground text-background' 
                    : 'border-border hover:border-foreground'
                }`}
              >
                {userSettings.showRestTimer ? 'on' : 'off'}
              </button>
            </div>
          </div>

          {/* Export button */}
          <div>
            <button
              onClick={handleExport}
              disabled={workoutLogs.length === 0}
              className="font-mono px-4 py-2 bg-foreground text-background hover:bg-foreground/90 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              export to csv
            </button>
            <p className="font-mono text-xs text-muted mt-2">
              download all workout data as a spreadsheet
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="font-mono text-sm text-muted text-center">
            block log · 12-week progressive overload program
          </p>
        </div>
      </footer>
    </main>
  );
}
