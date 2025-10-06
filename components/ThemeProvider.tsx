'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { getDefaultTheme } from '@/lib/themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration before accessing theme store
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Use default theme if currentTheme is not yet loaded
    const theme = currentTheme || getDefaultTheme();
    
    // Apply theme CSS variables on mount and when theme changes
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-primary', theme.background.primary);
    root.style.setProperty('--theme-bg-secondary', theme.background.secondary);
    root.style.setProperty('--theme-accent-primary', theme.accent.primary);
    root.style.setProperty('--theme-accent-secondary', theme.accent.secondary);
    root.style.setProperty('--theme-text-primary', theme.text.primary);
    root.style.setProperty('--theme-text-secondary', theme.text.secondary);
    root.style.setProperty('--theme-card-bg', theme.card.background);
    root.style.setProperty('--theme-card-border', theme.card.border);
    
    // Add theme ID as class for conditional styling
    root.classList.remove('theme-hot-pink', 'theme-elegant', 'theme-neon');
    root.classList.add(`theme-${theme.id}`);
  }, [currentTheme, isHydrated]);

  return <>{children}</>;
}
