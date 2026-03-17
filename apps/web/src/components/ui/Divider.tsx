"use client";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = "" }: DividerProps) {
  if (!label)
    return (
      <div
        className={`border-t border-[color:var(--border)] ${className}`}
      />
    );
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 border-t border-[color:var(--border)]" />
      <span className="text-[12px] text-[color:var(--muted)] font-medium">
        {label}
      </span>
      <div className="flex-1 border-t border-[color:var(--border)]" />
    </div>
  );
}
