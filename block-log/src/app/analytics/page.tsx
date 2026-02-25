'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { downloadCSV, getExportSummary } from '@/lib/export';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { WorkoutHeatmap } from '@/components/analytics/WorkoutHeatmap';
import { AppFooter } from '@/components/ui/AppFooter';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import { getTemplate } from '@/data/program-templates';

export default function AnalyticsPage() {
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const userSettings = useAppStore((state) => state.userSettings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const workoutLogs = activeProgram?.workoutLogs || [];
  const exerciseSubstitutions = activeProgram?.exerciseSubstitutions || {};
  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;
  const totalWeeks = activeProgram?.customWeeksTotal || template?.weeksTotal || 12;
  const daysPerWeek = activeProgram?.customDaysPerWeek || template?.daysPerWeek || 4;
  const totalPlannedWorkouts = totalWeeks * daysPerWeek;

  const summary = getExportSummary({ workoutLogs, exerciseSubstitutions, totalPlannedWorkouts });
  const [showDataScopeInfo, setShowDataScopeInfo] = useState(false);

  const handleExport = () => {
    if (!activeProgram) return;
    const date = new Date().toISOString().split('T')[0];
    const programName = activeProgram.name.replace(/\s+/g, '-').toLowerCase();
    downloadCSV(
      { workoutLogs, exerciseSubstitutions, programName: activeProgram.name, templateId: activeProgram.templateId },
      `block-log-${programName}-${date}.csv`
    );
  };

  const toggleUnits = () => {
    updateSettings({
      units: userSettings.units === 'lbs' ? 'kg' : 'lbs',
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader
        subtitle="analytics"
        backFallbackHref="/"
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Summary stats */}
        <section className="border border-border p-4">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-display font-bold text-balance">summary</h2>
            <button
              onClick={() => setShowDataScopeInfo((value) => !value)}
              className="w-11 h-11 border border-border text-muted hover:text-foreground hover:border-foreground transition-colors font-sans text-base font-medium leading-none touch-manipulation"
              aria-label={showDataScopeInfo ? 'Hide analytics data source info' : 'Show analytics data source info'}
            >
              i
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="font-sans text-sm text-muted">workouts completed</div>
              <div className="font-sans font-bold text-2xl">
                {summary.completedWorkouts}
                <span className="text-muted text-sm font-normal">/{summary.totalWorkouts}</span>
              </div>
            </div>
            <div>
              <div className="font-sans text-sm text-muted">total sets</div>
              <div className="font-sans font-bold text-2xl">{summary.totalSets}</div>
            </div>
            <div>
              <div className="font-sans text-sm text-muted">total volume</div>
              <div className="font-sans font-bold text-2xl">
                {summary.totalVolume.toLocaleString()}
                <span className="text-sm font-normal"> {userSettings.units}</span>
              </div>
            </div>
            <div>
              <div className="font-sans text-sm text-muted">date range</div>
              <div className="font-sans text-sm">
                {summary.dateRange 
                  ? `${summary.dateRange.start} - ${summary.dateRange.end}`
                  : '—'
                }
              </div>
            </div>
          </div>
          {showDataScopeInfo && (
            <div className="mt-4 border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base">analytics scope</h2>
                <button
                  onClick={() => setShowDataScopeInfo(false)}
                  className="w-11 h-11 border border-border font-sans text-base font-medium leading-none hover:border-foreground transition-colors touch-manipulation inline-flex items-center justify-center"
                  aria-label="Close analytics scope details"
                >
                  ×
                </button>
              </div>
              <p className="min-h-11 px-3 inline-flex items-center border border-border bg-surface/70 font-sans text-xs uppercase tracking-wide text-muted">
                data source: {activeProgram ? 'active block only' : 'no active block selected'}
              </p>
              <p className="min-h-11 px-3 inline-flex items-center border border-border bg-surface/70 font-sans text-xs uppercase tracking-wide text-muted">
                current block: {activeProgram ? activeProgram.name : 'none selected'}
              </p>
              <p className="font-sans text-sm text-muted text-pretty">
                switch active block on the programs page to inspect another block&apos;s history.
              </p>
            </div>
          )}
        </section>

        {/* Progress chart */}
        <section>
          <ProgressChart />
        </section>

        {/* Workout heatmap */}
        <section>
          <WorkoutHeatmap />
        </section>

        {/* Settings + Export */}
        <section className="border border-border p-4 space-y-4">
          <h2 className="font-display font-bold text-balance">settings + export</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Units toggle */}
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm text-muted">units:</span>
              <button
                onClick={toggleUnits}
                className="font-sans text-sm border border-border px-3 min-h-11 hover:border-foreground touch-manipulation"
              >
                {userSettings.units}
              </button>
            </div>
            <button
              onClick={handleExport}
              disabled={workoutLogs.length === 0}
              className="font-sans px-4 min-h-11 bg-foreground text-background hover:bg-foreground/90 
                disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              export csv
            </button>
          </div>
          <p className="font-sans text-xs text-muted text-pretty">
            download workout data as csv
          </p>
        </section>
      </div>

      {/* Footer */}
      <AppFooter />
    </main>
  );
}
