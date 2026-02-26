'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AddedExercise, ExerciseDbExercise } from '@/types';

interface AddExerciseModalProps {
  onAdd: (exercise: AddedExercise) => void;
  onClose: () => void;
}

function generateAddedExerciseId(prefix: 'api' | 'custom', base?: string): string {
  const safeBase = base ? base.replace(/[^a-zA-Z0-9_-]/g, '') : 'item';
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${safeBase}-${Date.now()}-${random}`;
}

export function AddExerciseModal({ onAdd, onClose }: AddExerciseModalProps) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [targetRPE, setTargetRPE] = useState('7-8');
  
  // API search state
  const [searchResults, setSearchResults] = useState<ExerciseDbExercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDbExercise | null>(null);
  const [showSearch, setShowSearch] = useState(true);

  // Debounced search function using server-side API route
  const searchExercises = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/exercises/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        setSearchResults([]);
        return;
      }
      const results = await response.json();
      setSearchResults(Array.isArray(results) ? results.slice(0, 8) : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!showSearch) return;
    
    const timer = setTimeout(() => {
      if (name.length >= 2) {
        searchExercises(name);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [name, showSearch, searchExercises]);

  const handleSelectFromApi = (exercise: ExerciseDbExercise) => {
    setSelectedExercise(exercise);
    setName(exercise.name);
    setShowSearch(false);
    setSearchResults([]);
    
  };

  const handleClearSelection = () => {
    setSelectedExercise(null);
    setShowSearch(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const exercise: AddedExercise = {
      id: selectedExercise
        ? generateAddedExerciseId('api', selectedExercise.id)
        : generateAddedExerciseId('custom'),
      name: name.trim(),
      sets,
      reps: String(reps),
      targetRPE,
      restSeconds: 60,
      category: 'accessory',
      addedAt: new Date().toISOString(),
      // Store API data for consistency
      apiExerciseId: selectedExercise?.id,
      muscleGroup: selectedExercise?.target,
      equipment: selectedExercise?.equipment,
    };

    onAdd(exercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-md w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="font-display text-lg">add exercise</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-muted text-base font-medium leading-none hover:text-foreground
              active:text-foreground border border-border hover:border-foreground touch-manipulation"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Exercise name with API search */}
          <div className="relative">
            <label className="block form-label mb-2">
              exercise search
              <span className="normal-case tracking-normal"> (1000+ exercises or type your own)</span>
            </label>
            
            {selectedExercise ? (
              <div className="flex items-center gap-2 p-3 border border-accent bg-accent/5">
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium">{selectedExercise.name}</p>
                  <p className="font-sans text-xs text-muted">
                    {selectedExercise.target} · {selectedExercise.equipment}
                  </p>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="w-10 h-10 inline-flex items-center justify-center border border-border text-muted text-sm font-medium leading-none hover:text-foreground hover:border-foreground transition-colors touch-manipulation"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="search or type custom name..."
                  className="w-full p-3 border border-border bg-background font-sans text-sm
                    focus:border-foreground focus:outline-none touch-manipulation"
                />
                
                {/* Search results dropdown */}
                {showSearch && (searchResults.length > 0 || searching) && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border 
                    max-h-48 overflow-y-auto z-10">
                    {searching ? (
                      <div className="p-3 font-sans text-sm text-muted text-center">
                        searching...
                      </div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectFromApi(result)}
                          className="w-full text-left p-2 hover:bg-surface border-b border-border last:border-0
                            touch-manipulation transition-colors"
                        >
                          <p className="font-sans text-sm truncate">{result.name}</p>
                          <p className="font-sans text-xs text-muted">
                            {result.target} · {result.equipment}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sets and Reps */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block form-label mb-2">sets</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSets((s) => Math.max(1, s - 1))}
                  className="w-12 h-12 border border-border font-sans text-xl
                    hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                  aria-label="Decrease sets"
                >−</button>
                <div className="flex-1 h-12 border-t border-b border-border flex items-center justify-center font-sans text-xl font-semibold">
                  {sets}
                </div>
                <button
                  type="button"
                  onClick={() => setSets((s) => Math.min(10, s + 1))}
                  className="w-12 h-12 border border-border font-sans text-xl
                    hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                  aria-label="Increase sets"
                >+</button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block form-label mb-2">reps</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="w-12 h-12 border border-border font-sans text-xl
                    hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                  aria-label="Decrease reps"
                >−</button>
                <div className="flex-1 h-12 border-t border-b border-border flex items-center justify-center font-sans text-xl font-semibold">
                  {reps}
                </div>
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.min(30, r + 1))}
                  className="w-12 h-12 border border-border font-sans text-xl
                    hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                  aria-label="Increase reps"
                >+</button>
              </div>
            </div>
          </div>

          {/* Target RPE */}
          <div>
            <label className="block form-label mb-2">target rpe</label>
            <input
              type="text"
              value={targetRPE}
              onChange={(e) => setTargetRPE(e.target.value)}
              placeholder="7-8"
              className="w-full p-3 border border-border bg-background font-sans text-sm
                focus:border-foreground focus:outline-none touch-manipulation"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-border font-sans 
              hover:border-foreground active:bg-surface transition-colors touch-manipulation"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 px-4 bg-foreground text-background font-sans font-medium 
              hover:bg-foreground/90 active:bg-foreground/80 transition-colors touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}
