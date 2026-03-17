"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onChange,
}: PaginationProps) {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`dot-${i}`}
            className="w-9 h-9 flex items-center justify-center text-[color:var(--muted)] text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? "bg-[color:var(--fg)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)] disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
