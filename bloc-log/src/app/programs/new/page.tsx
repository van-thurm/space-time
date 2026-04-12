'use client';

import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getAllTemplates } from '@/data/program-templates';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import type { ProgramTemplate, UserCustomTemplate } from '@/types';

const PROGRAM_NAME_MAX = 48;
const WORKOUT_DAY_NAME_MAX = 32;

export default function NewProgramPage() {
  const router = useRouter();
  const createProgram = useAppStore((state) => state.createProgram);
  const customTemplates = useAppStore((state) => state.customTemplates);
  const deleteCustomTemplate = useAppStore((state) => state.deleteCustomTemplate);
  
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<UserCustomTemplate | null>(null);
  const [programName, setProgramName] = useState('');
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const [customWeeks, setCustomWeeks] = useState(12);
  const [customDayNames, setCustomDayNames] = useState<string[]>(['', '', '', '']);
  const [dayNameError, setDayNameError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const savedTemplatesRef = useRef<HTMLElement | null>(null);

  const allTemplates = getAllTemplates();
  
  // Custom first, then sorted by days per week
  const sortedTemplates = useMemo(() => {
    const custom = allTemplates.find(t => t.id === 'custom');
    const others = allTemplates.filter(t => t.id !== 'custom');
    return custom ? [custom, ...others] : others;
  }, [allTemplates]);

  // Filter by days per week
  const filteredTemplates = useMemo(() => {
    if (dayFilter === null) return sortedTemplates;
    // Keep custom visible only on "all" to avoid confusing day-filter behavior.
    return sortedTemplates.filter((t) => t.id !== 'custom' && t.daysPerWeek === dayFilter);
  }, [sortedTemplates, dayFilter]);

  const availableDays = useMemo(() => {
    const days = new Set(allTemplates.map(t => t.daysPerWeek));
    return Array.from(days).sort((a, b) => a - b);
  }, [allTemplates]);

  const handleSelectTemplate = (template: ProgramTemplate) => {
    setSelectedCustomTemplate(null);
    setSelectedTemplate(template);
    setDayNameError('');
    setProgramName(template.id === 'custom' ? 'my custom program' : template.name);
    if (template.id === 'custom') {
      const isGenericLabel = (l: string) => /^day\s*\d+$/i.test(l.trim());
      const hasRealLabels = template.dayLabels.length > 0 && template.dayLabels.some((l) => l.trim() && !isGenericLabel(l));
      const count = hasRealLabels ? template.dayLabels.length : 4;
      const defaults = hasRealLabels
        ? template.dayLabels.map((l) => (isGenericLabel(l) ? '' : l))
        : Array.from({ length: count }, () => '');
      setCustomWeeks(template.weeksTotal || 12);
      setCustomDayNames(defaults);
    }
    setStep('name');
  };

  const handleSelectCustomTemplate = (template: UserCustomTemplate) => {
    setSelectedTemplate({
      id: 'custom',
      name: template.name,
      shortName: template.shortName,
      description: template.description,
      daysPerWeek: template.daysPerWeek,
      weeksTotal: template.weeksTotal,
      equipment: 'custom',
      focus: 'custom',
      dayLabels: template.dayLabels,
    });
    setSelectedCustomTemplate(template);
    setProgramName(`${template.name} copy`);
    setCustomWeeks(template.weeksTotal);
    setDayNameError('');
    setCustomDayNames(template.dayLabels.length > 0 ? template.dayLabels.map((l) => l || '') : Array.from({ length: 4 }, () => ''));
    setStep('name');
  };

  const handleCreate = () => {
    if (!selectedTemplate || !programName.trim()) return;
    if (selectedTemplate.id === 'custom') {
      if (customDayNames.some((n) => !n.trim())) {
        setDayNameError('all workout days need a name');
        return;
      }
      setDayNameError('');
      createProgram(selectedTemplate.id, programName.trim().slice(0, PROGRAM_NAME_MAX), {
        customWeeksTotal: customWeeks,
        customDaysPerWeek: customDayNames.length,
        customDayLabels: customDayNames.map((name) => name.trim().slice(0, WORKOUT_DAY_NAME_MAX)),
      });
    } else {
      createProgram(selectedTemplate.id, programName.trim().slice(0, PROGRAM_NAME_MAX), {
        customWeeksTotal: selectedTemplate.weeksTotal,
        customDaysPerWeek: selectedTemplate.daysPerWeek,
        customDayLabels: selectedTemplate.dayLabels,
      });
    }
    router.push('/');
  };

  const updateCustomDayName = (index: number, value: string) => {
    setCustomDayNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const moveCustomDay = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= customDayNames.length) return;
    setCustomDayNames((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeCustomDay = (index: number) => {
    if (customDayNames.length <= 1) return;
    setCustomDayNames((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomDay = () => {
    if (customDayNames.length >= 7) return;
    setDayNameError('');
    setCustomDayNames((prev) => [...prev, '']);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteCustomTemplate(templateId);
    setConfirmDeleteId(null);
    if (selectedCustomTemplate?.id === templateId) {
      setSelectedCustomTemplate(null);
      setSelectedTemplate(null);
      setStep('select');
    }
  };

  const handleDuplicateTemplateOnly = (template: UserCustomTemplate) => {
    const copyName = `${template.name} copy`;
    const newTemplate: UserCustomTemplate = {
      ...template,
      id: `user-template-${Date.now()}`,
      name: copyName,
      shortName: copyName.length > 12 ? copyName.substring(0, 12) + '...' : copyName,
      description: `Copy of ${template.name}`,
      createdAt: new Date().toISOString(),
    };
    useAppStore.setState((state) => ({
      customTemplates: [...state.customTemplates, newTemplate],
    }));
  };

  // Visual indicator based on equipment/intensity
  const getIndicator = (template: ProgramTemplate) => {
    if (template.id === 'custom') return { bars: 0, label: 'blank' };
    if (template.equipment === 'minimal') return { bars: 2, label: 'light' };
    if (template.daysPerWeek >= 5) return { bars: 4, label: 'high' };
    if (template.daysPerWeek >= 4) return { bars: 3, label: 'mod' };
    return { bars: 2, label: 'light' };
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      <SecondaryPageHeader
        subtitle="new program"
        backFallbackHref="/programs"
        onBack={step === 'name' ? () => setStep('select') : undefined}
      />

      {step === 'select' ? (
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Day filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setDayFilter(null)}
              className={`px-3 py-1.5 font-sans text-sm border flex-shrink-0 transition-colors touch-manipulation
                ${dayFilter === null 
                  ? 'border-foreground bg-foreground text-background' 
                  : 'border-border hover:border-foreground'
                }`}
            >
              all
            </button>
            {availableDays.map((day) => (
              <button
                key={day}
                onClick={() => setDayFilter(day)}
                className={`px-3 py-1.5 font-sans text-sm border flex-shrink-0 transition-colors touch-manipulation
                  ${dayFilter === day 
                    ? 'border-foreground bg-foreground text-background' 
                    : 'border-border hover:border-foreground'
                  }`}
              >
                {day}d
              </button>
            ))}
            {customTemplates.length > 0 && (
              <button
                onClick={() => savedTemplatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="px-3 py-1.5 font-sans text-sm border flex-shrink-0 transition-colors touch-manipulation border-accent/40 text-accent hover:border-accent"
              >
                saved
              </button>
            )}
          </div>

          {/* Program cards - infographic style */}
          <div className="space-y-2">
            {filteredTemplates.map((template) => {
              const indicator = getIndicator(template);
              const isCustom = template.id === 'custom';
              
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-3 transition-colors touch-manipulation
                    ${isCustom 
                      ? 'border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5' 
                      : 'border border-border hover:border-foreground hover:bg-foreground/5'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Visual indicator - geometric */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      {isCustom ? (
                        <div className="w-8 h-8 border border-dashed border-accent flex items-center justify-center">
                          <span className="text-accent text-lg">+</span>
                        </div>
                      ) : (
                        <div className="flex gap-0.5 items-end h-8">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`w-1.5 transition-colors
                                ${bar <= indicator.bars ? 'bg-foreground' : 'bg-border'}`}
                              style={{ height: `${bar * 6 + 8}px` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-sans font-bold text-sm truncate">
                          {template.shortName || template.name}
                        </h3>
                        {!isCustom && (
                          <span className="font-sans text-xs text-muted flex-shrink-0">
                            {template.daysPerWeek}d · {template.weeksTotal}w
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-xs text-muted mt-0.5 line-clamp-1">
                        {template.description}
                      </p>
                      {!isCustom && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {/* Days chip */}
                          <span className="font-sans text-[10px] px-1.5 py-0.5 bg-surface border border-border">
                            {template.daysPerWeek} days
                          </span>
                          {/* Weeks chip */}
                          <span className="font-sans text-[10px] px-1.5 py-0.5 bg-surface border border-border">
                            {template.weeksTotal} weeks
                          </span>
                          {/* Equipment chip */}
                          <span className={`font-sans text-[10px] px-1.5 py-0.5 ${
                            template.equipment === 'minimal' 
                              ? 'bg-accent/10 text-accent border border-accent/30' 
                              : 'bg-surface border border-border'
                          }`}>
                            {template.equipment === 'minimal' ? 'minimal gear' : 'full gym'}
                          </span>
                          {/* Focus chip */}
                          <span className="font-sans text-[10px] px-1.5 py-0.5 bg-foreground/5 text-muted">
                            {template.focus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {customTemplates.length > 0 && dayFilter === null && (
            <section ref={savedTemplatesRef} className="pt-4 border-t border-border/60 space-y-2">
              <h2 className="font-sans text-sm text-muted">saved custom templates</h2>
              {customTemplates.map((template) => (
                <div key={template.id} className="border border-border transition-colors">
                  {confirmDeleteId === template.id ? (
                    <div className="p-3 space-y-2">
                      <p className="font-sans text-sm">
                        delete <strong>{template.name}</strong>? this won&apos;t affect any existing programs.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 h-10 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                        >
                          cancel
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="flex-1 h-10 border border-danger text-danger font-sans text-sm hover:bg-danger/10 transition-colors touch-manipulation"
                        >
                          delete template
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelectCustomTemplate(template)}
                        className="flex-1 text-left p-3 min-w-0 hover:bg-accent/5 transition-colors touch-manipulation"
                      >
                        <p className="font-sans font-bold text-sm truncate">{template.name}</p>
                        <p className="font-sans text-xs text-muted">
                          {template.daysPerWeek} days · {template.weeksTotal} weeks
                        </p>
                      </button>
                      <div className="flex items-center gap-1 px-2 flex-shrink-0">
                        <button
                          onClick={() => handleDuplicateTemplateOnly(template)}
                          className="px-2 py-1.5 font-sans text-xs text-muted hover:text-foreground transition-colors touch-manipulation"
                          aria-label={`Duplicate ${template.name} template`}
                        >
                          copy
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(template.id)}
                          className="px-2 py-1.5 font-sans text-xs text-muted hover:text-danger transition-colors touch-manipulation"
                          aria-label={`Delete ${template.name} template`}
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Selected template summary */}
          <div className="border border-accent bg-accent/5 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-sans text-xs text-accent uppercase">template</p>
                <h3 className="font-sans font-bold text-lg mt-1">
                  {selectedCustomTemplate ? `${selectedCustomTemplate.name} template` : selectedTemplate?.name}
                </h3>
              </div>
              <button
                onClick={() => setStep('select')}
                className="font-sans text-sm text-muted hover:text-foreground"
              >
                change
              </button>
            </div>
            {selectedTemplate?.id !== 'custom' && (
              <div className="flex gap-4 mt-2 font-sans text-sm text-muted">
                <span>{selectedTemplate?.daysPerWeek} days/week</span>
                <span>{selectedTemplate?.weeksTotal} weeks</span>
              </div>
            )}
            {selectedTemplate?.id === 'custom' && (
              <div className="flex gap-4 mt-2 font-sans text-sm text-muted">
                <span>{customDayNames.length} days/week</span>
                <span>{customWeeks} weeks</span>
              </div>
            )}
          </div>

          {selectedTemplate?.id !== 'custom' && (
            <div className="space-y-2">
              <label className="form-label">program name</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                maxLength={PROGRAM_NAME_MAX}
                placeholder="e.g., spring strength block"
                className="w-full h-12 px-4 border border-border bg-background font-sans
                  focus:border-foreground focus:outline-none"
              />
            </div>
          )}

          {selectedTemplate?.id === 'custom' && (
            <section className="border border-border p-4 space-y-6">
              <div>
                <h3 className="font-display text-xl">build your training block</h3>
                <p className="font-sans text-sm text-muted mt-2">on the next page, open each day to build your workouts.</p>
              </div>

              <div className="space-y-2">
                <label className="form-label">program name</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  maxLength={PROGRAM_NAME_MAX}
                  placeholder="e.g., spring strength block"
                  className="w-full h-12 px-4 border border-border bg-background font-sans
                    focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => setCustomWeeks((w) => Math.max(1, w - 1))}
                    className="w-12 h-12 border border-border font-sans text-xl
                      hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                    aria-label="Decrease weeks"
                  >
                    −
                  </button>
                  <div className="w-16 h-12 border-t border-b border-border flex items-center justify-center font-sans text-xl font-semibold">
                    {customWeeks}
                  </div>
                  <button
                    onClick={() => setCustomWeeks((w) => Math.min(52, w + 1))}
                    className="w-12 h-12 border border-border font-sans text-xl
                      hover:border-foreground active:bg-foreground active:text-background transition-colors touch-manipulation"
                    aria-label="Increase weeks"
                  >
                    +
                  </button>
                </div>
                <span className="font-sans text-sm text-muted">weeks</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="form-label">days</label>
                  <button
                    onClick={addCustomDay}
                    disabled={customDayNames.length >= 7}
                    className="px-2 py-1 border border-border font-sans text-xs
                      hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    + add day
                  </button>
                </div>

                {customDayNames.map((dayName, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <input
                      type="text"
                      value={dayName}
                      onChange={(e) => updateCustomDayName(index, e.target.value)}
                      maxLength={WORKOUT_DAY_NAME_MAX}
                      placeholder="enter workout name"
                      className={`h-10 px-3 border bg-background font-sans text-sm
                        focus:border-foreground focus:outline-none placeholder:text-muted/50
                        ${dayNameError && !dayName.trim() ? 'border-danger' : 'border-border'}`}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveCustomDay(index, -1)}
                        disabled={index === 0}
                        className="w-8 h-8 border border-border font-sans text-xs
                          hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move day up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveCustomDay(index, 1)}
                        disabled={index === customDayNames.length - 1}
                        className="w-8 h-8 border border-border font-sans text-xs
                          hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move day down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeCustomDay(index)}
                        disabled={customDayNames.length <= 1}
                        className="w-8 h-8 border border-border font-sans text-xs text-muted
                          hover:border-danger hover:text-danger disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Remove day"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {dayNameError && (
                  <p className="font-sans text-xs text-danger">{dayNameError}</p>
                )}
              </div>
            </section>
          )}

          {selectedCustomTemplate && (
            <div className="border-t border-border pt-3">
              {confirmDeleteId === selectedCustomTemplate.id ? (
                <div className="space-y-2">
                  <p className="font-sans text-sm">
                    delete <strong>{selectedCustomTemplate.name}</strong>? this won&apos;t affect any existing programs.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 h-10 border border-border font-sans text-sm hover:border-foreground transition-colors touch-manipulation"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(selectedCustomTemplate.id)}
                      className="flex-1 h-10 border border-danger text-danger font-sans text-sm hover:bg-danger/10 transition-colors touch-manipulation"
                    >
                      delete template
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(selectedCustomTemplate.id)}
                  className="font-sans text-xs text-muted hover:text-danger transition-colors touch-manipulation"
                  aria-label={`Delete ${selectedCustomTemplate.name} template`}
                >
                  delete this template
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer - Create/Cancel buttons */}
      {step === 'name' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-foreground">
          <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="py-3 px-4 border border-background text-background font-sans font-medium 
                hover:bg-background/10 transition-colors touch-manipulation"
            >
              cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!programName.trim() || (selectedTemplate?.id === 'custom' && customDayNames.some((n) => !n.trim()))}
              className="flex-1 py-3 px-4 bg-background text-foreground font-sans font-medium 
                hover:bg-background/90 active:bg-accent active:text-background 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors touch-manipulation"
            >
              create program
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}
