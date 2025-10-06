'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme CSS variables on mount and when theme changes
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-primary', currentTheme.background.primary);
    root.style.setProperty('--theme-bg-secondary', currentTheme.background.secondary);
    root.style.setProperty('--theme-accent-primary', currentTheme.accent.primary);
    root.style.setProperty('--theme-accent-secondary', currentTheme.accent.secondary);
    root.style.setProperty('--theme-text-primary', currentTheme.text.primary);
    root.style.setProperty('--theme-text-secondary', currentTheme.text.secondary);
    root.style.setProperty('--theme-card-bg', currentTheme.card.background);
    root.style.setProperty('--theme-card-border', currentTheme.card.border);
    
    // Add theme ID as class for conditional styling
    root.classList.remove('theme-hot-pink', 'theme-elegant', 'theme-neon');
    root.classList.add(`theme-${currentTheme.id}`);
  }, [currentTheme]);

  return <>{children}</>;
}
