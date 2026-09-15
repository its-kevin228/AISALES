/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#010102",
        surface: {
          1: "#0f1011",
          2: "#141516",
          3: "#18191a",
          4: "#1e2022"
        },
        hairline: {
          DEFAULT: "#23252a",
          strong: "#34343a",
          subtle: "#1c1d21"
        },
        ink: {
          DEFAULT: "#f7f8f8",
          muted: "#8a8f98",
          subtle: "#62666d"
        },
        primary: {
          DEFAULT: "#5e6ad2",
          hover: "#828fff",
          muted: "rgba(94, 106, 210, 0.12)"
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
          sky: "#0284c7"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
};
