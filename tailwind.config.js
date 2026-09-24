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
        // Dark Minimalist tokens
        gym: {
          bg: '#09090B',         // Gris neutro casi negro
          card: '#18181B',       // Zinc-900
          cardLighter: '#27272A',// Zinc-800
          border: '#27272A',     // Borde fino
          primary: '#A3E635',    // Único color de acento (Verde Lima de alto contraste)
          primaryHover: '#84CC16',
          lime: '#A3E635',
          lavender: '#A3E635',
          electric: '#A3E635',
          pureWhite: '#FAFAFA',
          emerald: '#A3E635',
          accent: '#A3E635',
          danger: '#EF4444',
          cyan: '#A3E635',
        }
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        'xl': '14px',
        '2xl': '16px', // 16px para tarjetas y contenedores
        '3xl': '16px', // unificado a 16px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px -3px rgba(163, 230, 53, 0.25)',
        'glow-lime': '0 0 15px -3px rgba(163, 230, 53, 0.25)',
        'glow-accent': '0 0 15px -3px rgba(163, 230, 53, 0.25)',
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