import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        panel: "var(--color-panel)",
        line: "var(--color-line)",
        paper: "var(--color-paper)",
        lift: "var(--color-lift)",
        amber: "var(--color-amber)",
        muted: "var(--color-muted)",
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
