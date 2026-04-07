"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-40 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
      >
        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? format(selected, "yyyy-MM-dd") : placeholder}
        </span>
      </button>

      {open && (
        <div
          className="admin-datepicker absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
        >
          <DayPicker
            mode="single"
            locale={ko}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(format(d, "yyyy-MM-dd"));
                setOpen(false);
              } else {
                onChange("");
              }
            }}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ),
            }}
          />
          {selected && (
            <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                초기화
              </button>
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        .admin-datepicker .rdp-root {
          --rdp-accent-color: #111827;
          --rdp-accent-background-color: #f3f4f6;
          --rdp-day-height: 34px;
          --rdp-day-width: 34px;
          --rdp-day_button-height: 34px;
          --rdp-day_button-width: 34px;
          --rdp-font-family: inherit;
          font-size: 13px;
        }
        .admin-datepicker .rdp-month_caption {
          font-weight: 600;
          color: #111827;
        }
        .admin-datepicker .rdp-weekday {
          font-weight: 500;
          color: #6b7280;
          font-size: 12px;
        }
        .admin-datepicker .rdp-day_button {
          border-radius: 6px;
        }
        .admin-datepicker .rdp-day_button:hover:not([disabled]) {
          background: #f3f4f6;
        }
        .admin-datepicker .rdp-selected .rdp-day_button {
          background: #111827;
          color: #fff;
          font-weight: 600;
        }
        .admin-datepicker .rdp-today:not(.rdp-selected) .rdp-day_button {
          color: #111827;
          font-weight: 600;
        }
        .admin-datepicker .rdp-outside .rdp-day_button {
          color: #d1d5db;
        }
        .admin-datepicker .rdp-button_previous,
        .admin-datepicker .rdp-button_next {
          border-radius: 6px;
          color: #374151;
        }
        .admin-datepicker .rdp-button_previous:hover,
        .admin-datepicker .rdp-button_next:hover {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
