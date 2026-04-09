// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5c59f0",
        "on-primary": "#ffffff",
        "primary-container": "#7c79ff",
        secondary: "#8b5cf6",
        tertiary: "#f59e0b",
        surface: "#ffffff",
        "on-surface": "#0f172a",
        error: "#ef4444",
        outline: "#94a3b8",
      },
    },
  },
  plugins: [],
};
