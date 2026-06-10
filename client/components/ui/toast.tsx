"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(toast: Omit<Toast, "id">) {
    const nextToast = { ...toast, id: createToastId() };
    setToasts((current) => [nextToast, ...current].slice(0, 4));
  }

  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 4000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const value = useMemo(() => ({ toasts, pushToast, dismissToast }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "rounded-[28px] border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl",
              toast.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10"
                : toast.type === "error"
                  ? "border-red-500/20 bg-red-500/10"
                  : "border-slate-400/20 bg-card/95"
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-sm text-slate-500">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
