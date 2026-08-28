/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0A0D10",
          soft: "#0D1114",
        },
        surface: {
          DEFAULT: "#12161B",
          raised: "#171C22",
        },
        border: {
          DEFAULT: "#232931",
          soft: "#1A1F26",
        },
        ink: {
          DEFAULT: "#ECEEF1",
          muted: "#8A93A0",
          faint: "#5B6472",
        },
        thermal: {
          low: "#3DDC97",
          moderate: "#F5C244",
          high: "#FF8A3D",
          critical: "#FF4757",
        },
        signal: {
          DEFAULT: "#3DA9FC",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "thermal-scale": "linear-gradient(90deg, #3DDC97 0%, #F5C244 45%, #FF8A3D 72%, #FF4757 100%)",
      },
    },
  },
  plugins: [],
};
