"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px]">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight className="w-3 h-3 text-[color:var(--border)]" />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={
                i === items.length - 1
                  ? "text-[color:var(--fg)] font-medium"
                  : "text-[color:var(--muted)]"
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
