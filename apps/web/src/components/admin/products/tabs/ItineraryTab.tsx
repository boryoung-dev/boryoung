"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ItineraryItem {
  id?: string;
  day: number;
  title: string;
  description: string;
  meals: string;
  accommodation: string;
  golfCourse: string;
  golfHoles: number | null;
  transport: string;
}

interface Props {
  productId?: string;
  itineraries: any[];
}

const emptyDay = (day: number): ItineraryItem => ({
  day,
  title: "",
  description: "",
  meals: "",
  accommodation: "",
  golfCourse: "",
  golfHoles: null,
  transport: "",
});

export function ItineraryTab({ productId, itineraries: initial }: Props) {
  const [items, setItems] = useState<ItineraryItem[]>(
    initial.length > 0
      ? initial.map((it: any) => ({
          id: it.id,
          day: it.day,
          title: it.title || "",
          description: it.description || "",
          meals: it.meals || "",
          accommodation: it.accommodation || "",
          golfCourse: it.golfCourse || "",
          golfHoles: it.golfHoles,
          transport: it.transport || "",
        }))
      : [emptyDay(1)]
  );

  const addDay = () => {
    setItems((prev) => [...prev, emptyDay(prev.length + 1)]);
  };

  const removeDay = (index: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }))
    );
  };

  const updateDay = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  if (!productId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>일정을 관리하려면 먼저 상품을 저장해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {item.day}일차
              </span>
            </div>
            {items.length > 1 && (
              <button
                onClick={() => removeDay(idx)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">일정 제목</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateDay(idx, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="인천 출발 - 후쿠오카 도착"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">상세 설명</label>
              <textarea
                value={item.description}
                onChange={(e) => updateDay(idx, "description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">식사</label>
              <input
                type="text"
                value={item.meals}
                onChange={(e) => updateDay(idx, "meals", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="조식: 호텔식 / 중식: 현지식 / 석식: 자유식"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">숙소</label>
              <input
                type="text"
                value={item.accommodation}
                onChange={(e) => updateDay(idx, "accommodation", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="호텔명"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">골프장</label>
              <input
                type="text"
                value={item.golfCourse}
                onChange={(e) => updateDay(idx, "golfCourse", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="코스명"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이동수단</label>
              <input
                type="text"
                value={item.transport}
                onChange={(e) => updateDay(idx, "transport", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="전용버스"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" /> 일정 추가
      </button>
    </div>
  );
}
