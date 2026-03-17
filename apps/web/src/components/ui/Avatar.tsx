"use client";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = name.slice(0, 2);

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${sizeMap[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-[color:var(--surface)] text-[color:var(--muted)] font-medium flex items-center justify-center">
          {initials}
        </div>
      )}
    </div>
  );
}
