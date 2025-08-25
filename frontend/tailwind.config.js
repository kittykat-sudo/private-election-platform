/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Use 'class' strategy for dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure all React files are scanned
  ],
  theme: {
    extend: {
      colors: {
        'zinc-900': '#18181b', // Dark mode background
        'zinc-100': '#f4f4f5', // Light mode background
      },
    },
  },
  plugins: [],
};