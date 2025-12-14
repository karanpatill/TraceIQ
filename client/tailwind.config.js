/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5a5",
        dark: "#050507",
        "dark-secondary": "#0f0f14",
      },
    },
  },
  plugins: [],
}
