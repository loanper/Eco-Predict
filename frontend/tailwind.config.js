/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
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
          },
        },
        eco: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(2, 6, 23, 0.08)",
        lift: "0 18px 60px rgba(2, 6, 23, 0.12)",
        glow: "0 10px 30px rgba(16, 185, 129, 0.25)",
        glowBlue: "0 10px 30px rgba(59, 130, 246, 0.22)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(1200px circle at 15% 0%, rgba(59, 130, 246, 0.18), transparent 55%), radial-gradient(900px circle at 85% 10%, rgba(16, 185, 129, 0.18), transparent 55%), radial-gradient(800px circle at 50% 80%, rgba(99, 102, 241, 0.10), transparent 60%)",
        "brand-gradient": "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(37, 99, 235, 0.10) 0%, rgba(16, 185, 129, 0.10) 100%)",
      },
    },
  },
  plugins: [],
}
