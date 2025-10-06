import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradient: string;
}

export const THEMES: Record<string, Theme> = {
  blaze: {
    id: 'blaze',
    name: '🔥 Blaze',
    description: 'Set your finances on fire',
    colors: {
      primary: '#f97316',      // Orange
      primaryDark: '#c2410c',  // Dark Orange
      secondary: '#ef4444',    // Red
      accent: '#f59e0b',       // Amber
      background: '#020617',   // Slate 950
      surface: '#1e293b',      // Slate 800
      text: '#f8fafc',         // Slate 50
      textSecondary: '#94a3b8', // Slate 400
    },
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #f59e0b 100%)',
  },
  ocean: {
    id: 'ocean',
    name: '🌊 Ocean',
    description: 'Deep blue waters',
    colors: {
      primary: '#06b6d4',      // Cyan
      primaryDark: '#0891b2',  // Cyan 600
      secondary: '#3b82f6',    // Blue
      accent: '#8b5cf6',       // Purple
      background: '#020617',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
  },
  midnight: {
    id: 'midnight',
    name: '🌙 Midnight',
    description: 'Dark elegance',
    colors: {
      primary: '#8b5cf6',      // Purple
      primaryDark: '#7c3aed',  // Purple 600
      secondary: '#a78bfa',    // Purple 400
      accent: '#c4b5fd',       // Purple 300
      background: '#0f172a',   // Slate 900
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
  },
  emerald: {
    id: 'emerald',
    name: '💎 Emerald',
    description: 'Fresh and vibrant',
    colors: {
      primary: '#10b981',      // Emerald 500
      primaryDark: '#059669',  // Emerald 600
      secondary: '#14b8a6',    // Teal 500
      accent: '#22c55e',       // Green 500
      background: '#020617',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #22c55e 100%)',
  },
  sunset: {
    id: 'sunset',
    name: '🌅 Sunset',
    description: 'Warm and vibrant',
    colors: {
      primary: '#f59e0b',      // Amber
      primaryDark: '#d97706',  // Amber 600
      secondary: '#f97316',    // Orange
      accent: '#fb923c',       // Orange 400
      background: '#020617',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb923c 100%)',
  },
  rose: {
    id: 'rose',
    name: '🌹 Rose',
    description: 'Elegant pink tones',
    colors: {
      primary: '#ec4899',      // Pink 500
      primaryDark: '#db2777',  // Pink 600
      secondary: '#f43f5e',    // Rose 500
      accent: '#fb7185',       // Rose 400
      background: '#020617',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb7185 100%)',
  },
};

interface ThemeStore {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  getTheme: () => Theme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'fire', // Default theme
      
      setTheme: (themeId: string) => {
        console.log('🔧 setTheme called with:', themeId);
        if (THEMES[themeId]) {
          console.log('✅ Theme exists, applying:', THEMES[themeId].name);
          set({ currentTheme: themeId });
          applyTheme(THEMES[themeId]);
          console.log('🎨 Theme applied!');
        } else {
          console.error('❌ Theme not found:', themeId);
        }
      },
      
          getTheme: () => {
            return THEMES[get().currentTheme] || THEMES.fire;
          },
    }),
    {
      name: 'blaze-theme-storage',
    }
  )
);

// Apply theme to CSS variables
export function applyTheme(theme: Theme) {
  console.log('🎨 applyTheme called for:', theme.name);
  
  if (typeof window === 'undefined') {
    console.log('⚠️ Window is undefined, skipping theme application');
    return;
  }
  
  const root = document.documentElement;
  console.log('📝 Setting CSS variables...');
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--gradient-primary', theme.gradient);
  
  console.log('✅ CSS variables set:', {
    primary: root.style.getPropertyValue('--color-primary'),
    gradient: root.style.getPropertyValue('--gradient-primary')
  });
}

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();
  applyTheme(store.getTheme());
}
