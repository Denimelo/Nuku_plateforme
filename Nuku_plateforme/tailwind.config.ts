import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF", // Votre couleur principale
        accent: "#0B2749",
        second: "#93C5FD",
        "blue-900": "#0B2749", // Exemple: bleu pour les boutons
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        sora: ["Sora", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in", // Exemple d'animation
      },
    },
  },
  plugins: [],
} satisfies Config;
