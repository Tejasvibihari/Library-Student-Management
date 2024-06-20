/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      extend: {
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
          'cedarville-cursive': ['Cedarville Cursive', 'cursive'],
        }
      },
    },

  },
  plugins: [],
}