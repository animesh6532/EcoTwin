/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          forest: "#166534",
          green: "#16A34A",
          mint: "#22C55E",
        },
        air: {
          clean: "#0EA5A4",
          cyan: "#06B6D4",
          sky: "#0EA5E9",
        },
        carbon: {
          DEFAULT: "#334155",
          dark: "#1E293B",
          alert: "#EA580C",
          critical: "#DC2626",
        },
        traffic: {
          green: "#16A34A",
          yellow: "#EAB308",
          red: "#DC2626",
        },
        bg: {
          DEFAULT: "#F8FAFC",
          surface: "#FFFFFF",
          secondary: "#F1F5F9",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
        }
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
