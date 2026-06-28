import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "var(--color-cream)",
        "cream-dark": "var(--color-cream-dark)",
        black: "var(--color-black)",
        surface: "var(--color-surface)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        green: "var(--color-green)",
        yellow: "var(--color-yellow)",
        red: "var(--color-red)",
        "text-main": "var(--color-text-main)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        heading: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
