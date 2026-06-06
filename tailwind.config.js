/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm, paper-like surfaces
        paper: "#fdfbf7",
        cream: "#f7f3ec",
        sand: "#efe8dc",
        // Warm near-black ink + muted text
        ink: "#2c2823",
        muted: "#6f675c",
        faint: "#9a9082",
        hair: "#e7dfd2",
        // One warm signature accent (terracotta / clay)
        clay: {
          DEFAULT: "#c4633f",
          soft: "#d68a68",
          tint: "#f3e2d8",
          deep: "#a44d2d",
        },
        // Calm data palette
        sage: "#6f8f6a",
        "sage-tint": "#e3ebdf",
        ocean: "#5b7e8c",
        gold: "#bd9a4e",
        // Warm, non-frightening concern red
        brick: "#b04a32",
        "brick-tint": "#f1ddd5",
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(44,40,35,0.04), 0 8px 24px rgba(44,40,35,0.05)",
        lift: "0 2px 4px rgba(44,40,35,0.06), 0 16px 40px rgba(44,40,35,0.08)",
      },
      maxWidth: {
        readable: "44rem",
      },
    },
  },
  plugins: [],
};
