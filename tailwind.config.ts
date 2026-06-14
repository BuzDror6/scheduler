import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        surface: "#f7f8fb",
        brand: "#2563eb"
      }
    }
  },
  plugins: []
};

export default config;
