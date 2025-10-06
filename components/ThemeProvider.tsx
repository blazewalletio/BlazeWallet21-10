'use client';

import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/lib/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme, getTheme } = useThemeStore();

  // Apply theme on mount and when it changes
  useEffect(() => {
    console.log('🔄 ThemeProvider useEffect triggered, current theme:', currentTheme);
    const theme = getTheme();
    console.log('📦 Got theme from store:', theme.name);
    applyTheme(theme);
    
    // Set theme data attribute for CSS effects
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme, getTheme]);

  console.log('🎨 ThemeProvider render, current theme:', currentTheme);

  return <>{children}</>;
}
