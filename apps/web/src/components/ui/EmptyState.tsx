"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="text-[color:var(--border)] mb-4">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-[color:var(--fg)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[color:var(--muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
