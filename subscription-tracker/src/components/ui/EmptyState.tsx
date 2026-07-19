import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface2 text-muted">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
