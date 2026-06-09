import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "glass-card rounded-3xl border border-border/80 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
