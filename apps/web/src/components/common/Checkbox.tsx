"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className = "" }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 group ${className}`}
    >
      <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked
          ? "bg-[color:var(--fg)]"
          : "bg-white border-[1.5px] border-[color:var(--border)] group-hover:border-[color:var(--muted)]"
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${
        checked ? "text-[color:var(--fg)] font-medium" : "text-[color:var(--muted)]"
      }`}>
        {label}
      </span>
    </button>
  );
}
