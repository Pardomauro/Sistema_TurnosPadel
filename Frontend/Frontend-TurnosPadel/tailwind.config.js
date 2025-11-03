/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#38BDF8",
        accent: "#818CF8",
        background: "#F3F4F6",
      },
    },
  },
  plugins: [],
}