'use client';

import { useState } from 'react';
import { warmupExercises } from '@/data/program';

export function WarmupSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  const allComplete = completedItems.size === warmupExercises.length;

  return (
    <div className="border-2 border-border">
      {/* Header - clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex justify-between items-center hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold">warmup</span>
          <span className={`font-mono text-sm ${allComplete ? 'text-success' : 'text-muted'}`}>
            {completedItems.size}/{warmupExercises.length}
          </span>
        </div>
        <span className="font-mono text-muted">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t-2 border-border">
          {warmupExercises.map((exercise, index) => {
            const isComplete = completedItems.has(exercise.id);
            
            return (
              <div
                key={exercise.id}
                className={`p-4 border-b border-border last:border-b-0 ${
                  isComplete ? 'bg-surface/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleItem(exercise.id)}
                    className={`
                      w-5 h-5 border-2 flex-shrink-0 mt-0.5
                      flex items-center justify-center font-mono text-xs
                      transition-colors
                      ${isComplete 
                        ? 'bg-foreground text-background border-foreground' 
                        : 'border-border hover:border-foreground'
                      }
                    `}
                  >
                    {isComplete ? '✓' : ''}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono text-muted text-sm">
                        {index + 1}.
                      </span>
                      <span className={`font-mono font-medium ${isComplete ? 'line-through text-muted' : ''}`}>
                        {exercise.name}
                      </span>
                      <span className="font-mono text-sm text-muted">
                        {exercise.reps}
                      </span>
                    </div>
                    
                    {exercise.notes && (
                      <p className="font-serif text-sm text-muted mt-1">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
