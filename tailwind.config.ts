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
          dark: "#052E16",
          hover: "#14532D",
          light: "#DCFCE7",
          soft: "#BBF7D0",
        },
        secondary: {
          DEFAULT: "#EAB308",
          dark: "#CA8A04",
        },
        accent: {
          DEFAULT: "#EAB308",
          dark: "#CA8A04",
          light: "#FEF9C3",
        },
        calm: {
          DEFAULT: "#60A5FA",
          light: "#DBEAFE",
          border: "#93C5FD",
        },
        success: "#16A34A",
        error: "#DC2626",
        warning: "#F59E0B",
        background: "#BBF7D0",
        cream: "#FFFBEB",
        mist: "#DCFCE7",
        surface: "#FFFFFF",
        border: {
          DEFAULT: "#FDE68A",
          soft: "#FEF3C7",
          green: "#86EFAC",
          blue: "#93C5FD",
        },
        text: {
          primary: "#052E16",
          secondary: "#166534",
          muted: "#3F6212",
        },
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(22 101 52 / 0.08), 0 1px 2px -1px rgb(22 101 52 / 0.05)",
        card: "0 4px 12px -2px rgb(22 101 52 / 0.1), 0 2px 4px -2px rgb(202 138 4 / 0.06)",
        elevated:
          "0 12px 24px -4px rgb(22 101 52 / 0.12), 0 4px 8px -4px rgb(202 138 4 / 0.08)",
        glow: "0 0 0 3px rgb(234 179 8 / 0.35), 0 4px 14px rgb(22 101 52 / 0.15)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      backgroundImage: {
        "hero-soft": "linear-gradient(135deg, #BBF7D0 0%, #FEF9C3 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
