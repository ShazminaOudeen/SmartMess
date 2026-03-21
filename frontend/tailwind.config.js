/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        jungle: {
          50: '#e6f0e6',
          100: '#c0d9c0',
          200: '#9ac09a',
          300: '#74a774',
          400: '#4e8e4e',
          500: '#2d6a4f',  // Jungle green
          600: '#1e4d3a',
          700: '#144b37',
          800: '#0b3b2a',
          900: '#0a3625',
          950: '#052015',  // Very dark jungle
        },
      },
    },
  },
  plugins: [],
}