'use client';

import { useAppStore } from '@/lib/store';
import { getTemplate } from '@/data/program-templates';

export function WeekSelector() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const setCurrentWeek = useAppStore((state) => state.setCurrentWeek);
  const activeProgram = useAppStore((state) =>
    state.programs.find((p) => p.id === state.activeProgramId)
  );
  const addWeekToProgram = useAppStore((state) => state.addWeekToProgram);
  const removeWeekFromProgram = useAppStore((state) => state.removeWeekFromProgram);

  const template = activeProgram ? getTemplate(activeProgram.templateId) : null;
  const baseWeeks = activeProgram?.minWeeksTotal || template?.weeksTotal || 12;
  // Use customWeeksTotal if set, otherwise fall back to template default
  const totalWeeks = activeProgram?.customWeeksTotal || baseWeeks;
  
  // Can delete weeks if we have more than the base template weeks
  const canDeleteWeeks = totalWeeks > baseWeeks;

  const handleAddWeek = () => {
    if (activeProgram) {
      addWeekToProgram(activeProgram.id);
    }
  };

  const handleRemoveWeek = () => {
    if (activeProgram && canDeleteWeeks) {
      removeWeekFromProgram(activeProgram.id);
      // If current week is now beyond total, move back
      if (currentWeek > totalWeeks - 1) {
        setCurrentWeek(totalWeeks - 1);
      }
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2 items-center">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
          const isActive = week === currentWeek;

          return (
            <button
              key={week}
              onClick={() => setCurrentWeek(week)}
              className={`
                w-11 h-11 font-sans text-sm font-medium transition-all border rounded-md touch-manipulation
                ${isActive 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-background text-foreground border-border hover:border-foreground active:bg-foreground/10'
                }
              `}
              aria-label={`Week ${week}`}
            >
              {week}
            </button>
          );
        })}
        {/* Add week button */}
        <button
          onClick={handleAddWeek}
          className="w-11 h-11 font-sans text-lg font-medium border rounded-md border-dashed border-border 
            text-muted hover:border-accent hover:text-accent
            transition-all touch-manipulation"
          aria-label="Add another week"
        >
          +
        </button>
      </div>
      
      {/* Delete week option - only show if we have added weeks */}
      {canDeleteWeeks && (
        <button
          onClick={handleRemoveWeek}
          className="font-sans text-xs text-muted hover:text-danger transition-colors touch-manipulation"
        >
          − remove last week
        </button>
      )}
    </div>
  );
}
