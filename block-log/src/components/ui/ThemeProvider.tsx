'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const defaultContext: ThemeContextType = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  mounted: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Update resolved theme based on theme setting
  const updateResolvedTheme = useCallback((t: Theme) => {
    const resolved = t === 'system' ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    
    // Update document class
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [getSystemTheme]);

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('block-log-theme', newTheme);
    updateResolvedTheme(newTheme);
  }, [updateResolvedTheme]);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem('block-log-theme') as Theme | null;
    const initialTheme = stored || 'system';
    setThemeState(initialTheme);
    updateResolvedTheme(initialTheme);
    setMounted(true);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentStored = localStorage.getItem('block-log-theme') as Theme | null;
      if (!currentStored || currentStored === 'system') {
        updateResolvedTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    
    // Re-apply theme when returning to the app (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedTheme = localStorage.getItem('block-log-theme') as Theme | null;
        const currentTheme = storedTheme || 'system';
        setThemeState(currentTheme);
        updateResolvedTheme(currentTheme);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateResolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}
