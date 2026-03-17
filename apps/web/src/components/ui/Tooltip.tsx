"use client";

import { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const posClass =
    position === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${posClass} z-50 px-3 py-1.5 bg-[color:var(--fg)] text-white text-[12px] font-medium rounded-lg whitespace-nowrap shadow-lg animate-in fade-in duration-150`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
