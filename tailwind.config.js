import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Tokens de Tema y Bloques Coloridos
        gym: {
          bg: '#121318',         // Oscuro profundo (#121318)
          card: '#181920',       // Contenedor oscuro (#181920)
          cardLighter: '#22232B',// Contenedor secundario
          border: '#272833',     // Borde fino
          primary: '#008000',    // Color Primario de Acento: Verde #008000
          primaryHover: '#006400',
          lime: '#D7F77B',       // Verde Lima pastel para tarjetas de bloque
          lavender: '#DDD6FE',   // Lavanda pastel
          electric: '#93C5FD',   // Azul suave pastel
          pureWhite: '#FAFAFA',
          emerald: '#008000',
          accent: '#008000',
          danger: '#EF4444',
          cyan: '#22D3EE',
        }
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        'xl': '16px',
        '2xl': '20px', // Esquinas muy redondeadas (border-radius: 20px)
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px -3px rgba(0, 128, 0, 0.35)',
        'glow-lime': '0 0 15px -3px rgba(215, 247, 123, 0.35)',
        'glow-accent': '0 0 15px -3px rgba(0, 128, 0, 0.35)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};