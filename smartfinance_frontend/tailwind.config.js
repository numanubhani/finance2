/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          dark: "#b8941f",
          light: "#f7e98e",
        },
      },
    },
  },
  plugins: [],
};
