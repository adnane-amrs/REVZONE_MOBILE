/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,tsx,ts,jsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // RevZone design system (see constants/theme.js)
        // Light version (the dark one is applied at runtime through theme.js)
        canvas: "#F0F0F2",
        paper: "#FFFFFF",
        surface: "#FFFFFF",
        surface2: "#E8E8EC",
        surface3: "#D9D9DF",
        line: "#E3E3E8",
        accent: "#D4F34A",
        accentSoft: "#F1FBCB",
        accentDeep: "#4F6B00",
        accentLight: "#D4F34A",
        ink: "#0E0E10",
        inkSoft: "#26262B",
        text: "#0E0E10",
        textSoft: "#4A4A52",
        muted: "#8B8B93",
        danger: "#FF5D5D",
        warning: "#F59E0B",
        success: "#16A34A",
        info: "#3B82F6",
        // Previous palette, still used by a few admin elements
        primary1: "#4042e2",
        dark: "#0E2148",
        primary2: "#7d96f5",
        secondary1: "#91b3fa",
        secondary2: "#e8eefd",
        warningOld: "#cc475a",
      },
      fontFamily: {
        jakarta: ["PlusJakartaSans-Regular"],
        "jakarta-medium": ["PlusJakartaSans-Medium"],
        "jakarta-semibold": ["PlusJakartaSans-SemiBold"],
        "jakarta-bold": ["PlusJakartaSans-Bold"],
        "jakarta-extrabold": ["PlusJakartaSans-ExtraBold"],
      },
    },
  },
  plugins: [],
}
