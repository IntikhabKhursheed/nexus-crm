import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseClass =
  "w-full rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.14)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={baseClass} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseClass} min-h-28`} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={baseClass} {...props} />;
}
