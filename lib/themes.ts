export type ThemeId = 'hot-pink' | 'elegant' | 'neon';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  
  // Card colors
  card: {
    background: string;
    border: string;
    hover: string;
    glass: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Accent colors
  accent: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  
  // Button colors
  button: {
    primary: string;
    secondary: string;
    hover: string;
    text: string;
  };
  
  // Special effects
  effects: {
    glow: string;
    shadow: string;
    pulse: boolean;
    scanlines: boolean;
  };
}

export const themes: Record<ThemeId, Theme> = {
  'hot-pink': {
    id: 'hot-pink',
    name: 'Hot Pink Thunder',
    description: 'Energiek & loud - in-your-face crypto!',
    icon: '⚡',
    
    background: {
      primary: '#FF1B8D',
      secondary: '#B645FF',
      gradient: 'linear-gradient(135deg, #FF1B8D 0%, #B645FF 100%)',
    },
    
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.15)',
      glass: 'backdrop-blur-xl bg-white/10 border-white/20',
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.8)',
      accent: '#FF4DB8',
    },
    
    accent: {
      primary: '#FF4DB8',
      secondary: '#FF1B8D',
      gradient: 'linear-gradient(135deg, #FF1B8D 0%, #B645FF 100%)',
    },
    
    button: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.9)',
      text: '#FF1B8D',
    },
    
    effects: {
      glow: '0 0 20px rgba(255, 27, 141, 0.5)',
      shadow: '0 8px 32px rgba(255, 27, 141, 0.3)',
      pulse: true,
      scanlines: false,
    },
  },
  
  'elegant': {
    id: 'elegant',
    name: 'Elegant Thunder',
    description: 'Sophisticated & premium - voor whales!',
    icon: '💎',
    
    background: {
      primary: '#1A0B2E',
      secondary: '#0F0520',
      gradient: 'linear-gradient(135deg, #1A0B2E 0%, #0F0520 100%)',
    },
    
    card: {
      background: 'rgba(180, 69, 255, 0.08)',
      border: 'rgba(180, 69, 255, 0.2)',
      hover: 'rgba(180, 69, 255, 0.12)',
      glass: 'backdrop-blur-xl bg-purple-500/8 border-purple-500/20',
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      accent: '#FF1B8D',
    },
    
    accent: {
      primary: '#FF1B8D',
      secondary: '#B645FF',
      gradient: 'linear-gradient(135deg, #FF1B8D 0%, #B645FF 100%)',
    },
    
    button: {
      primary: 'transparent',
      secondary: 'rgba(255, 27, 141, 0.1)',
      hover: 'rgba(255, 27, 141, 0.2)',
      text: '#FF1B8D',
    },
    
    effects: {
      glow: '0 0 30px rgba(255, 27, 141, 0.3)',
      shadow: '0 8px 32px rgba(180, 69, 255, 0.2)',
      pulse: false,
      scanlines: false,
    },
  },
  
  'neon': {
    id: 'neon',
    name: 'Neon Blaze',
    description: 'Cyberpunk futuristic - blade runner vibes!',
    icon: '🌃',
    
    background: {
      primary: '#0A0118',
      secondary: '#000000',
      gradient: 'linear-gradient(135deg, #0A0118 0%, #000000 100%)',
    },
    
    card: {
      background: 'rgba(10, 1, 24, 0.8)',
      border: '#FF1B8D',
      hover: 'rgba(10, 1, 24, 0.9)',
      glass: 'backdrop-blur-sm bg-slate-950/80 border-[#FF1B8D] border-2',
    },
    
    text: {
      primary: '#FFFFFF',
      secondary: '#00F0FF',
      accent: '#FF1B8D',
    },
    
    accent: {
      primary: '#FF1B8D',
      secondary: '#B645FF',
      gradient: 'linear-gradient(135deg, #FF1B8D 0%, #B645FF 50%, #00F0FF 100%)',
    },
    
    button: {
      primary: 'transparent',
      secondary: 'rgba(255, 27, 141, 0.1)',
      hover: 'rgba(255, 27, 141, 0.3)',
      text: '#FF1B8D',
    },
    
    effects: {
      glow: '0 0 40px rgba(255, 27, 141, 0.8), 0 0 80px rgba(182, 69, 255, 0.4)',
      shadow: '0 0 20px rgba(255, 27, 141, 0.5), inset 0 0 20px rgba(182, 69, 255, 0.2)',
      pulse: true,
      scanlines: true,
    },
  },
};

export const getTheme = (id: ThemeId): Theme => themes[id];
export const getDefaultTheme = (): Theme => themes['hot-pink'];
