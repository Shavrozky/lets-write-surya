/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        proseText: "#242424",
        proseMuted: "#6B6B6B",
        proseBorder: "#F2F2F2",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
