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
  standard: {
    id: 'standard',
    name: '💎 Standard',
    description: 'Professional excellence',
    colors: {
      primary: '#8b5cf6',      // Premium paars
      primaryDark: '#6d28d9',  // Diep paars
      secondary: '#a78bfa',    // Licht paars
      accent: '#c4b5fd',       // Subtle accent
      background: '#0a0a0f',   // Rijk zwart
      surface: '#16161d',      // Premium donkergrijs
      text: '#f8fafc',         // Helder wit
      textSecondary: '#94a3b8', // Professional grijs
    },
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #a78bfa 100%)',
  },
  fire: {
    id: 'fire',
    name: '🔥 Blaze Fire',
    description: 'Inferno unleashed',
    colors: {
      primary: '#ff3c00',      // Intense flame oranje
      primaryDark: '#d01212',  // Lava rood
      secondary: '#ff6b00',    // Burning oranje
      accent: '#ffdd00',       // White-hot geel
      background: '#0f0400',   // Charcoal zwart met ember glow
      surface: '#1a0d00',      // Smoldering bruin-zwart
      text: '#fff5e6',         // Ember wit
      textSecondary: '#ff9966', // Warm flame glow
    },
    gradient: 'linear-gradient(135deg, #ff3c00 0%, #d01212 25%, #ff6b00 50%, #d01212 75%, #ffdd00 100%)',
  },
  electric: {
    id: 'electric',
    name: '⚡ Blaze Electric',
    description: 'Pure voltage',
    colors: {
      primary: '#00ffff',      // Neon cyan
      primaryDark: '#0099ff',  // Electric blauw
      secondary: '#ff00ff',    // Neon magenta
      accent: '#00ff99',       // Electric groen
      background: '#000008',   // Void zwart met electric tint
      surface: '#0a0a14',      // Deep tech zwart
      text: '#e0f7ff',         // Neon wit
      textSecondary: '#66d9ff', // Electric blue glow
    },
    gradient: 'linear-gradient(135deg, #00ffff 0%, #0099ff 20%, #ff00ff 40%, #00ff99 60%, #00ffff 80%, #ff00ff 100%)',
  },
  ocean: {
    id: 'ocean',
    name: '🌊 Blaze Ocean',
    description: 'Abyssal depths',
    colors: {
      primary: '#00d4ff',      // Crystal water cyan
      primaryDark: '#0066cc',  // Deep ocean blauw
      secondary: '#00ffcc',    // Tropical turquoise
      accent: '#66ffff',       // Surf foam cyan
      background: '#000a12',   // Mariana trench zwart
      surface: '#001a2e',      // Deep water navy
      text: '#e6f7ff',         // Sea foam wit
      textSecondary: '#4dd4ff', // Aqua glow
    },
    gradient: 'linear-gradient(135deg, #00d4ff 0%, #0066cc 30%, #00ffcc 60%, #0066cc 80%, #66ffff 100%)',
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
      currentTheme: 'standard', // Default theme
      
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
            return THEMES[get().currentTheme] || THEMES.standard;
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
