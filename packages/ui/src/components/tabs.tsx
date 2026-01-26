import * as React from "react";

import { cn } from "../lib/cn";

export type TabsItem = {
  key: string;
  label: string;
};

export type TabsProps = {
  value: string;
  onValueChange: (next: string) => void;
  items: TabsItem[];
  className?: string;
};

export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1",
        className
      )}
    >
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onValueChange(it.key)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[color:var(--surface-2)] text-[color:var(--fg)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
