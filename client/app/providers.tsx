"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { getSavedTheme } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = getSavedTheme();
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
