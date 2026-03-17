"use client";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const h = size === "sm" ? "h-1" : "h-2";
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-[color:var(--muted)]">
            {label}
          </span>
          <span className="text-[13px] font-medium text-[color:var(--fg)]">
            {value}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${h} bg-[color:var(--border)]/50 rounded-full overflow-hidden`}
      >
        <div
          className={`${h} bg-[color:var(--fg)] rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
