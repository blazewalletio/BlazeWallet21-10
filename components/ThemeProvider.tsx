'use client';

import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/lib/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, getTheme } = useThemeStore();

  // Apply theme on mount and when it changes
  useEffect(() => {
    const theme = getTheme();
    applyTheme(theme);
  }, [currentTheme, getTheme]);

  return <>{children}</>;
}
