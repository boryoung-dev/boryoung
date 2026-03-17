"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = "", ...props }, ref) => (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[color:var(--fg)] mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-[color:var(--surface)] rounded-lg text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] outline-none transition-all duration-200 focus:ring-2 focus:ring-[color:var(--fg)]/10 ${
            leftIcon ? "pl-10" : ""
          } ${error ? "ring-2 ring-red-500/20" : ""}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-500">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-[12px] text-[color:var(--muted)]">{hint}</p>
      )}
    </div>
  ),
);
Input.displayName = "Input";
