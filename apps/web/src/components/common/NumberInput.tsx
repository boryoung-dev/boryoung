"use client";

import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
}

export function NumberInput({ value, onChange, min = 1, max = 99, placeholder = "0", className = "" }: NumberInputProps) {
  const numValue = Number(value) || 0;

  const decrement = () => {
    const next = Math.max(min, numValue - 1);
    onChange(String(next));
  };

  const increment = () => {
    const next = Math.min(max, numValue + 1);
    onChange(String(next));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") { onChange(""); return; }
    const n = Math.max(min, Math.min(max, Number(raw)));
    onChange(String(n));
  };

  return (
    <div className={`flex items-center bg-[color:var(--surface)] rounded-lg ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={numValue <= min}
        className="w-10 h-10 flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--fg)] disabled:opacity-30 transition-colors flex-shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-full text-center text-sm font-medium text-[color:var(--fg)] bg-transparent outline-none py-2.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={numValue >= max}
        className="w-10 h-10 flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--fg)] disabled:opacity-30 transition-colors flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
