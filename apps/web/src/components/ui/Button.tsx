"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[color:var(--fg)] text-white hover:opacity-90",
  secondary:
    "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--border)]/50",
  outline:
    "border border-[color:var(--border)] text-[color:var(--fg)] hover:bg-[color:var(--surface)] bg-transparent",
  ghost: "text-[color:var(--fg)] hover:bg-[color:var(--surface)] bg-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-sm rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-75"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  ),
);
Button.displayName = "Button";
