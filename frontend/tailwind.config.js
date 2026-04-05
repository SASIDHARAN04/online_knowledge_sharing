/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC",
        foreground: "#1E293B",
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#4F46E5",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
