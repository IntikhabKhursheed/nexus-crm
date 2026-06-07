"use client";

import { useEffect, useState } from "react";
import { getSavedTheme, setSavedTheme } from "@/lib/auth";

export function ThemeToggle() {
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
      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:scale-[1.02]"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
