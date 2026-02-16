"use client";

import { Calendar } from "lucide-react";

interface ScheduleDatesProps {
  dates: any[];
}

export function ScheduleDates({ dates }: ScheduleDatesProps) {
  if (!dates || !Array.isArray(dates) || dates.length === 0) return null;

  const statusStyles: Record<string, string> = {
    available: "bg-green-50 border-green-200 text-green-700",
    few_left: "bg-yellow-50 border-yellow-200 text-yellow-700",
    sold_out: "bg-gray-50 border-gray-200 text-gray-400 line-through",
  };

  const statusLabels: Record<string, string> = {
    available: "예약가능",
    few_left: "마감임박",
    sold_out: "마감",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-4">출발 가능 일정</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {dates.map((d: any, idx: number) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-4 py-3 border rounded-2xl text-sm ${
              statusStyles[d.status] || statusStyles.available
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="font-medium">
                {new Date(d.date).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              <div className="text-xs">
                {statusLabels[d.status] || d.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
