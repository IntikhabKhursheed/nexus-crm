import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "surface-shell rounded-[28px] p-5 shadow-shell",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
