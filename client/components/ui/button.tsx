import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[rgb(var(--primary))] text-white shadow-[0_18px_50px_rgba(99,102,241,0.18)] hover:bg-[rgb(var(--secondary))] hover:shadow-[0_22px_60px_rgba(99,102,241,0.24)]",
  secondary:
    "border border-[#e8ecf0] bg-white text-[rgb(var(--foreground))] hover:border-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary)/0.06)]",
  danger: "border border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-300",
  ghost: "text-[var(--nx-text-secondary)] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
};

export function Button({ variant = "primary", className = "", children, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
