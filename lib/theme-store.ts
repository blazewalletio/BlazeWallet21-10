import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Theme, ThemeId, getTheme, getDefaultTheme } from './themes';

interface ThemeState {
  currentTheme: Theme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

const defaultTheme = getDefaultTheme();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: defaultTheme,
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
          
          // Add theme class
          root.classList.remove('theme-hot-pink', 'theme-elegant', 'theme-neon');
          root.classList.add(`theme-${theme.id}`);
        }
      },
    }),
    {
      name: 'blaze-theme-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client-side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Skip hydration on server
      skipHydration: typeof window === 'undefined',
    }
  )
);
