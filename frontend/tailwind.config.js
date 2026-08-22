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
          bright: "#FF9D24",
          light: "#FFA347",
          amber: "#FFB84D",
          amberGlow: "#FFC76A",
        },
        foundation: {
          dark: "#050505",
          soft: "#080706",
          brown: "#0D0A08",
          warm: "#120D09",
          panel: "#18110B",
          c1: "#2A170C",
          c2: "#3A2110",
          c3: "#512A0D",
        },
        text: {
          cream: "#FFF3E5",
          peach: "#FFE7CC",
          pale: "#FFD2A3",
          muted: "#B89B82",
          dim: "#8D7868",
        },
        eco: {
          success: "#39D98A",
          danger: "#FF4D4D",
          warning: "#FFB84D",
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
