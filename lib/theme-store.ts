import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, ThemeId, getTheme, getDefaultTheme } from './themes';

interface ThemeState {
  currentTheme: Theme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: getDefaultTheme(),
      themeId: 'hot-pink',
      setTheme: (themeId: ThemeId) => {
        const theme = getTheme(themeId);
        set({ currentTheme: theme, themeId });
        
        // Update CSS variables for immediate effect
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.style.setProperty('--theme-bg-primary', theme.background.primary);
          root.style.setProperty('--theme-bg-secondary', theme.background.secondary);
          root.style.setProperty('--theme-accent-primary', theme.accent.primary);
          root.style.setProperty('--theme-accent-secondary', theme.accent.secondary);
          root.style.setProperty('--theme-text-primary', theme.text.primary);
          root.style.setProperty('--theme-text-secondary', theme.text.secondary);
        }
      },
    }),
    {
      name: 'blaze-theme-storage',
    }
  )
);
