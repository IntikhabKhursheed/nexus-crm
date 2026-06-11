import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-[var(--nx-card-radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-[18px] py-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
