/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#13c8ec",       // El cian de tus botones
        secondary: "#101f22",    // El oscuro de tus textos/headers
        background: "#f6f8f8",   // El gris clarito de fondo
        accent: "#ff6b6b",       // Para notificaciones o favoritos
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',           // Para esas cards super redondeadas
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
  animation: {
  "spin-slow": "spin 12s linear infinite",
},
}