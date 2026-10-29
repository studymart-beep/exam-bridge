import type { Config } from "tailwindcss";

/**
 * Exam Bridge design tokens (v31 — premium mint/emerald system).
 *
 * Derived from the two approved reference screens:
 *  - Landing: pale-mint page, warm white cards, emerald primary, gold + coral
 *    category accents, 20px radii, green-tinted shadows, curved dark footer.
 *  - Dashboard: deep forest sidebar, transparent top bar, gradient hero with a
 *    gold script note, 2x2 quick actions with coloured icon tiles.
 *
 * Key names are unchanged from v30 so every existing class (bg-primary-light,
 * text-text-muted, shadow-soft, border-border …) restyles globally.
 */
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
          DEFAULT: "#0A8B5B", // emerald CTA green
          dark: "#0B4232", // forest green (sidebar / hero)
          deeper: "#062B20", // sidebar base bottom
          hover: "#067A4E",
          light: "#DDF8E8", // pale mint card tint
          soft: "#B7F0D6",
        },
        secondary: {
          DEFAULT: "#FBBF24", // gold accent
          dark: "#B45309",
        },
        accent: {
          DEFAULT: "#F4BE19",
          dark: "#8A5A00",
          light: "#FFF3BE", // pale gold card tint
        },
        coral: {
          DEFAULT: "#FF505C",
          dark: "#C81E2A",
          light: "#FFE2DC", // pale coral card tint
        },
        calm: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#EFF6FF", // pale blue card tint
          border: "#BFDBFE",
        },
        plum: {
          DEFAULT: "#9333EA",
          dark: "#6B21A8",
          light: "#FAF5FF",
          border: "#E9D5FF",
        },
        success: "#0E9F6E",
        error: "#DC2626",
        warning: "#F59E0B",
        background: "#EAF7F2", // page mint
        cream: "#FFFEF8", // warm white surface
        mist: "#DDF8E8",
        surface: "#FFFEF8",
        border: {
          DEFAULT: "#DCEDE5", // soft sage divider
          soft: "#EAF5EF",
          green: "#B7E4CC",
          blue: "#BFDBFE",
          gold: "#F5D98B",
        },
        text: {
          primary: "#0F2F24", // near-black green
          secondary: "#52796F",
          muted: "#7C9A8D",
        },
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        script: ["Caveat", "Segoe Script", "cursive"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(11 66 50 / 0.05), 0 2px 8px -2px rgb(11 66 50 / 0.07)",
        card: "0 4px 16px -4px rgb(11 66 50 / 0.10), 0 2px 6px -2px rgb(11 66 50 / 0.06)",
        elevated:
          "0 16px 40px -12px rgb(11 66 50 / 0.18), 0 6px 16px -8px rgb(11 66 50 / 0.10)",
        tile: "0 8px 24px -8px rgb(11 66 50 / 0.16)",
        glow: "0 0 0 4px rgb(251 191 36 / 0.30), 0 6px 18px rgb(11 66 50 / 0.18)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.375rem",
        "4xl": "1.75rem",
      },
      backgroundImage: {
        "hero-soft": "linear-gradient(135deg, #DDF8E8 0%, #FFF3BE 100%)",
        "sidebar-deep": "linear-gradient(180deg, #0B4232 0%, #083226 60%, #062B20 100%)",
        "hero-emerald":
          "linear-gradient(115deg, #0B4232 0%, #14624A 55%, #1B634E 100%)",
        "mint-page":
          "radial-gradient(1200px 600px at 12% -8%, #D6F7E7 0%, rgba(214,247,231,0) 60%), radial-gradient(900px 500px at 96% 6%, #FFF3BE 0%, rgba(255,243,190,0) 55%), linear-gradient(180deg, #EAF7F2 0%, #F3FAF7 55%, #EAF7F2 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
