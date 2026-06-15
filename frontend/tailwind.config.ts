import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Design-system tokens (arbitrary hex values are also used throughout).
        ink: {
          primary: "#eef2ff",
          secondary: "#8892b0",
          muted: "#4a5278",
        },
        brand: {
          indigo: "#4f6ef7",
          violet: "#a78bfa",
        },
        signal: {
          emerald: "#10b981",
          amber: "#f59e0b",
          red: "#f43f5e",
          blue: "#3b82f6",
        },
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "live-ping": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "75%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "live-ping": "live-ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
