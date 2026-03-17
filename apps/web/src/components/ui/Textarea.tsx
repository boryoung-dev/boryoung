"use client";

import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[color:var(--fg)] mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 bg-[color:var(--surface)] rounded-lg text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] outline-none transition-all duration-200 resize-none focus:ring-2 focus:ring-[color:var(--fg)]/10 ${
          error ? "ring-2 ring-red-500/20" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-red-500">{error}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";
