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
      style={{
        borderRadius: "9999px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        padding: "8px 14px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#0f172a",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
      }}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
