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
          forest: "#3A2110", // Dark Brown Accent
          green: "#FF8A00",  // Primary Brand Orange
          mint: "#FFB84D",   // Amber (used for active status/telemetry highlight)
        },
        air: {
          clean: "#FFD2A3",  // Light Peach
          cyan: "#FFA347",   // Bright Orange
          sky: "#E06C00",    // Burnt Orange
        },
        carbon: {
          DEFAULT: "#11100E", // Dark Foundation Soft Card
          dark: "#0D0B09",   // Dark Foundation Soft Background
          alert: "#FF8A00",  // Primary Orange
          critical: "#FF4D4D",
        },
        traffic: {
          green: "#39D98A",   // Semantic Traffic Light Green
          yellow: "#FFB84D",  // Semantic Traffic Light Yellow
          red: "#FF4D4D",     // Semantic Traffic Light Red
        },
        bg: {
          DEFAULT: "#090909",
          surface: "rgba(30, 18, 12, 0.68)",
          secondary: "#0D0B09",
        },
        text: {
          primary: "#FFF3E5",
          secondary: "#FFD2A3",
          muted: "#9A8575",
        },
        border: {
          DEFAULT: "rgba(255, 210, 163, 0.12)",
          strong: "rgba(255, 210, 163, 0.22)",
        }
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
