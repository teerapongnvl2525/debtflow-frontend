/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0e18",
        surface: "#131620",
        surface2: "#1c2033",
        border: "#2a2f47",
        income: "#34d399",
        expense: "#f87171",
        invest: "#60a5fa",
        debt: "#fb923c",
        transfer: "#fbbf24",
      },
      fontFamily: {
        sans: ["Sarabun", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
