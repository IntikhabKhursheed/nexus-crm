"use client";

import { useEffect, useState } from "react";
import { getSavedTheme, setSavedTheme } from "@/lib/auth";
import { MoonIcon, SunIcon } from "./ui/icons";

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const initialTheme = getSavedTheme() as "dark" | "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setSavedTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={
        compact
          ? "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:bg-muted"
      }
    >
      {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      {!compact && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
