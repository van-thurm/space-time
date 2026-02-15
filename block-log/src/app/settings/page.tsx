'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/components/ui/ThemeProvider';
import { AppFooter } from '@/components/ui/AppFooter';
import { AlertMarkIcon } from '@/components/ui/DieterIcons';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';

export default function SettingsPage() {
  const userSettings = useAppStore((state) => state.userSettings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const programs = useAppStore((state) => state.programs);
  const restoreProgram = useAppStore((state) => state.restoreProgram);
  const deleteProgram = useAppStore((state) => state.deleteProgram);
  const setActiveProgram = useAppStore((state) => state.setActiveProgram);
  const { theme, setTheme } = useTheme();
  const archivedPrograms = programs.filter((program) => program.isArchived);
  const [confirmDeleteArchivedId, setConfirmDeleteArchivedId] = useState<string | null>(null);
  const [confirmRestoreArchivedId, setConfirmRestoreArchivedId] = useState<string | null>(null);
  const [confirmClearData, setConfirmClearData] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <SecondaryPageHeader
        subtitle="settings"
        backFallbackHref="/"
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Appearance Section */}
        <section className="border-2 border-border p-4 space-y-4">
          <h2 className="font-mono font-bold text-base">appearance</h2>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-mono text-sm">theme</p>
              <p className="font-mono text-xs text-muted">light, dark, or system</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="px-3 pr-10 py-2 border-2 border-border bg-background font-mono text-sm
                focus:border-foreground focus:outline-none"
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
              <option value="system">system</option>
            </select>
          </div>
        </section>

        {/* Workout Settings */}
        <section className="border-2 border-border p-4 space-y-4">
          <h2 className="font-mono font-bold text-base">workout</h2>
          
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-mono text-sm">weight units</p>
              <p className="font-mono text-xs text-muted">lbs or kg</p>
            </div>
            <select
              value={userSettings.units}
              onChange={(e) => updateSettings({ units: e.target.value as 'lbs' | 'kg' })}
              className="px-3 pr-10 py-2 border-2 border-border bg-background font-mono text-sm
                focus:border-foreground focus:outline-none"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-border">
            <div className="flex-1 mr-4">
              <p className="font-mono text-sm">cascade weight to all sets</p>
              <p className="font-mono text-xs text-muted">
                when you change the weight on set 1, automatically update sets 2+
              </p>
            </div>
            <button
              onClick={() => updateSettings({ cascadeWeightToSets: !userSettings.cascadeWeightToSets })}
              className={`w-14 h-8 border-2 flex items-center px-1 transition-colors touch-manipulation
                ${userSettings.cascadeWeightToSets 
                  ? 'bg-success border-success' 
                  : 'bg-surface border-border'
                }`}
            >
              <div 
                className={`w-5 h-5 bg-background border border-border transition-transform
                  ${userSettings.cascadeWeightToSets ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-border">
            <div>
              <p className="font-mono text-sm">show smart timer buttons</p>
              <p className="font-mono text-xs text-muted">show timer shortcuts on workout cards and workout header</p>
            </div>
            <button
              onClick={() => updateSettings({ showRestTimer: !userSettings.showRestTimer })}
              className={`w-14 h-8 border-2 flex items-center px-1 transition-colors touch-manipulation
                ${userSettings.showRestTimer 
                  ? 'bg-success border-success' 
                  : 'bg-surface border-border'
                }`}
            >
              <div 
                className={`w-5 h-5 bg-background border border-border transition-transform
                  ${userSettings.showRestTimer ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-border">
            <div className="flex-1 mr-4">
              <p className="font-mono text-sm">keep screen awake</p>
              <p className="font-mono text-xs text-muted">
                keep display on during active workout and timer (if supported)
              </p>
            </div>
            <button
              onClick={() => updateSettings({ keepScreenAwake: !userSettings.keepScreenAwake })}
              className={`w-14 h-8 border-2 flex items-center px-1 transition-colors touch-manipulation
                ${userSettings.keepScreenAwake
                  ? 'bg-success border-success'
                  : 'bg-surface border-border'
                }`}
            >
              <div
                className={`w-5 h-5 bg-background border border-border transition-transform
                  ${userSettings.keepScreenAwake ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>

        {/* Archived Programs */}
        <section className="border-2 border-border p-4 space-y-4">
          <h2 className="font-mono font-bold text-base">archived programs</h2>
          {archivedPrograms.length === 0 ? (
            <p className="font-mono text-xs text-muted">no archived programs yet</p>
          ) : (
            <div className="space-y-2">
              {archivedPrograms.map((program) => (
                <div key={program.id} className="border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold truncate">{program.name}</p>
                  </div>
                  <div className="flex gap-2">
                    {confirmRestoreArchivedId === program.id ? (
                      <>
                        <button
                          onClick={() => {
                            setConfirmRestoreArchivedId(null);
                            setConfirmDeleteArchivedId(null);
                          }}
                          className="flex-1 h-9 border-2 border-border font-mono text-xs text-muted hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                        >
                          cancel
                        </button>
                        <button
                          onClick={() => {
                            setConfirmRestoreArchivedId(null);
                            setConfirmDeleteArchivedId(null);
                            restoreProgram(program.id);
                          }}
                          className="flex-1 h-9 border-2 border-foreground bg-foreground text-background font-mono text-xs hover:bg-foreground/90 transition-colors touch-manipulation"
                        >
                          restore
                        </button>
                        <button
                          onClick={() => {
                            setConfirmRestoreArchivedId(null);
                            setConfirmDeleteArchivedId(null);
                            restoreProgram(program.id);
                            setActiveProgram(program.id);
                          }}
                          className="flex-1 h-9 border-2 border-border font-mono text-xs text-muted hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                        >
                          restore + open
                        </button>
                      </>
                    ) : confirmDeleteArchivedId === program.id ? (
                      <>
                        <button
                          onClick={() => {
                            setConfirmDeleteArchivedId(null);
                            setConfirmRestoreArchivedId(null);
                          }}
                          className="h-9 px-3 border-2 border-border font-mono text-xs text-muted hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                        >
                          cancel
                        </button>
                        <button
                          onClick={() => {
                            deleteProgram(program.id);
                            setConfirmDeleteArchivedId(null);
                          }}
                          className="h-9 px-3 border-2 border-danger bg-danger text-background font-mono text-xs hover:bg-danger/90 transition-colors touch-manipulation"
                        >
                          yes, delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setConfirmDeleteArchivedId(null);
                            setConfirmRestoreArchivedId(program.id);
                          }}
                          className="flex-1 h-9 border-2 border-foreground bg-foreground text-background font-mono text-xs hover:bg-foreground/90 transition-colors touch-manipulation"
                        >
                          restore
                        </button>
                        <button
                          onClick={() => {
                            setConfirmRestoreArchivedId(null);
                            setConfirmDeleteArchivedId(program.id);
                          }}
                          className="w-32 h-9 px-3 border-2 border-danger text-danger font-mono text-xs hover:bg-danger hover:text-background transition-colors touch-manipulation"
                        >
                          delete
                        </button>
                      </>
                    )}
                  </div>
                  {confirmDeleteArchivedId === program.id && (
                    <p className="font-mono text-xs text-muted">
                      are you sure you want to delete? your workout data will also be deleted.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="border-2 border-danger/30 p-4 space-y-4">
          <h2 className="font-mono font-bold text-base text-danger inline-flex items-center gap-2">
            <AlertMarkIcon size={16} />
            danger zone
          </h2>
          
          <div className="flex justify-between items-center py-2">
            <div className="flex-1 mr-4">
              <p className="font-mono text-sm">clear all data</p>
              <p className="font-mono text-xs text-muted">
                delete all workout logs, substitutions, and settings
              </p>
            </div>
            {confirmClearData ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClearData(false)}
                    className="h-9 px-3 border-2 border-border font-mono text-xs text-muted hover:border-foreground hover:text-foreground transition-colors touch-manipulation"
                  >
                    cancel
                  </button>
                  <button
                    onClick={() => {
                      clearAllData();
                      setConfirmClearData(false);
                    }}
                    className="h-9 px-3 border-2 border-danger bg-danger text-background font-mono text-xs hover:bg-danger/90 transition-colors touch-manipulation"
                  >
                    yes, clear
                  </button>
                </div>
                <p className="font-mono text-xs text-muted text-right">
                  are you sure? this will delete all your workout data and cannot be undone.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearData(true)}
                className="w-32 h-9 border-2 border-danger text-danger font-mono text-sm
                  hover:bg-danger hover:text-background active:bg-danger active:text-background 
                  transition-colors touch-manipulation"
              >
                clear data
              </button>
            )}
          </div>
        </section>

      </div>

      <div className="max-w-2xl mx-auto px-4 mt-12">
        <p className="font-mono text-xs text-muted text-center">v1.0.0</p>
      </div>
      <AppFooter className="mt-3" />
    </main>
  );
}
