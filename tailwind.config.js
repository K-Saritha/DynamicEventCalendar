/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-hover': '#3d3d3d'
      },
      textColor: {
        'dark-primary': '#e1e1e1',
        'dark-secondary': '#a1a1a1'
      },
      borderColor: {
        'dark-border': '#404040'
      }
    },
  },
  plugins: [],
};
