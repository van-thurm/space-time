'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon } from './DieterIcons';

export function ThemeToggle() {
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
      <div className="w-[42px] h-[42px] border-2 border-border" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border-2 border-border hover:border-foreground transition-colors"
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
