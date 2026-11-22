/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          navy: '#0A192F',
          dark: '#050D1A',
          sidebar: '#071326',
          card: '#10223E',
          accent: '#00D4FF',
          blue: '#1E6091',
          crimson: '#FF4757',
          amber: '#FFA502',
          emerald: '#2ED573'
        }
      }
    },
  },
  plugins: [],
}
