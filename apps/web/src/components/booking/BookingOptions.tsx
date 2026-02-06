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
      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
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
                  <div className={`font-medium ${selected ? "text-blue-700" : "text-gray-900"}`}>
                    {opt.name}
                  </div>
                  {opt.description && (
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  )}
                </div>
              </div>
              <span className={`font-semibold ${selected ? "text-blue-600" : "text-gray-700"}`}>
                +{opt.price.toLocaleString()}원
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
