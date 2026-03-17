"use client";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  direction?: "horizontal" | "vertical";
}

export function RadioGroup({
  value,
  onChange,
  options,
  label,
  direction = "vertical",
}: RadioGroupProps) {
  return (
    <div>
      {label && (
        <div className="text-sm font-medium text-[color:var(--fg)] mb-3">
          {label}
        </div>
      )}
      <div
        className={`flex ${direction === "vertical" ? "flex-col gap-2" : "flex-row gap-4 flex-wrap"}`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="flex items-start gap-3 group text-left"
          >
            <div
              className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                value === option.value
                  ? "border-[color:var(--fg)]"
                  : "border-[color:var(--border)] group-hover:border-[color:var(--muted)]"
              }`}
            >
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-[color:var(--fg)]" />
              )}
            </div>
            <div>
              <span
                className={`text-sm transition-colors ${value === option.value ? "text-[color:var(--fg)] font-medium" : "text-[color:var(--muted)]"}`}
              >
                {option.label}
              </span>
              {option.description && (
                <p className="text-[12px] text-[color:var(--muted)] mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
