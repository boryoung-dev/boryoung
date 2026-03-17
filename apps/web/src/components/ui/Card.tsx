"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl ${paddings[padding]} ${hover ? "hover:shadow-lg transition-shadow duration-300" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
