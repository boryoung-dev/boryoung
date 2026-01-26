import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        brand:
          "bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:opacity-90 active:scale-95",
        accent:
          "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 active:scale-95",
        secondary:
          "bg-[color:var(--surface-2)] text-[color:var(--brand)] hover:bg-[color:var(--surface-3)] active:scale-95",
        ghost:
          "bg-transparent text-[color:var(--fg)] hover:bg-[color:var(--surface-2)]",
        link: "bg-transparent text-[color:var(--brand)] hover:underline"
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4 text-[13px]",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "brand",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
