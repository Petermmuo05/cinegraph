import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#040D0A",
        surface: {
          DEFAULT: "#091A14",
          card: "rgba(9, 26, 20, 0.7)",
          glass: "rgba(16, 185, 129, 0.05)",
          hover: "rgba(16, 185, 129, 0.12)",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        accent: {
          gold: "#F59E0B",
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          rose: "#F43F5E",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
        "5xl": "40px",
        pill: "9999px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-glow": "0 0 25px rgba(16, 185, 129, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        "card-glow": "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)",
        "neon-emerald": "0 0 15px rgba(16, 185, 129, 0.6)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "24px",
        "3xl": "40px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-fade": "glowFade 3s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        glowFade: {
          "0%": { opacity: "0.4", transform: "scale(0.98)" },
          "100%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
