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
  fire: {
    id: 'fire',
    name: '🔥 Blaze Fire',
    description: 'Vurige energie en kracht',
    colors: {
      primary: '#ff6b35',      // Vurig oranje
      primaryDark: '#d63447',  // Diep rood
      secondary: '#ff5722',    // Levendig oranje
      accent: '#ffd23f',       // Gouden geel
      background: '#0a0908',   // Bijna zwart met warme tint
      surface: '#1f1715',      // Warm donkerbruin
      text: '#fff8f0',         // Warm wit
      textSecondary: '#d4a574', // Warm beige
    },
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff5722 33%, #d63447 66%, #ffd23f 100%)',
  },
  electric: {
    id: 'electric',
    name: '⚡ Blaze Electric',
    description: 'Elektrische snelheid en innovatie',
    colors: {
      primary: '#00ffff',      // Neon cyan
      primaryDark: '#00d4ff',  // Electric blauw
      secondary: '#b224ef',    // Electric paars
      accent: '#7df9ff',       // Licht electric blauw
      background: '#050510',   // Diep zwart met blauwe tint
      surface: '#0d1117',      // Donker grijs-blauw
      text: '#e4f4ff',         // Koel wit
      textSecondary: '#8b9dc3', // Koel grijs-blauw
    },
    gradient: 'linear-gradient(135deg, #00ffff 0%, #00d4ff 33%, #b224ef 66%, #7df9ff 100%)',
  },
  ocean: {
    id: 'ocean',
    name: '🌊 Blaze Ocean',
    description: 'Diepe kalmte en diepgang',
    colors: {
      primary: '#0ea5e9',      // Oceaan blauw
      primaryDark: '#0369a1',  // Diep oceaan
      secondary: '#06b6d4',    // Turquoise
      accent: '#22d3ee',       // Licht cyan
      background: '#020817',   // Diep oceaan zwart
      surface: '#0f172a',      // Donker blauw-grijs
      text: '#f0f9ff',         // Oceaan wit
      textSecondary: '#7dd3fc', // Licht blauw
    },
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 33%, #0369a1 66%, #22d3ee 100%)',
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
