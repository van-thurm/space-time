'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { findAlternatives, isApiConfigured, getExerciseDbApi } from '@/lib/exercise-db';
import type { Exercise, ExerciseDbExercise, ExerciseSubstitution } from '@/types';

interface SwapModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export function SwapModal({ exercise, onClose }: SwapModalProps) {
  const [alternatives, setAlternatives] = useState<ExerciseDbExercise[]>([]);
  const [searchResults, setSearchResults] = useState<ExerciseDbExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showingGif, setShowingGif] = useState<string | null>(null);

  const substituteExercise = useAppStore((state) => state.substituteExercise);
  const getSubstitution = useAppStore((state) => state.getSubstitution);
  const revertSubstitution = useAppStore((state) => state.revertSubstitution);

  const currentSubstitution = getSubstitution(exercise.id);

  // Fetch initial alternatives based on muscle group
  useEffect(() => {
    async function fetchAlternatives() {
      if (!isApiConfigured()) {
        setError('exercisedb api key not configured. add NEXT_PUBLIC_EXERCISEDB_API_KEY to .env.local');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const results = await findAlternatives(
          exercise.muscleGroup,
          exercise.equipment,
          exercise.name
        );
        
        setAlternatives(results);
      } catch (err) {
        console.error('Failed to fetch alternatives:', err);
        // Don't show error - user can still search
        setAlternatives([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlternatives();
  }, [exercise]);

  // Debounced search function
  const searchExercises = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const api = getExerciseDbApi();
      const results = await api.searchByName(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchExercises(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchExercises]);

  const handleSwap = () => {
    if (!selectedId) return;
    
    const allExercises = [...alternatives, ...searchResults];
    const selected = allExercises.find((a) => a.id === selectedId);
    if (!selected) return;

    const substitution: ExerciseSubstitution = {
      originalExerciseId: exercise.id,
      originalName: exercise.name,
      replacementName: selected.name,
      exerciseDbId: selected.id,
      gifUrl: selected.gifUrl,
      muscleGroups: [selected.target, ...selected.secondaryMuscles],
      equipment: [selected.equipment],
      substitutedAt: new Date().toISOString(),
    };

    substituteExercise(exercise.id, substitution);
    onClose();
  };

  const handleRevert = () => {
    revertSubstitution(exercise.id);
    onClose();
  };

  // Display search results if searching, otherwise show alternatives
  const displayedExercises = searchQuery.length >= 2 ? searchResults : alternatives;

  return (
    <div 
      className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-mono font-bold text-lg">swap exercise</h2>
              <p className="font-mono text-sm text-muted mt-1">
                {exercise.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="font-mono text-muted hover:text-foreground p-1"
            >
              ×
            </button>
          </div>

          {/* Exercise info */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono text-muted">
            <span>target: {exercise.muscleGroup.join(', ')}</span>
            <span>|</span>
            <span>equipment: {exercise.equipment.join(', ')}</span>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search alternatives..."
            className="w-full mt-3 px-3 py-2 border-2 border-border bg-background font-mono text-sm
              focus:border-foreground focus:outline-none"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {(loading || searching) && (
            <p className="font-mono text-sm text-muted text-center py-8">
              {searching ? 'searching...' : 'loading alternatives...'}
            </p>
          )}

          {error && (
            <div className="bg-danger/10 border-2 border-danger p-4">
              <p className="font-mono text-sm text-danger">{error}</p>
            </div>
          )}

          {!loading && !searching && !error && displayedExercises.length === 0 && (
            <div className="text-center py-8">
              <p className="font-mono text-sm text-muted">
                {searchQuery.length >= 2 
                  ? 'no results found' 
                  : searchQuery.length > 0
                    ? 'type at least 2 characters to search'
                    : 'no alternatives found. try searching above.'
                }
              </p>
            </div>
          )}

          {!loading && !searching && !error && displayedExercises.length > 0 && (
            <div className="space-y-2">
              {displayedExercises.map((alt) => (
                <div key={alt.id} className="border-2 border-border">
                  <button
                    onClick={() => setSelectedId(selectedId === alt.id ? null : alt.id)}
                    className={`w-full p-3 text-left transition-colors ${
                      selectedId === alt.id ? 'bg-surface' : 'hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-5 h-5 border-2 flex-shrink-0 mt-0.5
                        flex items-center justify-center font-mono text-xs
                        ${selectedId === alt.id 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'border-border'
                        }
                      `}>
                        {selectedId === alt.id ? '●' : ''}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-medium">{alt.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs font-mono text-muted">
                          <span>target: {alt.target}</span>
                          <span>|</span>
                          <span>{alt.equipment}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* GIF preview */}
                  {selectedId === alt.id && (
                    <div className="border-t-2 border-border p-3">
                      <button
                        onClick={() => setShowingGif(showingGif === alt.id ? null : alt.id)}
                        className="font-mono text-sm text-muted hover:text-foreground"
                      >
                        {showingGif === alt.id ? '− hide demo' : '+ show demo'}
                      </button>
                      
                      {showingGif === alt.id && (
                        <div className="mt-3">
                          <img
                            src={alt.gifUrl}
                            alt={alt.name}
                            className="w-full max-w-xs mx-auto border-2 border-border"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-border space-y-2">
          {currentSubstitution && (
            <button
              onClick={handleRevert}
              className="w-full py-2 px-4 border-2 border-accent text-accent font-mono text-sm hover:bg-accent/10"
            >
              revert to original ({currentSubstitution.originalName})
            </button>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border-2 border-border font-mono hover:border-foreground"
            >
              cancel
            </button>
            <button
              onClick={handleSwap}
              disabled={!selectedId}
              className="flex-1 py-2 px-4 bg-foreground text-background font-mono 
                disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/90"
            >
              swap exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
