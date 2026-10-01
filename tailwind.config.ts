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
        primary: {
          DEFAULT: "#166534",
          dark: "#14532D",
          hover: "#14532D",
          light: "#DCFCE7",
        },
        secondary: {
          DEFAULT: "#FACC15",
          dark: "#CA8A04",
        },
        accent: {
          DEFAULT: "#EAB308",
          dark: "#CA8A04",
          light: "#FEF9C3",
        },
        success: "#16A34A",
        error: "#DC2626",
        warning: "#F59E0B",
        background: "#FFFBEB",
        surface: "#FFFFFF",
        border: {
          DEFAULT: "#FDE68A",
          soft: "#FEF3C7",
        },
        text: {
          primary: "#052E16",
          secondary: "#3F6212",
          muted: "#71717A",
        },
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(22 101 52 / 0.06), 0 1px 2px -1px rgb(22 101 52 / 0.04)",
        card: "0 4px 12px -2px rgb(22 101 52 / 0.08), 0 2px 4px -2px rgb(202 138 4 / 0.06)",
        elevated:
          "0 12px 24px -4px rgb(22 101 52 / 0.1), 0 4px 8px -4px rgb(202 138 4 / 0.08)",
        glow: "0 0 0 3px rgb(234 179 8 / 0.35), 0 4px 14px rgb(22 101 52 / 0.15)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
