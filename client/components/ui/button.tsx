import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] hover:translate-y-[-1px] hover:shadow-[0_22px_60px_rgba(15,23,42,0.22)] dark:bg-slate-100 dark:text-slate-950",
  secondary:
    "border border-border bg-card text-foreground hover:bg-muted dark:bg-card dark:text-foreground",
  danger: "border border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/15",
  ghost: "text-slate-500 hover:bg-muted hover:text-foreground"
};

export function Button({ variant = "primary", className = "", children, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
