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
        gym: {
          bg: '#13141C',
          card: '#1A1C28',
          cardLighter: '#242738',
          border: '#2B3046',
          primary: '#A3E635', // Verde Lima suave/neón
          primaryHover: '#84CC16',
          lime: '#A3E635',
          lavender: '#C4B5FD', // Lila / Lavanda pastel
          electric: '#38BDF8', // Azul eléctrico
          pureWhite: '#FFFFFF',
          emerald: '#10B981',
          accent: '#38BDF8',
          danger: '#EF4444',
          cyan: '#06B6D4',
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(163, 230, 53, 0.35)',
        'glow-lime': '0 0 25px -5px rgba(163, 230, 53, 0.35)',
        'glow-lavender': '0 0 25px -5px rgba(196, 181, 253, 0.35)',
        'glow-electric': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
      }
    },
  },
  plugins: [],
}