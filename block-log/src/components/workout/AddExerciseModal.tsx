'use client';

import { useState } from 'react';
import type { AddedExercise, ExerciseCategory } from '@/types';

interface AddExerciseModalProps {
  onAdd: (exercise: AddedExercise) => void;
  onClose: () => void;
}

export function AddExerciseModal({ onAdd, onClose }: AddExerciseModalProps) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10');
  const [targetRPE, setTargetRPE] = useState('7-8');
  const [category, setCategory] = useState<ExerciseCategory>('accessory');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const exercise: AddedExercise = {
      id: `added-${Date.now()}`,
      name: name.trim(),
      sets,
      reps,
      targetRPE,
      restSeconds: 60,
      category,
      addedAt: new Date().toISOString(),
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
      <div className="relative bg-background border-2 border-border w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-pixel text-lg">add exercise</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground
              active:text-foreground border border-border hover:border-foreground touch-manipulation"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Exercise name */}
          <div>
            <label className="block font-mono text-sm text-muted mb-1">exercise name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., dumbbell curls"
              className="w-full p-3 border-2 border-border bg-background font-mono text-sm
                focus:border-foreground focus:outline-none touch-manipulation"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-mono text-sm text-muted mb-1">category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
              className="w-full p-3 border-2 border-border bg-background font-mono text-sm
                focus:border-foreground focus:outline-none touch-manipulation"
            >
              <option value="power">power</option>
              <option value="main_lift">main lift</option>
              <option value="accessory">accessory</option>
              <option value="isolation">isolation</option>
              <option value="finisher">finisher</option>
            </select>
          </div>

          {/* Sets and Reps */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-mono text-sm text-muted mb-1">sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 3)}
                min={1}
                max={10}
                className="w-full p-3 border-2 border-border bg-background font-mono text-sm
                  focus:border-foreground focus:outline-none touch-manipulation"
              />
            </div>
            <div className="flex-1">
              <label className="block font-mono text-sm text-muted mb-1">reps</label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10 or 8-10"
                className="w-full p-3 border-2 border-border bg-background font-mono text-sm
                  focus:border-foreground focus:outline-none touch-manipulation"
              />
            </div>
          </div>

          {/* Target RPE */}
          <div>
            <label className="block font-mono text-sm text-muted mb-1">target rpe</label>
            <input
              type="text"
              value={targetRPE}
              onChange={(e) => setTargetRPE(e.target.value)}
              placeholder="7-8"
              className="w-full p-3 border-2 border-border bg-background font-mono text-sm
                focus:border-foreground focus:outline-none touch-manipulation"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-border font-mono 
              hover:border-foreground active:bg-surface transition-colors touch-manipulation"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 px-4 bg-foreground text-background font-mono font-medium 
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
