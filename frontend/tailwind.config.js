/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF8A00",
          bright: "#FF9F1C",
          amber: "#FFB84D",
          gold: "#FFC766",
        },
        foundation: {
          brown: "#24150B",
          dark: "#120D09",
          charcoal: "#171717",
        },
        text: {
          cream: "#FFF3E5",
          primary: "#FFF7ED",
          secondary: "#D6C3AE",
          muted: "#A9947D",
        },
        eco: {
          success: "#22C55E",
          cyan: "#22D3EE",
          danger: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      }
    },
  },
  plugins: [],
}
