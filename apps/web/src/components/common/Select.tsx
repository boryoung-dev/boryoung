"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "선택해주세요", className = "" }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[color:var(--surface)] rounded-lg text-sm transition-all duration-200 hover:bg-[color:var(--border)]/30 outline-none"
      >
        <span className={selectedLabel ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[color:var(--border)] z-50 py-1.5 max-h-[240px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                value === option.value
                  ? "text-[color:var(--fg)] font-medium bg-[color:var(--surface)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
              }`}
            >
              {option.label}
              {value === option.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
