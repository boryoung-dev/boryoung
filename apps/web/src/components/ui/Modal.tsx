"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "max-w-[90vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200`}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2 className="text-lg font-semibold text-[color:var(--fg)]">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)] transition-colors text-[color:var(--muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
