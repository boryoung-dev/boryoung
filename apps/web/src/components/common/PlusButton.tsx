import { cn } from "@repo/ui";

import type React from "react";

interface PlusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "light" | "dark";
}

export function PlusButton({ className, label = "더 알아보기", variant = "dark", ...props }: PlusButtonProps) {
  return (
    <button
      className={cn(
        "group flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2",
        variant === "dark" 
          ? "bg-[color:var(--fg)] text-[color:var(--bg)] hover:bg-[color:var(--fg)]/90" 
          : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30",
        className
      )}
      aria-label={label}
      {...props}
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 14 14" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:rotate-90"
      >
        <path 
          d="M7 1V13M1 7H13" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
