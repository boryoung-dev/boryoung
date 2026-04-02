"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import Select from "@/components/ui/Select";

interface ScheduleDate {
  date: string;
  status: "available" | "few_left" | "sold_out";
  note: string;
}

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

const STATUS_OPTIONS = [
  { value: "available", label: "예약가능" },
  { value: "few_left", label: "마감임박" },
  { value: "sold_out", label: "마감" },
];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  few_left: "bg-amber-100 text-amber-700",
  sold_out: "bg-gray-100 text-gray-500",
};

export function ScheduleTab({ formData, updateField }: Props) {
  const scheduleDates: ScheduleDate[] = Array.isArray(formData.scheduleDates)
    ? formData.scheduleDates
    : [];

  const [bulkDates, setBulkDates] = useState("");

  const addDate = () => {
    const newDate: ScheduleDate = {
      date: "",
      status: "available",
      note: "",
    };
    updateField("scheduleDates", [...scheduleDates, newDate]);
  };

  const updateDate = (index: number, field: string, value: any) => {
    const updated = scheduleDates.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField("scheduleDates", updated);
  };

  const removeDate = (index: number) => {
    updateField(
      "scheduleDates",
      scheduleDates.filter((_, i) => i !== index)
    );
  };

  const removeAll = () => {
    updateField("scheduleDates", []);
  };

  // 일괄 추가: 쉼표 또는 줄바꿈으로 구분된 날짜 파싱
  const handleBulkAdd = () => {
    if (!bulkDates.trim()) return;

    const dates = bulkDates
      .split(/[,\n]+/)
      .map((d) => d.trim())
      .filter((d) => d.length > 0)
      .map((d) => ({
        date: d,
        status: "available" as const,
        note: "",
      }));

    if (dates.length > 0) {
      updateField("scheduleDates", [...scheduleDates, ...dates]);
      setBulkDates("");
    }
  };

  // 날짜 정렬
  const sortByDate = () => {
    const sorted = [...scheduleDates].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    updateField("scheduleDates", sorted);
  };

  // 상시 가능 여부
  const isAlwaysAvailable = formData.scheduleType === "always";

  return (
    <div className="space-y-6">
      {/* 상시 가능 / 날짜 지정 선택 */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scheduleType"
            checked={!isAlwaysAvailable}
            onChange={() => updateField("scheduleType", "dates")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">날짜 지정</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scheduleType"
            checked={isAlwaysAvailable}
            onChange={() => updateField("scheduleType", "always")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">상시 출발 가능</span>
        </label>
      </div>

      {isAlwaysAvailable && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">상시 출발 가능</p>
            <p className="text-xs text-green-600">고객이 원하는 날짜에 출발 가능한 상품입니다.</p>
          </div>
        </div>
      )}

      {!isAlwaysAvailable && <>
      {/* 일괄 추가 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-blue-800 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          일괄 추가 (쉼표 또는 줄바꿈으로 구분)
        </label>
        <textarea
          value={bulkDates}
          onChange={(e) => setBulkDates(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={"2026-04-01, 2026-04-15, 2026-05-01\n또는 한 줄에 하나씩 입력"}
        />
        <button
          onClick={handleBulkAdd}
          disabled={!bulkDates.trim()}
          className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          일괄 추가
        </button>
      </div>

      {/* 헤더 */}
      {scheduleDates.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            총 <strong>{scheduleDates.length}</strong>개 일정
            {" / "}
            <span className="text-green-600">
              예약가능 {scheduleDates.filter((d) => d.status === "available").length}
            </span>
            {" / "}
            <span className="text-amber-600">
              마감임박 {scheduleDates.filter((d) => d.status === "few_left").length}
            </span>
            {" / "}
            <span className="text-gray-500">
              마감 {scheduleDates.filter((d) => d.status === "sold_out").length}
            </span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={sortByDate}
              className="text-xs px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              날짜순 정렬
            </button>
            <button
              onClick={removeAll}
              className="text-xs px-3 py-1 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
            >
              전체 삭제
            </button>
          </div>
        </div>
      )}

      {/* 일정 목록 */}
      <div className="space-y-2">
        {scheduleDates.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <input
                type="date"
                value={item.date}
                onChange={(e) => updateDate(idx, "date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="w-32">
              <Select
                value={item.status}
                onChange={(val) => updateDate(idx, "status", val)}
                options={STATUS_OPTIONS}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={item.note}
                onChange={(e) => updateDate(idx, "note", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="비고 (선택)"
              />
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                STATUS_COLORS[item.status] || ""
              }`}
            >
              {STATUS_OPTIONS.find((s) => s.value === item.status)?.label}
            </span>
            <button
              onClick={() => removeDate(idx)}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 개별 추가 */}
      <button
        onClick={addDate}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" /> 출발일정 추가
      </button>

      {scheduleDates.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          등록된 출발일정이 없습니다. 위에서 일괄 추가하거나 개별 추가해주세요.
        </p>
      )}

      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <span className="flex-shrink-0">!</span>
        <p>출발일정은 메인 저장 버튼(하단)을 눌러야 반영됩니다.</p>
      </div>
      </>}
    </div>
  );
}
