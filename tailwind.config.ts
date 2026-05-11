import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070809',
          900: '#0d1011',
          850: '#121617',
          800: '#171d1f',
        },
        aqua: {
          300: '#69f0df',
          400: '#25d9c3',
          500: '#11bba7',
        },
        ember: {
          300: '#ffd28a',
          400: '#f5a949',
          500: '#de7b28',
        },
        berry: {
          400: '#ff6f91',
          500: '#e24c73',
        },
      },
      boxShadow: {
        player: '0 24px 80px rgba(0, 0, 0, 0.48)',
        glow: '0 0 34px rgba(37, 217, 195, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
