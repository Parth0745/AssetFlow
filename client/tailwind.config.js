/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.12)"
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d8eaff",
          500: "#1f7ae0",
          600: "#145fb2",
          700: "#114b8c"
        }
      }
    }
  },
  plugins: []
};
