'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { THEMES, DEFAULT_THEME_KEY, getTheme, type Theme, type ThemeKey } from '@/lib/themes';

const STORAGE_KEY = 'portfolio-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getTheme(DEFAULT_THEME_KEY));

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    const resolved = stored ? getTheme(stored) : getTheme(DEFAULT_THEME_KEY);
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  const setTheme = useCallback((key: ThemeKey) => {
    const next = getTheme(key);
    setThemeState(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, key);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
