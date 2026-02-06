"use client";

import { Minus, Plus, Users } from "lucide-react";

interface BookingPeopleCountProps {
  count: number;
  onChange: (count: number) => void;
  min: number;
  max: number;
}

export function BookingPeopleCount({
  count,
  onChange,
  min,
  max,
}: BookingPeopleCountProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Users className="w-4 h-4 inline mr-1" />
        인원
      </label>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(min, count - 1))}
          disabled={count <= min}
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-900">{count}</span>
          <span className="text-sm text-gray-500 ml-1">명</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, count + 1))}
          disabled={count >= max}
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {min}~{max}명 가능
      </p>
    </div>
  );
}
