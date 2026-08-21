import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171B",
        panel: "#1B1E23",
        line: "#2B2F36",
        paper: "#ECE8DE",
        lift: "#E7A94C",
        amber: "#C1573D",
        muted: "#8D9198",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
