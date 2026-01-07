/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3D00',
        'primary-dark': '#E63500',
        'primary-light': '#FF6E40',
        secondary: '#0A0A0A',
        accent: '#FFD600',
      },
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
}