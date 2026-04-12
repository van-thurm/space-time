'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAppStore } from '@/lib/store';
import { getTemplate } from '@/data/program-templates';
import { AppFooter } from '@/components/ui/AppFooter';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import { TrashIcon } from '@/components/ui/DieterIcons';
import type { UserProgram } from '@/types';

const PROGRAM_NAME_MAX = 48;
const TEMPLATE_NAME_MAX = 56;
const DAY_NAME_MAX = 32;

// Sortable program card wrapper
interface SortableProgramCardProps {
  program: UserProgram;
  isRecentActive: boolean;
  editModeEnabled: boolean;
  onOpenEdit: () => void;
  onSelect: () => void;
  onOpenAnalytics: () => void;
}

function SortableProgramCard({
  program,
  isRecentActive,
  editModeEnabled,
  onOpenEdit,
  onSelect,
  onOpenAnalytics,
}: SortableProgramCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: program.id, disabled: !editModeEnabled });

  const style = editModeEnabled ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const template = getTemplate(program.templateId);
  const completedWorkouts = program.workoutLogs.filter(l => l.completed).length;
  const daysPerWeek = program.customDaysPerWeek || template.daysPerWeek;
  const totalWorkouts = (program.customWeeksTotal || template.weeksTotal) * daysPerWeek;
  const progressPercent = totalWorkouts > 0 
    ? Math.round((completedWorkouts / totalWorkouts) * 100) 
    : 0;
  const hasTrainingActivity = (log: (typeof program.workoutLogs)[number]) => {
    const hasCompletedSet = log.exercises.some((exerciseLog) =>
      exerciseLog.sets.some((set) => set.reps > 0 || set.status === 'skipped')
    );
    const hasSkippedExercise = Boolean(log.skippedExercises && log.skippedExercises.length > 0);
    return Boolean(log.completed || hasCompletedSet || hasSkippedExercise);
  };
  const completionDate =
    completedWorkouts >= totalWorkouts
      ? [...program.workoutLogs]
          .filter((log) => log.completed)
          .sort(
            (a, b) =>
              new Date(b.completedAt || b.lastActivityAt || b.startedAt || b.date).getTime() -
              new Date(a.completedAt || a.lastActivityAt || a.startedAt || a.date).getTime()
          )
          .map((log) => log.completedAt || log.lastActivityAt || log.startedAt || log.date)[0]
      : undefined;
  const earliestLoggedDate =
    program.workoutLogs.length > 0
      ? [...program.workoutLogs]
          .filter((log) => hasTrainingActivity(log))
          .map((log) => log.startedAt || log.lastActivityAt || log.date)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
      : undefined;
  const startedDate = earliestLoggedDate || program.startedAt || program.createdAt;
  const safeCompletionDate =
    completionDate && new Date(completionDate).getTime() < new Date(startedDate).getTime()
      ? startedDate
      : completionDate;
  const formatShortDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
  };
  const templateLabel =
    program.customDaysPerWeek && program.customDaysPerWeek !== template.daysPerWeek
      ? 'custom'
      : template.shortName;
  const isProgramComplete = totalWorkouts > 0 && completedWorkouts >= totalWorkouts;
  const cardToneClass = isProgramComplete
    ? 'border-success/50 border-l-2 border-l-success bg-success/5'
    : isRecentActive
      ? 'border-accent bg-accent/5'
      : 'border-border hover:border-foreground';
  const progressToneClass = isProgramComplete ? 'bg-success' : isRecentActive ? 'bg-accent' : 'bg-foreground';
  const openButtonClass = isRecentActive
    ? 'text-accent border-accent hover:bg-accent/10'
    : isProgramComplete
      ? 'text-success border-success hover:bg-success/10'
      : 'text-foreground border-border hover:bg-foreground/10 hover:border-foreground';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full text-left border p-4 transition-colors ${cardToneClass}`}
    >
      <div className="flex justify-between items-start gap-2">
        {editModeEnabled && (
          <button
            {...attributes}
            {...listeners}
            className="w-10 h-10 flex items-center justify-center text-accent hover:text-foreground 
              cursor-grab active:cursor-grabbing touch-manipulation flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="4" r="1.5" />
              <circle cx="11" cy="4" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="11" cy="12" r="1.5" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-sans font-bold text-base truncate">{program.name}</h3>
            {isRecentActive && (
              <span className="font-sans text-xs text-accent flex-shrink-0">active</span>
            )}
            {isProgramComplete && (
              <span className="font-sans text-xs text-success flex-shrink-0">complete</span>
            )}
          </div>
          <p className="font-sans text-sm text-muted mt-1">
            {templateLabel} · week {program.currentWeek}/{program.customWeeksTotal || template.weeksTotal}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-sans text-sm">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-surface w-full">
        <div 
          className={`h-full transition-all ${progressToneClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="font-sans text-xs text-muted space-y-0.5">
          <p>{completedWorkouts} workouts done · {daysPerWeek} days/week</p>
          <p>started: {formatShortDate(startedDate)}</p>
          {safeCompletionDate && <p>completed: {formatShortDate(safeCompletionDate)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEdit}
            className="h-9 px-3 font-sans text-xs border border-border text-muted hover:text-foreground hover:border-foreground transition-colors touch-manipulation"
          >
            edit
          </button>
          {isProgramComplete && (
            <button
              onClick={onOpenAnalytics}
              className="h-9 px-3 font-sans text-xs border border-success text-success hover:bg-success/10 transition-colors touch-manipulation"
            >
              report
            </button>
          )}
          <button
            onClick={onSelect}
            className={`h-9 px-3 font-sans text-xs border transition-colors touch-manipulation ${openButtonClass}`}
          >
            open
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const router = useRouter();
  const programs = useAppStore((state) => state.programs);
  const activeProgramId = useAppStore((state) => state.activeProgramId);
  const lastTrainedProgramId = useAppStore((state) => state.lastTrainedProgramId);
  const setActiveProgram = useAppStore((state) => state.setActiveProgram);
  const renameProgram = useAppStore((state) => state.renameProgram);
  const renameWorkoutDay = useAppStore((state) => state.renameWorkoutDay);
  const deleteProgram = useAppStore((state) => state.deleteProgram);
  const archiveProgram = useAppStore((state) => state.archiveProgram);
  const reorderPrograms = useAppStore((state) => state.reorderPrograms);
  const saveAsTemplate = useAppStore((state) => state.saveAsTemplate);
  const updateProgramStructure = useAppStore((state) => state.updateProgramStructure);
  const migrateToMultiProgram = useAppStore((state) => state.migrateToMultiProgram);
  const migrateTemplatePrograms = useAppStore((state) => state.migrateTemplatePrograms);
  const workoutLogs = useAppStore((state) => state.workoutLogs);
  const currentWeek = useAppStore((state) => state.currentWeek);
  
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDangerAction, setConfirmDangerAction] = useState(false);
  const [templateSaveState, setTemplateSaveState] = useState<'idle' | 'saved'>('idle');
  const [templateExpanded, setTemplateExpanded] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftWeeks, setDraftWeeks] = useState(12);
  const [draftWeeksInput, setDraftWeeksInput] = useState('12');
  const [draftDays, setDraftDays] = useState(4);
  const [draftDayNames, setDraftDayNames] = useState<string[]>([]);
  const [structureError, setStructureError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    migrateToMultiProgram();
    migrateTemplatePrograms();
  }, [migrateToMultiProgram, migrateTemplatePrograms]);

  // Filter to non-archived programs and keep active program at the top.
  const sortedPrograms = useMemo(() => {
    const visible = programs.filter((p) => !p.isArchived);
    const activeId = lastTrainedProgramId || activeProgramId;
    if (!activeId) return visible;
    const activeIndex = visible.findIndex((program) => program.id === activeId);
    if (activeIndex <= 0) return visible;
    const activeProgram = visible[activeIndex];
    return [activeProgram, ...visible.slice(0, activeIndex), ...visible.slice(activeIndex + 1)];
  }, [programs, activeProgramId, lastTrainedProgramId]);
  
  const activePrograms = sortedPrograms;
  const selectedProgram = activePrograms.find((program) => program.id === selectedProgramId);
  const canShowReorder = activePrograms.length > 2;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activePrograms.findIndex(p => p.id === active.id);
      const newIndex = activePrograms.findIndex(p => p.id === over.id);
      const newOrder = arrayMove(activePrograms, oldIndex, newIndex);
      reorderPrograms(newOrder.map(p => p.id));
    }
  };

  // Handle selecting a program
  const handleSelectProgram = (programId: string) => {
    setActiveProgram(programId);
    router.push('/');
  };

  const handleOpenProgramAnalytics = (programId: string) => {
    setActiveProgram(programId);
    router.push('/analytics');
  };

  // If no programs and no legacy data, redirect to new program flow
  const hasLegacyData = workoutLogs.length > 0 || currentWeek > 1;

  useEffect(() => {
    if (!canShowReorder && editModeEnabled) {
      setEditModeEnabled(false);
    }
  }, [canShowReorder, editModeEnabled]);
  
  if (activePrograms.length === 0 && !hasLegacyData) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <SecondaryPageHeader subtitle="programs" backFallbackHref="/" />

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="font-sans text-lg">welcome to block log</h2>
            <p className="font-sans text-sm text-muted">
              start your first training program
            </p>
            <Link
              href="/programs/new"
              className="inline-block mt-4 px-6 py-3 bg-foreground text-background font-sans font-medium
                hover:bg-foreground/90 active:bg-accent transition-colors touch-manipulation"
            >
              + new program
            </Link>
          </div>
        </div>
        <AppFooter className="mt-0" />
      </main>
    );
  }
  const openEditModal = (program: UserProgram) => {
    const template = getTemplate(program.templateId);
    const initialDays = program.customDaysPerWeek || template.daysPerWeek;
    const initialDayNames = Array.from({ length: initialDays }, (_, index) => {
      const day = index + 1;
      return (
        program.workoutDayNameOverrides?.[day] ||
        program.customDayLabels?.[index] ||
        template.dayLabels[index] ||
        ''
      );
    });
    const initialWeeks = program.customWeeksTotal || template.weeksTotal;
    setSelectedProgramId(program.id);
    setDraftName(program.name);
    setDraftWeeks(initialWeeks);
    setDraftWeeksInput(String(initialWeeks));
    setDraftDays(initialDays);
    setDraftDayNames(initialDayNames);
    setTemplateName(`${program.name} Template`);
    setConfirmDelete(false);
    setConfirmDangerAction(false);
    setTemplateSaveState('idle');
    setTemplateExpanded(false);
    setStructureError('');
  };

  const closeEditModal = () => {
    setSelectedProgramId(null);
    setConfirmDelete(false);
    setConfirmDangerAction(false);
    setTemplateSaveState('idle');
    setTemplateExpanded(false);
    setStructureError('');
  };

  const handleSaveProgram = () => {
    if (!selectedProgram || !draftName.trim()) return;
    const relevantNames = draftDayNames.slice(0, draftDays);
    if (relevantNames.some((n) => !n.trim())) {
      setStructureError('all workout days need a name');
      return;
    }
    setStructureError('');
    const minWeeksForSave = Math.max(1, selectedProgram.currentWeek);
    const requestedWeeksRaw = Number(draftWeeksInput);
    const requestedWeeks = Number.isFinite(requestedWeeksRaw) && draftWeeksInput !== ''
      ? requestedWeeksRaw
      : draftWeeks;
    const safeWeeks = Math.max(minWeeksForSave, Math.min(52, Math.trunc(requestedWeeks)));
    renameProgram(selectedProgram.id, draftName.trim().slice(0, PROGRAM_NAME_MAX));
    updateProgramStructure(selectedProgram.id, {
      weeksTotal: safeWeeks,
      daysPerWeek: draftDays,
    });
    for (let i = 0; i < draftDays; i += 1) {
      const nextName = relevantNames[i]?.trim();
      if (nextName) {
        renameWorkoutDay(selectedProgram.id, i + 1, nextName.slice(0, DAY_NAME_MAX));
      }
    }
    closeEditModal();
  };

  const handleSaveTemplate = () => {
    if (!selectedProgram || !templateName.trim()) return;
    const templateId = saveAsTemplate(selectedProgram.id, templateName.trim().slice(0, TEMPLATE_NAME_MAX));
    if (!templateId) return;
    setTemplateSaveState('saved');
    setTimeout(() => setTemplateSaveState('idle'), 1200);
  };

  const selectedTemplate = selectedProgram ? getTemplate(selectedProgram.templateId) : null;
  const weeksTotal = selectedProgram ? draftWeeks : 12;
  const daysTotal = selectedProgram ? draftDays : 4;
  const minWeeks = selectedProgram
    ? Math.max(1, selectedProgram.currentWeek)
    : 1;

  const hasDataPastDay = (program: UserProgram, nextDays: number): boolean => {
    return program.workoutLogs.some((log) => {
      const match = /day(\d+)/.exec(log.workoutId);
      const day = match ? Number(match[1]) : 0;
      if (!Number.isFinite(day) || day <= nextDays) return false;
      const hasSetData = log.exercises.some((exercise) =>
        exercise.sets.some((set) => (set.weight || 0) > 0 || (set.reps || 0) > 0 || (set.rpe || 0) > 0 || set.status === 'skipped')
      );
      const hasOtherData =
        Boolean(log.completed) ||
        Boolean(log.skippedExercises?.length) ||
        Boolean(log.addedExercises?.length);
      return hasSetData || hasOtherData;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader
        subtitle="programs"
        backFallbackHref="/"
      />

      {/* Programs list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Edit mode toggle */}
        {canShowReorder && (
          <div className="flex justify-end">
            <button
              onClick={() => setEditModeEnabled(!editModeEnabled)}
              className={`px-3 py-2 font-sans text-sm border transition-colors touch-manipulation
                ${editModeEnabled 
                  ? 'border-accent text-accent bg-accent/10' 
                  : 'border-border text-muted hover:border-foreground hover:text-foreground'
                }`}
            >
              {editModeEnabled ? 'done' : 'reorder'}
            </button>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={activePrograms.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {activePrograms.map((program) => (
              <SortableProgramCard
                key={program.id}
                program={program}
                isRecentActive={program.id === lastTrainedProgramId}
                editModeEnabled={editModeEnabled}
                onOpenEdit={() => openEditModal(program)}
                onSelect={() => handleSelectProgram(program.id)}
                onOpenAnalytics={() => handleOpenProgramAnalytics(program.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add new program button */}
        <Link
          href="/programs/new"
          className="block w-full text-center py-4 border border-dashed border-border 
            hover:border-accent text-muted hover:text-accent font-sans
            transition-colors touch-manipulation"
        >
          + new program
        </Link>
      </div>

      {/* Footer */}
      <AppFooter className="mt-12" />

      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80"
            onClick={closeEditModal}
          />
          <div
            className="relative w-full max-w-md border border-border bg-background p-4 pb-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">edit program</h2>
              <button
                onClick={closeEditModal}
                className="w-11 h-11 border border-border font-sans text-base font-medium leading-none hover:border-foreground transition-colors touch-manipulation"
                aria-label="Close program editor"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="form-label">name</label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={PROGRAM_NAME_MAX}
                className="w-full h-11 px-3 border border-border bg-background font-sans text-sm focus:border-foreground focus:outline-none"
              />
            </div>

            {(() => {
              const template = getTemplate(selectedProgram.templateId);
              const total = (selectedProgram.customWeeksTotal || template.weeksTotal) * (selectedProgram.customDaysPerWeek || template.daysPerWeek);
              const done = selectedProgram.workoutLogs.filter((log) => log.completed).length;
              const isComplete = total > 0 && done >= total;
              if (!isComplete) return null;
              return (
                <div className="border border-success/60 bg-success/10 px-3 py-2 space-y-1">
                  <p className="font-sans text-xs uppercase tracking-wide text-success">program complete</p>
                  <p className="font-sans text-xs text-muted">keep visible, archive it, or extend weeks/days to continue this block.</p>
                </div>
              );
            })()}

            <div className="space-y-2 border-t border-border pt-3">
              <label className="form-label">block length</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStructureError('');
                    setDraftWeeks((value) => {
                      const next = Math.max(minWeeks, value - 1);
                      setDraftWeeksInput(String(next));
                      return next;
                    });
                  }}
                  className="w-11 h-11 border border-border font-sans text-lg hover:border-foreground transition-colors touch-manipulation"
                >
                  -
                </button>
                <div className="flex-1 h-11 border border-border bg-background font-sans text-sm flex items-center justify-center px-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={draftWeeksInput}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setDraftWeeksInput(digitsOnly);
                    }}
                    onBlur={() => {
                      const parsed = Number(draftWeeksInput);
                      const safe = Number.isFinite(parsed) && draftWeeksInput !== ''
                        ? Math.max(minWeeks, Math.min(52, Math.trunc(parsed)))
                        : weeksTotal;
                      setStructureError('');
                      setDraftWeeks(safe);
                      setDraftWeeksInput(String(safe));
                    }}
                    className="w-16 bg-transparent text-center font-sans text-sm focus:outline-none"
                    aria-label="Weeks total"
                  />
                  <span className="text-muted">weeks</span>
                </div>
                <button
                  onClick={() => {
                    setStructureError('');
                    setDraftWeeks((value) => {
                      const next = Math.min(52, value + 1);
                      setDraftWeeksInput(String(next));
                      return next;
                    });
                  }}
                  className="w-11 h-11 border border-border font-sans text-lg hover:border-foreground transition-colors touch-manipulation"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (draftDays <= 1) return;
                    if (hasDataPastDay(selectedProgram, draftDays - 1)) {
                      setStructureError('cannot remove this day because workout data already exists for it.');
                      return;
                    }
                    setStructureError('');
                    setDraftDays((value) => {
                      const next = Math.max(1, value - 1);
                      setDraftDayNames((prev) => prev.slice(0, next));
                      return next;
                    });
                  }}
                  className="w-11 h-11 border border-border font-sans text-lg hover:border-foreground transition-colors touch-manipulation"
                  aria-label="Remove one day from this program"
                >
                  -
                </button>
                <div className="flex-1 h-11 border border-border font-sans text-sm flex items-center justify-center">
                  {daysTotal} days/week
                </div>
                <button
                  onClick={() => {
                    setStructureError('');
                    setDraftDays((value) => {
                      const next = Math.min(7, value + 1);
                      setDraftDayNames((prev) => {
                        if (prev.length >= next) return prev.slice(0, next);
                        const appended = [...prev];
                        while (appended.length < next) {
                          appended.push('');
                        }
                        return appended;
                      });
                      return next;
                    });
                  }}
                  className="w-11 h-11 border border-border font-sans text-lg hover:border-foreground transition-colors touch-manipulation"
                  aria-label="Add one day to this program"
                >
                  +
                </button>
              </div>
              {structureError && (
                <p className="font-sans text-xs text-danger">{structureError}</p>
              )}
              <p className="font-sans text-xs text-muted">
                for data integrity, exercise structure is edited from the workout flow.
              </p>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <label className="form-label">workout day names</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: draftDays }, (_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-12 text-right font-sans text-xs text-muted">day {index + 1}</span>
                    <input
                      type="text"
                      value={draftDayNames[index] || ''}
                      maxLength={DAY_NAME_MAX}
                      placeholder="enter workout name"
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setStructureError('');
                        setDraftDayNames((prev) => {
                          const next = [...prev];
                          next[index] = nextValue;
                          return next;
                        });
                      }}
                      className={`flex-1 h-10 px-3 border bg-background font-sans text-sm focus:border-foreground focus:outline-none placeholder:text-muted/50
                        ${structureError && !(draftDayNames[index] || '').trim() ? 'border-danger' : 'border-border'}`}
                      aria-label={`Workout day ${index + 1} name`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              {!templateExpanded ? (
                <button
                  onClick={() => setTemplateExpanded(true)}
                  className="w-full h-11 border border-accent text-accent font-sans text-sm hover:bg-accent/10 transition-colors touch-manipulation"
                >
                  save as template
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    maxLength={TEMPLATE_NAME_MAX}
                    className="w-full h-11 px-3 border border-border bg-background font-sans text-sm focus:border-foreground focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTemplateExpanded(false)}
                      className="flex-1 h-11 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                      className="flex-1 h-11 border border-accent text-accent font-sans text-sm hover:bg-accent/10 disabled:opacity-50 transition-colors touch-manipulation"
                    >
                      {templateSaveState === 'saved' ? 'saved!' : 'save template'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              {confirmDelete ? (
                <div className="space-y-2">
                  <p className="font-sans text-sm text-muted">
                    are you sure you want to delete? your workout data will also be deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 h-11 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteProgram(selectedProgram.id);
                        closeEditModal();
                      }}
                      className="flex-1 h-11 border border-danger bg-danger text-background font-sans text-sm hover:bg-danger/90 transition-colors touch-manipulation"
                    >
                      yes, delete
                    </button>
                  </div>
                </div>
              ) : confirmDangerAction ? (
                <div className="space-y-2">
                  <p className="font-sans text-sm text-muted">
                    delete/archive this program? deleting removes workout data. archiving keeps it in settings.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDangerAction(false)}
                      className="flex-1 h-11 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => {
                        archiveProgram(selectedProgram.id);
                        closeEditModal();
                      }}
                      className="flex-1 h-11 border border-border font-sans text-sm text-muted hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                    >
                      archive
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDangerAction(false);
                        setConfirmDelete(true);
                      }}
                      className="flex-1 h-11 border border-danger bg-danger text-background font-sans text-sm hover:bg-danger/90 transition-colors touch-manipulation"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDangerAction(true)}
                    className="w-11 h-11 border border-danger text-danger inline-flex items-center justify-center hover:bg-danger hover:text-background transition-colors touch-manipulation"
                    aria-label="Delete or archive program"
                  >
                    <TrashIcon size={16} />
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="flex-1 h-11 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleSaveProgram}
                    disabled={!draftName.trim() || draftDayNames.slice(0, draftDays).some((n) => !(n || '').trim())}
                    className="flex-1 h-11 border border-foreground bg-foreground text-background font-sans text-sm hover:bg-foreground/90 disabled:opacity-50 transition-colors touch-manipulation"
                  >
                    save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
