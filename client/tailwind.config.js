/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        text: '#1A1A1A',
        primary: '#0F5132',
        primaryHover: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or just sans-serif
      },
    },
  },
  plugins: [],
}
