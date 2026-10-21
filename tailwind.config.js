/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F19',
        panelBg: '#111827',
        neonPurple: '#7C3AED',
        neonGlow: '#A855F7',
      }
    },
  },
  plugins: [],
}