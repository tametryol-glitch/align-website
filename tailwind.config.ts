import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#141826',
          secondary: '#1A2035',
          tertiary: '#252D42',
          card: '#1E2640',
          'card-hover': '#283350',
          elevated: '#222B3E',
        },
        accent: {
          primary: '#9B6FF6',
          secondary: '#B8A0FA',
          tertiary: '#D0C5FD',
          muted: 'rgba(155, 111, 246, 0.18)',
        },
        gold: {
          primary: '#F5A623',
          secondary: '#FCC737',
          muted: 'rgba(245, 166, 35, 0.18)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#DEE2EA',
          tertiary: '#A8B0C0',
          muted: '#7B849A',
        },
        border: {
          primary: '#3D4760',
          secondary: '#556178',
          accent: 'rgba(155, 111, 246, 0.35)',
        },
        elements: {
          fire: '#EF4444',
          earth: '#22C55E',
          air: '#3B82F6',
          water: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #1E1145 0%, #2D1B69 100%)',
        'gradient-accent': 'linear-gradient(135deg, #9B6FF6 0%, #7C3AED 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
