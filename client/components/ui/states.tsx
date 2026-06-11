import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card className="p-8 text-sm text-[var(--nx-text-muted)]">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-500" />
        <p>{label}</p>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}) {
  return (
    <Card className="p-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--nx-text-muted)]">{description}</p>
      {action ?? (actionLabel && onAction ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null)}
    </Card>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-red-500/20 bg-red-500/5 p-6">
      <p className="text-base font-semibold text-red-700 dark:text-red-300">{title}</p>
      <p className="mt-2 text-sm text-red-700/80 dark:text-red-200/80">{description}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}
