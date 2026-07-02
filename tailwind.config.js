/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0D0D12",
        surface: "#161620",
        rim: "#252535",
        "accent-pink": "#FF3D9A",
        "accent-purple": "#7B5CF0",
        "accent-cyan": "#00D4FF",
        muted: "#8B8BA0",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #FF3D9A, #7B5CF0)",
        "gradient-progress": "linear-gradient(90deg, #FF3D9A, #7B5CF0, #00D4FF)",
      },
      boxShadow: {
        rim: "0 0 0 1px rgba(255,61,154,0.08), 0 8px 32px rgba(0,0,0,0.4)",
      },
      fontFamily: {
        ui: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
