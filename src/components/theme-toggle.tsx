"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("mountlift-theme");
    const nextTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mountlift-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/60 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:border-lift hover:text-lift"
      aria-label="Toggle color theme"
    >
      {isDark ? <SunMedium size={12} /> : <MoonStar size={12} />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
