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
        brand: {
          dark: '#0f1419',
          gray: '#1a1f2e',
          gold: '#f59e0b',
          light: '#f3f4f6',
          'light-gray': '#9ca3af',
        },
      },
      backgroundColor: {
        'brand-dark': '#0f1419',
        'brand-gray': '#1a1f2e',
      },
      textColor: {
        'brand-gold': '#f59e0b',
        'brand-light': '#f3f4f6',
        'brand-light-gray': '#9ca3af',
        'brand-dark': '#0f1419',
      },
      borderColor: {
        'brand-gold': '#f59e0b',
      },
    },
  },
  plugins: [],
};
