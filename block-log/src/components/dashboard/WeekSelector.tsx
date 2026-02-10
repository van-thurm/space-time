'use client';

import { useAppStore } from '@/lib/store';
import { getCurrentPhase, isDeloadWeek } from '@/data/program';

export function WeekSelector() {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const setCurrentWeek = useAppStore((state) => state.setCurrentWeek);
  const phase = getCurrentPhase(currentWeek);

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-3">
        <span className="text-muted text-sm font-mono">phase:</span>
        <span className="font-pixel font-bold">{phase.name}</span>
        {isDeloadWeek(currentWeek) && (
          <span className="bg-accent text-background px-2 py-0.5 text-xs font-mono">
            deload
          </span>
        )}
      </div>

      {/* Week selector */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
          const isActive = week === currentWeek;
          const isDeload = isDeloadWeek(week);
          const weekPhase = getCurrentPhase(week);
          
          // Phase separators
          const showPhaseDivider = week === 5 || week === 9;

          return (
            <div key={week} className="flex items-center">
              {showPhaseDivider && (
                <div className="w-px h-8 bg-border mx-2" />
              )}
              <button
                onClick={() => setCurrentWeek(week)}
                className={`
                  w-10 h-10 font-mono text-sm font-medium transition-all
                  border-2
                  ${isActive 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-background text-foreground border-border hover:border-foreground'
                  }
                  ${isDeload ? 'border-accent' : ''}
                `}
                title={`Week ${week} - ${weekPhase.name}${isDeload ? ' (deload)' : ''}`}
              >
                {week}
              </button>
            </div>
          );
        })}
      </div>

      {/* Phase description */}
      <p className="text-muted text-sm font-mono">
        {phase.description}
      </p>
    </div>
  );
}
