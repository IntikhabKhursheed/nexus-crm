import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseClass =
  "w-full rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-[13.5px] text-foreground outline-none transition placeholder:text-[#c4cdd8] focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.1)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={baseClass} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseClass} min-h-24`} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={baseClass} {...props} />;
}
