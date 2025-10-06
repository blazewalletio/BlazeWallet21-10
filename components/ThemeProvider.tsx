'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const currentTheme = useThemeStore((state) => state.currentTheme);

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !currentTheme) return;
    
    // Apply theme CSS variables
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
  }, [currentTheme, mounted]);

  // Render children immediately, theme will apply after mount
  return <>{children}</>;
}
