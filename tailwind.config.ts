// tailwind.config.ts
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
          DEFAULT: '#31a366',
          light: '#4db785',    // Plus clair pour hover
          lighter: '#e6f3ec',  // Très clair pour backgrounds
          dark: '#268652',     // Plus foncé pour active states
          darker: '#1a5c38'    // Très foncé pour texte sur fond clair
        },
      },
      boxShadow: {
        'card': '0 2px 4px rgba(49, 163, 102, 0.1)',
        'modal': '0 4px 6px rgba(49, 163, 102, 0.1)',
      },
      animation: {
        'progress': 'progress 1s ease-in-out',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },
    },
  },
  plugins: [],
};

export default config;