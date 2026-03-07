'use client';

import { useState, useEffect, useCallback } from 'react';
import { SecondaryPageHeader } from '@/components/ui/SecondaryPageHeader';
import { clampTimerSeconds } from '@/lib/timer';

// Timer presets in seconds
const PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
  { label: '4m', value: 240 },
];
const ALARM_COLOR = '#d66a2f';

function stableCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export default function TimerPage() {
  const [returnTo, setReturnTo] = useState('/');
  const [duration, setDuration] = useState(60); // seconds
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate dial angle (0 = 12 o'clock, goes clockwise)
  const progress = remaining / duration;
  const dialAngle = (1 - progress) * 360;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  // Keep screen awake while timer/workout context is active (best effort).
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      if (!('wakeLock' in navigator)) return;
      if (!isRunning) return;
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch {
        // Ignore unsupported/permission errors silently.
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLock) wakeLock.release().catch(() => undefined);
    };
  }, [isRunning]);

  // Start timer
  const handleStart = useCallback(() => {
    setIsComplete(false);
    setIsRunning(true);
  }, []);

  // Pause timer
  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset timer
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setRemaining(duration);
  }, [duration]);

  // Set preset duration
  const handlePreset = useCallback((value: number) => {
    setDuration(value);
    setRemaining(value);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  // Adjust time with +/- buttons
  const adjustTime = useCallback((delta: number) => {
    if (isRunning) return;
    const newDuration = Math.max(10, Math.min(240, duration + delta));
    setDuration(newDuration);
    setRemaining(newDuration);
    setIsComplete(false);
  }, [duration, isRunning]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get('returnTo') || '/');
    const presetDuration = params.get('duration');
    const parsedDuration = presetDuration ? Number(presetDuration) : 60;
    const nextDuration = clampTimerSeconds(parsedDuration);
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  return (
    <main 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isComplete ? '' : 'bg-background'
      }`}
      style={isComplete ? { backgroundColor: ALARM_COLOR } : undefined}
    >
      <SecondaryPageHeader
        subtitle="rest timer"
        backFallbackHref={returnTo}
        headerClassName={`border-b sticky top-0 z-40 ${
          isComplete ? 'border-white/30' : 'border-border bg-background'
        }`}
        backButtonClassName={
          isComplete
            ? 'border-white/60 text-white hover:border-white hover:text-white active:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-danger'
            : ''
        }
        appNameClassName={`inline-flex items-center justify-center gap-2 font-display font-bold text-lg leading-none transition-colors ${
          isComplete ? 'text-white hover:text-white/80' : 'hover:text-accent'
        }`}
        subtitleClassName={`font-sans text-sm ${isComplete ? 'text-white/80' : 'text-muted'}`}
      />

      {/* Main dial area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Dial */}
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Outer ring */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={isComplete ? 'rgba(255,255,255,0.2)' : 'var(--border)'}
              strokeWidth="4"
            />
            
            {/* Progress arc */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={isComplete ? 'white' : 'var(--foreground)'}
              strokeWidth="4"
              strokeDasharray={`${progress * 565.48} 565.48`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-200"
            />

            {/* Tick marks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = stableCoord(100 + Math.cos(angle) * 78);
              const y1 = stableCoord(100 + Math.sin(angle) * 78);
              const x2 = stableCoord(100 + Math.cos(angle) * 85);
              const y2 = stableCoord(100 + Math.sin(angle) * 85);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isComplete ? 'rgba(255,255,255,0.5)' : 'var(--muted)'}
                  strokeWidth="2"
                />
              );
            })}

            {/* Dial needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={isComplete ? 'white' : 'var(--accent)'}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${dialAngle} 100 100)`}
              className="transition-transform duration-200"
            />

            {/* Center dot */}
            <circle
              cx="100"
              cy="100"
              r="6"
              fill={isComplete ? 'white' : 'var(--foreground)'}
            />
          </svg>

        </div>

        {/* Time display */}
        <div className="mt-4 text-center">
          {!isRunning && !isComplete ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustTime(-10)}
                className="w-12 h-12 border border-border font-sans text-2xl leading-none
                  hover:border-foreground active:bg-foreground active:text-background
                  transition-colors touch-manipulation"
                aria-label="Decrease timer by 10 seconds"
              >
                -
              </button>
              <span className="font-sans text-5xl md:text-6xl font-bold tabular-nums">
                {formatTime(remaining)}
              </span>
              <button
                onClick={() => adjustTime(10)}
                className="w-12 h-12 border border-border font-sans text-2xl leading-none
                  hover:border-foreground active:bg-foreground active:text-background
                  transition-colors touch-manipulation"
                aria-label="Increase timer by 10 seconds"
              >
                +
              </button>
            </div>
          ) : (
            <span className={`font-sans text-5xl md:text-6xl font-bold tabular-nums ${isComplete ? 'text-white' : ''}`}>
              {formatTime(remaining)}
            </span>
          )}
        </div>

        {/* Complete message */}
        {isComplete && (
          <div className="mt-4 text-center">
            <p className="font-display text-2xl text-white animate-pulse">
              times up!
            </p>
          </div>
        )}

        {/* Preset buttons */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePreset(preset.value)}
              className={`px-3 py-2 font-sans text-sm border transition-colors touch-manipulation
                ${duration === preset.value && !isComplete
                  ? 'border-foreground bg-foreground text-background'
                  : isComplete
                    ? 'border-white/30 text-white/70 hover:border-white hover:text-white'
                    : 'border-border hover:border-foreground'
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <footer className={`border-t ${isComplete ? 'border-white/20' : 'border-border'}`}>
        <div className="max-w-md mx-auto px-4 py-4 flex gap-3">
          {isComplete ? (
            <button
              onClick={handleReset}
              className="flex-1 py-4 bg-white text-danger font-sans font-bold
                hover:bg-white/90 transition-colors touch-manipulation"
            >
              reset
            </button>
          ) : isRunning ? (
            <>
              <button
                onClick={handlePause}
                className="flex-1 py-4 border border-foreground text-foreground font-sans font-bold
                  hover:bg-foreground/10 transition-colors touch-manipulation"
              >
                pause
              </button>
              <button
                onClick={handleReset}
                className="py-4 px-6 border border-foreground text-foreground font-sans
                  hover:bg-foreground/10 transition-colors touch-manipulation"
              >
                reset
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStart}
                className="flex-1 py-4 bg-foreground text-background font-sans font-bold
                  hover:bg-foreground/90 transition-colors touch-manipulation"
              >
                {remaining < duration ? 'resume' : 'start'}
              </button>
              {remaining < duration && (
                <button
                  onClick={handleReset}
                  className="py-4 px-6 border border-foreground text-foreground font-sans
                    hover:bg-foreground/10 transition-colors touch-manipulation"
                >
                  reset
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </main>
  );
}
