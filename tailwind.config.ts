import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vs: {
          black:   '#000000',
          surface: '#121212',
          elevated:'#1a1a1a',
          hover:   '#282828',
          border:  '#2a2a2a',
          green:   '#1DB954',
          'green-light': '#1ed760',
          white:   '#ffffff',
          gray:    '#a7a7a7',
          'gray-dark': '#535353',
          red:     '#e91429',
          blue:    '#0d72ea',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        player: '0 -2px 40px rgba(0,0,0,0.7)',
        card:   '0 8px 24px rgba(0,0,0,0.5)',
        green:  '0 0 24px rgba(29,185,84,0.35)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-green': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
};

export default config;
