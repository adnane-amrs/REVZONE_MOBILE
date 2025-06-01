/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,tsx,ts,jsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary1: "#4042e2",
        dark: "#0E2148",
        primary2: "#7d96f5",
        secondary1: "#91b3fa",
        secondary2: "#e8eefd",
        warning: "#cc475a",
      }
    },
  },
  plugins: [],
}