"use client";

import type { SelectedOption } from "./BookingModal";

interface BookingOptionsProps {
  options: any[];
  selectedOptions: SelectedOption[];
  onChange: (options: SelectedOption[]) => void;
}

export function BookingOptions({
  options,
  selectedOptions,
  onChange,
}: BookingOptionsProps) {
  const isSelected = (optionId: string) =>
    selectedOptions.some((o) => o.optionId === optionId);

  const toggleOption = (option: any) => {
    if (isSelected(option.id)) {
      onChange(selectedOptions.filter((o) => o.optionId !== option.id));
    } else {
      onChange([
        ...selectedOptions,
        {
          optionId: option.id,
          name: option.name,
          price: option.price,
          quantity: 1,
        },
      ]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--fg)] mb-2">
        추가 옵션
      </label>
      <div className="space-y-2">
        {options.map((opt: any) => {
          const selected = isSelected(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-colors text-left ${
                selected
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                  : "border-[color:var(--border)] hover:border-[color:var(--muted)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selected
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]"
                      : "border-[color:var(--border)]"
                  }`}
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${selected ? "text-[color:var(--brand)]" : "text-[color:var(--fg)]"}`}>
                    {opt.name}
                  </div>
                  {opt.description && (
                    <div className="text-xs text-[color:var(--muted)]">{opt.description}</div>
                  )}
                </div>
              </div>
              <span className={`font-semibold ${selected ? "text-[color:var(--brand)]" : "text-[color:var(--fg)]"}`}>
                +{opt.price.toLocaleString()}원
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
