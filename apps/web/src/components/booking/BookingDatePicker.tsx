"use client";

import { Calendar } from "lucide-react";

interface BookingDatePickerProps {
  scheduleDates: { date: string; status: string }[] | null | undefined;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function BookingDatePicker({
  scheduleDates,
  selectedDate,
  onDateChange,
}: BookingDatePickerProps) {
  const availableDates = scheduleDates?.filter(
    (d) => d.status !== "sold_out"
  );

  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--fg)] mb-2">
        <Calendar className="w-4 h-4 inline mr-1" />
        희망 출발일
      </label>

      {availableDates && availableDates.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {availableDates.map((d, idx) => {
            const dateStr = d.date;
            const isSelected = selectedDate === dateStr;
            const isFewLeft = d.status === "few_left";

            return (
              <button
                key={idx}
                onClick={() => onDateChange(isSelected ? "" : dateStr)}
                className={`px-3 py-2.5 border rounded-xl text-sm text-left transition-colors ${
                  isSelected
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                    : "border-[color:var(--border)] hover:border-[color:var(--muted)]"
                }`}
              >
                <div className="font-medium">
                  {new Date(dateStr).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </div>
                {isFewLeft && (
                  <span className="text-xs text-orange-600">마감임박</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl text-sm focus:ring-2 focus:ring-[color:var(--ring)] focus:border-transparent"
        />
      )}
    </div>
  );
}
