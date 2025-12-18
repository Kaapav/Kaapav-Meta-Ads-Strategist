/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#C59A3D',
        'brand-dark': '#111827',
        'brand-light': '#FFFFFF',
        'brand-gray': '#374151',
        'brand-light-gray': '#9CA3AF',
      },
    },
  },
  plugins: [],
}
