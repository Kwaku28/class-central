import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        classSky: "#C3EBFA",
        classSkyLight: "#EDF9FD",
        classPurple: "blue-500",
        classPurpleLight: "#F1F0FF",
        classYellow: "#FAE27C",
        classYellowLight: "#FEFCE8",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config;

export default config;
