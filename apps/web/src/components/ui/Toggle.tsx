"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
}: ToggleProps) {
  const trackSize = size === "sm" ? "w-8 h-[18px]" : "w-10 h-[22px]";
  const thumbSize = size === "sm" ? "w-3.5 h-3.5" : "w-[18px] h-[18px]";
  const translate =
    size === "sm" ? "translate-x-[14px]" : "translate-x-[18px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`relative ${trackSize} rounded-full transition-colors duration-200 ${
          checked ? "bg-[color:var(--fg)]" : "bg-[color:var(--border)]"
        }`}
      >
        <div
          className={`absolute top-[2px] left-[2px] ${thumbSize} rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? translate : "translate-x-0"
          }`}
        />
      </div>
      {label && (
        <span className="text-sm text-[color:var(--fg)]">{label}</span>
      )}
    </button>
  );
}
