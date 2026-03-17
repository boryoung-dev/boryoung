"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const base = "animate-pulse bg-[color:var(--border)]/50";
  const shape =
    variant === "circular"
      ? "rounded-full"
      : variant === "rectangular"
        ? "rounded-xl"
        : "rounded-md";

  return (
    <div
      className={`${base} ${shape} ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? (variant === "text" ? "1em" : undefined),
      }}
    />
  );
}
