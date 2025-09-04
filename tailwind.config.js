/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Cambiar la fuente principal para evitar que afecte números
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['CocogooseProTrial', 'sans-serif'], // Solo para títulos
        numbers: ['Inter', 'Arial', 'sans-serif'], // Para números
        heading: ['CocogooseProTrial', 'sans-serif'], // Para encabezados
      },
    },
  },
  plugins: [],
}