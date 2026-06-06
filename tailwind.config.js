/** @type {import('tailwindcss').Config} */
// Tokens mirror the HeartSum design system (tokens/*.css). Warm, low-saturation
// ivory-and-clay — a quiet, well-lit room, never a hospital. One hero accent.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces (warm ivory). Names kept; values are the DS spec:
        // paper = card surface, cream = app canvas, sand = sunken.
        paper: "#ffffff", // --surface
        "surface-soft": "#fbfaf7", // --surface-soft
        cream: "#faf9f5", // --canvas
        sand: "#f0eee6", // --sunken
        inset: "#f4f2ea", // --surface-inset
        // Warm charcoal ink + muted text (never pure black / cold grey)
        ink: "#23211d", // --text-primary
        muted: "#6f6b62", // --text-secondary
        faint: "#908b7e", // --text-tertiary
        hair: "#e7e2d6", // --border
        "hair-strong": "#d9d3c5", // --border-strong
        // One warm signature accent (clay / terracotta) — used sparingly
        clay: {
          DEFAULT: "#c2603d", // --clay
          soft: "#cc785c", // --clay-soft
          tint: "#f6e9e1", // --clay-wash
          deep: "#ab502f", // --clay-hover
          border: "#e7c7b6", // --clay-border
        },
        // Status palette (muted, low-sat). sage = steady, gold = watch, brick = review.
        sage: {
          DEFAULT: "#5b7553", // --steady
          deep: "#46603f", // --steady-text
          tint: "#e9eee4", // --steady-wash
          border: "#cbd8c2", // --steady-border
        },
        gold: {
          DEFAULT: "#b0822f", // --watch
          deep: "#855f1e", // --watch-text
          tint: "#f6eedc", // --watch-wash
          border: "#e6d5ae", // --watch-border
        },
        brick: {
          DEFAULT: "#b5503f", // --review
          deep: "#97402f", // --review-text
          tint: "#f6e4de", // --review-wash
          border: "#e8c3b7", // --review-border
        },
        ocean: {
          DEFAULT: "#5a7d87", // --neutral-data
          deep: "#466169",
          tint: "#e5edee",
          border: "#c4d5d8",
        },
        // Evidence tiers
        tier1: { DEFAULT: "#4f6f73", tint: "#e2ecec" },
        tier2: { DEFAULT: "#6e8a66", tint: "#e9efe3" },
        tier3: { DEFAULT: "#908b7e", tint: "#f0eee6" },
        // Chart palette
        chart: {
          heart: "#c2603d",
          metabolic: "#5a7d87",
          baseline: "#bbb4a4",
          grid: "#ece8dd",
        },
      },
      fontFamily: {
        serif: ['"Lora"', "Georgia", '"Times New Roman"', "serif"],
        sans: [
          '"Hanken Grotesk"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Larger, legible scale — read by older eyes (px values from the DS).
        xs: ["0.8125rem", { lineHeight: "1.4" }], // 13
        sm: ["0.9375rem", { lineHeight: "1.5" }], // 15
        base: ["1.0625rem", { lineHeight: "1.5" }], // 17
        lg: ["1.1875rem", { lineHeight: "1.5" }], // 19
        xl: ["1.3125rem", { lineHeight: "1.3" }], // 21
        "2xl": ["1.625rem", { lineHeight: "1.2" }], // 26
        "3xl": ["2.125rem", { lineHeight: "1.15" }], // 34
        "4xl": ["2.75rem", { lineHeight: "1.1" }], // 44
        "5xl": ["4rem", { lineHeight: "1" }], // 64
      },
      letterSpacing: {
        label: "0.08em", // uppercase eyebrow labels
      },
      borderRadius: {
        chip: "10px",
        input: "12px",
        card: "16px",
        lg: "20px",
        xl: "16px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        // Very soft, warm-tinted, low elevation.
        soft: "0 1px 2px rgba(35,33,29,0.04), 0 10px 24px -16px rgba(35,33,29,0.14)",
        lift: "0 2px 4px rgba(35,33,29,0.05), 0 18px 40px -20px rgba(35,33,29,0.18)",
        overlay: "0 24px 60px -18px rgba(35,33,29,0.26)",
      },
      maxWidth: {
        readable: "47.5rem", // ~760px paper / content column
      },
    },
  },
  plugins: [],
};
