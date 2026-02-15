'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon } from './DieterIcons';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, theme, mounted } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      // If on system, switch to opposite of current
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
  };

  // Prevent hydration mismatch - render placeholder during SSR
  if (!mounted) {
    return (
      <div
        className={`w-[42px] h-[42px] shrink-0 border-2 border-border ${className}`.trim()}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center border-2 border-border hover:border-foreground active:bg-surface transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`.trim()}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon size={18} />
      ) : (
        <MoonIcon size={18} />
      )}
    </button>
  );
}
