'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { warmupExercises } from '@/data/program';
import { GeometricCheck } from '@/components/ui/DieterIcons';

interface WarmupItem {
  id: string;
  name: string;
  reps: string;
  notes?: string;
  isCustom?: boolean;
}

// Sortable warmup item wrapper
function SortableWarmupItem({ 
  item, 
  index,
  isComplete,
  isEditing,
  onToggle,
  onSkip,
  onRemove 
}: { 
  item: WarmupItem;
  index: number;
  isComplete: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onSkip: (e: React.MouseEvent) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditing });

  const style = isEditing ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const isCustom = item.isCustom;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border-b border-border last:border-b-0 ${
        isComplete ? 'bg-surface/50 opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {isEditing && (
          <button
            {...attributes}
            {...listeners}
            className="w-6 h-6 flex items-center justify-center text-accent hover:text-foreground 
              cursor-grab active:cursor-grabbing touch-manipulation"
            aria-label="Drag to reorder"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="4" r="1.5" />
              <circle cx="11" cy="4" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="11" cy="12" r="1.5" />
            </svg>
          </button>
        )}
        
        <button
          onClick={onToggle}
          className={`
            w-6 h-6 border-2 flex-shrink-0
            flex items-center justify-center font-mono text-xs
            transition-colors touch-manipulation
            ${isComplete 
              ? 'bg-foreground text-background border-foreground' 
              : 'border-border hover:border-foreground'
            }
          `}
        >
          {isComplete ? <GeometricCheck size={12} /> : index + 1}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`font-mono text-sm ${isComplete ? 'line-through text-muted' : ''}`}>
              {item.name}
            </span>
            <span className="font-mono text-xs text-muted">
              {item.reps}
            </span>
            {isCustom && (
              <span className="font-mono text-xs text-accent">+</span>
            )}
          </div>
        </div>

        {/* Skip/remove button */}
        <button
          onClick={(e) => isCustom ? onRemove() : onSkip(e)}
          className="w-6 h-6 flex items-center justify-center text-muted hover:text-foreground 
            text-xs touch-manipulation"
          aria-label={isCustom ? 'Remove' : 'Skip'}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function WarmupSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [skippedItems, setSkippedItems] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<WarmupItem[]>([]);
  const [itemOrder, setItemOrder] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemReps, setNewItemReps] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Combine default and custom items
  const allItems = [
    ...warmupExercises.map(e => ({ 
      id: e.id, 
      name: e.name, 
      reps: e.reps, 
      notes: e.notes 
    })),
    ...customItems
  ];
  
  // Sort items by saved order, or use default order
  const sortedItems = itemOrder.length > 0
    ? [...allItems].sort((a, b) => {
        const aIndex = itemOrder.indexOf(a.id);
        const bIndex = itemOrder.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
    : allItems;
    
  const activeItems = sortedItems.filter(item => !skippedItems.has(item.id));

  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  const skipItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSkipped = new Set(skippedItems);
    newSkipped.add(id);
    setSkippedItems(newSkipped);
    // Also remove from completed if it was there
    const newCompleted = new Set(completedItems);
    newCompleted.delete(id);
    setCompletedItems(newCompleted);
  };

  const restoreItem = (id: string) => {
    const newSkipped = new Set(skippedItems);
    newSkipped.delete(id);
    setSkippedItems(newSkipped);
  };

  const addCustomItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: WarmupItem = {
      id: `custom-warmup-${Date.now()}`,
      name: newItemName.trim(),
      reps: newItemReps.trim() || '10',
      isCustom: true,
    };
    
    setCustomItems([...customItems, newItem]);
    // Add to order
    setItemOrder([...itemOrder, newItem.id]);
    setNewItemName('');
    setNewItemReps('');
    setIsAdding(false);
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
    setItemOrder(itemOrder.filter(itemId => itemId !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentOrder = itemOrder.length > 0 ? itemOrder : allItems.map(i => i.id);
      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
      setItemOrder(newOrder);
    }
  };

  const completedCount = activeItems.filter(item => completedItems.has(item.id)).length;
  const allComplete = completedCount === activeItems.length && activeItems.length > 0;

  return (
    <div className="border-2 border-border">
      {/* Header - clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex justify-between items-center hover:bg-surface transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold">warmup</span>
          <span className={`font-mono text-sm ${allComplete ? 'text-success' : 'text-muted'}`}>
            {completedCount}/{activeItems.length}
          </span>
        </div>
        <span className="font-mono text-muted">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t-2 border-border">
          {/* Edit mode toggle */}
          <div className="px-3 py-2 flex justify-end border-b border-border">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2 py-1 font-mono text-xs border transition-colors touch-manipulation
                ${isEditing 
                  ? 'border-accent text-accent bg-accent/10' 
                  : 'border-border text-muted hover:border-foreground hover:text-foreground'
                }`}
            >
              {isEditing ? 'done' : 'reorder'}
            </button>
          </div>

          {/* Active items with drag-and-drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activeItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {activeItems.map((item, index) => (
                <SortableWarmupItem
                  key={item.id}
                  item={item}
                  index={index}
                  isComplete={completedItems.has(item.id)}
                  isEditing={isEditing}
                  onToggle={() => toggleItem(item.id)}
                  onSkip={(e) => skipItem(item.id, e)}
                  onRemove={() => removeCustomItem(item.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add custom warmup */}
          {isAdding ? (
            <div className="p-3 border-t border-border space-y-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="exercise name"
                className="w-full p-2 border-2 border-border bg-background font-mono text-sm
                  focus:border-foreground focus:outline-none touch-manipulation"
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemReps}
                  onChange={(e) => setNewItemReps(e.target.value)}
                  placeholder="reps (e.g., 10)"
                  className="flex-1 p-2 border-2 border-border bg-background font-mono text-sm
                    focus:border-foreground focus:outline-none touch-manipulation"
                />
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 border-2 border-border font-mono text-sm 
                    hover:border-foreground touch-manipulation"
                >
                  cancel
                </button>
                <button
                  onClick={addCustomItem}
                  disabled={!newItemName.trim()}
                  className="px-3 py-2 bg-foreground text-background font-mono text-sm 
                    disabled:opacity-50 touch-manipulation"
                >
                  add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full p-3 border-t border-dashed border-border text-muted hover:text-accent 
                font-mono text-sm text-left touch-manipulation transition-colors"
            >
              + add warmup exercise
            </button>
          )}

          {/* Skipped items - restore option */}
          {skippedItems.size > 0 && (
            <div className="p-3 border-t border-border">
              <p className="font-mono text-xs text-muted mb-2">skipped:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(skippedItems).map(id => {
                  const item = allItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => restoreItem(id)}
                      className="px-2 py-1 border border-border font-mono text-xs text-muted 
                        hover:text-foreground hover:border-foreground touch-manipulation"
                    >
                      {item.name} ↩
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
