"use client";

import { X } from "lucide-react";

interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 bg-[color:var(--surface)] text-[color:var(--fg)] text-[13px] font-medium rounded-lg ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
