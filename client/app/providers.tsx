"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { getSavedTheme } from "@/lib/auth";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = getSavedTheme();
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return children;
}
