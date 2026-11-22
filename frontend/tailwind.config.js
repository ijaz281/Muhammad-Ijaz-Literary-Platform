
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        literary: {
          navy: "#102D25",
          dark: "#0B211B",
          emerald: "#174638",
          "emerald-light": "#28634E",
          "emerald-soft": "#E8F0EA",
          gold: "#C6A15B",
          "gold-dark": "#A98443",
          "gold-light": "#E3C98F",
          cream: "#F8F5EE",
          paper: "#F0EBDD",
          muted: "#777B73",
          ink: "#25372F",
        },
      },

      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "Arial", "sans-serif"],
        urdu: ["JameelNoori", "serif"],
      },

      boxShadow: {
        literary: "0 15px 45px rgba(16, 45, 37, 0.08)",
        premium: "0 25px 70px rgba(16, 45, 37, 0.14)",
        emerald: "0 15px 40px rgba(23, 70, 56, 0.20)",
        gold: "0 10px 30px rgba(198, 161, 91, 0.20)",
        card: "0 12px 35px rgba(20, 40, 30, 0.07)",
      },

      backgroundImage: {
        "emerald-gradient":
          "linear-gradient(135deg, #102D25 0%, #174638 55%, #28634E 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #A98443 0%, #E3C98F 50%, #C6A15B 100%)",
        "paper-gradient":
          "linear-gradient(135deg, #F8F5EE 0%, #F0EBDD 100%)",
      },

      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },

      borderRadius: {
        "4xl": "2rem",
      },
    },
  },

  plugins: [],
};
