/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aquarius: {
          blue: "hsl(var(--color-aquarius-blue-hsl) / <alpha-value>)",
          violet: "hsl(var(--color-night-violet-hsl) / <alpha-value>)",
          pink: "hsl(var(--color-soft-pink-hsl) / <alpha-value>)",
          gold: "hsl(var(--color-star-gold-hsl) / <alpha-value>)",
          navy: "hsl(var(--color-deep-navy-hsl) / <alpha-value>)",
          mist: "hsl(var(--color-mist-gray-hsl) / <alpha-value>)",
        },
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        soft: "var(--shadow-soft)",
        glow: "0 0 34px hsl(var(--color-aquarius-blue-hsl) / 0.24)",
        pink: "0 0 24px hsl(var(--color-soft-pink-hsl) / 0.2)",
      },
      animation: {
        "aqua-drift": "aqua-drift 18s ease-in-out infinite alternate",
        "slow-aqua-drift": "aqua-drift 34s ease-in-out infinite alternate",
        "wave-flow": "wave-flow 14s linear infinite",
        "slow-wave-flow": "wave-flow 28s linear infinite",
        "soft-pulse": "soft-pulse 2.6s ease-in-out infinite",
        "track-in": "track-in 360ms ease-out both",
        "float-up": "float-up 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
