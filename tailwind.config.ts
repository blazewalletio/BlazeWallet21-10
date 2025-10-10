import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vanilla Neon Color Palette
        primary: {
          50: '#FFF9F5',
          100: '#FFF4EB',
          200: '#FFE8D6',
          300: '#FFD4B3', // Peach Glow - main accent
          400: '#FFBF99',
          500: '#FFAA80',
          600: '#FF9566',
          700: '#FF804D',
          800: '#FF6B33',
          900: '#FF561A',
        },
        neon: {
          peach: '#FFD4B3',    // Peach Glow
          lilac: '#E6B3FF',    // Electric Lilac
          aqua: '#B3F0FF',     // Aqua Pop
          lemon: '#FFF4B3',    // Lemon Sorbet
        },
        accent: {
          50: '#F5F0FF',
          100: '#EBE0FF',
          200: '#D6C2FF',
          300: '#E6B3FF', // Electric Lilac - secondary accent
          400: '#D699FF',
          500: '#C680FF',
          600: '#B666FF',
          700: '#A64DFF',
          800: '#9633FF',
          900: '#861AFF',
        },
        // Light mode base colors
        background: {
          primary: '#ffffff',
          secondary: '#fffef9', // Cream
          tertiary: '#fafafa',
        },
        text: {
          primary: '#1a1a1a',   // Deep gray
          secondary: '#4a4a4a', // Slate
          tertiary: '#6a6a6a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #FFD4B3 0%, #E6B3FF 50%, #B3F0FF 100%)',
        'gradient-peach': 'linear-gradient(135deg, #FFD4B3 0%, #FFF4B3 100%)',
        'gradient-lilac': 'linear-gradient(135deg, #E6B3FF 0%, #B3F0FF 100%)',
        'gradient-aqua': 'linear-gradient(135deg, #B3F0FF 0%, #FFF4B3 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255, 212, 179, 0.1) 0%, rgba(230, 179, 255, 0.1) 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(255, 212, 179, 0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(255, 212, 179, 0.3)',
        'neon-md': '0 0 20px rgba(255, 212, 179, 0.4)',
        'neon-lg': '0 0 30px rgba(255, 212, 179, 0.5)',
        'neon-peach': '0 0 20px rgba(255, 212, 179, 0.6)',
        'neon-lilac': '0 0 20px rgba(230, 179, 255, 0.6)',
        'neon-aqua': '0 0 20px rgba(179, 240, 255, 0.6)',
        'soft': '0 2px 20px rgba(26, 26, 26, 0.08)',
        'soft-lg': '0 4px 30px rgba(26, 26, 26, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(255, 212, 179, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 212, 179, 0.6)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(255, 212, 179, 0.4), 0 0 30px rgba(230, 179, 255, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 25px rgba(255, 212, 179, 0.6), 0 0 50px rgba(230, 179, 255, 0.4)',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
