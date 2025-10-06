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
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'rgb(from var(--color-primary) calc(r * 0.2 + 204) calc(g * 0.2 + 204) calc(b * 0.2 + 204))',
          100: 'rgb(from var(--color-primary) calc(r * 0.3 + 179) calc(g * 0.3 + 179) calc(b * 0.3 + 179))',
          200: 'rgb(from var(--color-primary) calc(r * 0.5 + 128) calc(g * 0.5 + 128) calc(b * 0.5 + 128))',
          300: 'rgb(from var(--color-primary) calc(r * 0.7 + 77) calc(g * 0.7 + 77) calc(b * 0.7 + 77))',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-dark)',
          700: 'rgb(from var(--color-primary) calc(r * 0.7) calc(g * 0.7) calc(b * 0.7))',
          800: 'rgb(from var(--color-primary) calc(r * 0.5) calc(g * 0.5) calc(b * 0.5))',
          900: 'rgb(from var(--color-primary) calc(r * 0.3) calc(g * 0.3) calc(b * 0.3))',
          950: 'rgb(from var(--color-primary) calc(r * 0.15) calc(g * 0.15) calc(b * 0.15))',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: 'rgb(from var(--color-accent) calc(r * 0.2 + 204) calc(g * 0.2 + 204) calc(b * 0.2 + 204))',
          100: 'rgb(from var(--color-accent) calc(r * 0.3 + 179) calc(g * 0.3 + 179) calc(b * 0.3 + 179))',
          200: 'rgb(from var(--color-accent) calc(r * 0.5 + 128) calc(g * 0.5 + 128) calc(b * 0.5 + 128))',
          300: 'rgb(from var(--color-accent) calc(r * 0.7 + 77) calc(g * 0.7 + 77) calc(b * 0.7 + 77))',
          400: 'var(--color-accent)',
          500: 'var(--color-accent)',
          600: 'rgb(from var(--color-accent) calc(r * 0.8) calc(g * 0.8) calc(b * 0.8))',
          700: 'rgb(from var(--color-accent) calc(r * 0.6) calc(g * 0.6) calc(b * 0.6))',
          800: 'rgb(from var(--color-accent) calc(r * 0.4) calc(g * 0.4) calc(b * 0.4))',
          900: 'rgb(from var(--color-accent) calc(r * 0.25) calc(g * 0.25) calc(b * 0.25))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'linear-gradient(135deg, rgb(from var(--color-primary) r g b / 0.1) 0%, rgb(from var(--color-accent) r g b / 0.1) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
