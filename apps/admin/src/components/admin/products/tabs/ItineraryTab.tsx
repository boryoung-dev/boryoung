"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Save, Loader2, ChevronUp, ChevronDown, Clock, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Activity {
  time: string;
  activity: string;
}

interface ItineraryItem {
  id?: string;
  day: number;
  title: string;
  description: string;
  imageUrl: string;
  meals: string;
  accommodation: string;
  golfCourse: string;
  golfHoles: number | null;
  transport: string;
  activities: Activity[];
}

interface Props {
  productId?: string;
  itineraries: any[];
  onPendingChange?: (items: any[]) => void;
}

const emptyDay = (day: number): ItineraryItem => ({
  day,
  title: "",
  description: "",
  imageUrl: "",
  meals: "",
  accommodation: "",
  golfCourse: "",
  golfHoles: null,
  transport: "",
  activities: [],
});

export function ItineraryTab({ productId, itineraries: initial, onPendingChange }: Props) {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>(
    initial.length > 0
      ? initial.map((it: any) => ({
          id: it.id,
          day: it.day,
          title: it.title || "",
          description: it.description || "",
          imageUrl: it.imageUrl || "",
          meals: it.meals || "",
          accommodation: it.accommodation || "",
          golfCourse: it.golfCourse || "",
          golfHoles: it.golfHoles,
          transport: it.transport || "",
          activities: Array.isArray(it.activities) ? it.activities : [],
        }))
      : [emptyDay(1)]
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());

  const isNewMode = !productId && !!onPendingChange;

  useEffect(() => {
    if (isNewMode) onPendingChange?.(items);
  }, [items]);

  const markChanged = () => setHasChanges(true);

  const addDay = () => {
    setItems((prev) => [...prev, emptyDay(prev.length + 1)]);
    markChanged();
  };

  const removeDay = (index: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }))
    );
    markChanged();
  };

  const updateDay = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    markChanged();
  };

  const moveDay = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    setItems((prev) => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[newIndex];
      arr[newIndex] = temp;
      return arr.map((item, i) => ({ ...item, day: i + 1 }));
    });
    markChanged();
  };

  const toggleActivities = (idx: number) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const addActivity = (dayIdx: number) => {
    const updated = [...items];
    updated[dayIdx] = {
      ...updated[dayIdx],
      activities: [...updated[dayIdx].activities, { time: "", activity: "" }],
    };
    setItems(updated);
    markChanged();
  };

  const updateActivity = (dayIdx: number, actIdx: number, field: string, value: string) => {
    const updated = [...items];
    const activities = [...updated[dayIdx].activities];
    activities[actIdx] = { ...activities[actIdx], [field]: value };
    updated[dayIdx] = { ...updated[dayIdx], activities };
    setItems(updated);
    markChanged();
  };

  const removeActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...items];
    updated[dayIdx] = {
      ...updated[dayIdx],
      activities: updated[dayIdx].activities.filter((_, i) => i !== actIdx),
    };
    setItems(updated);
    markChanged();
  };

  const handleSave = async () => {
    if (!productId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/itineraries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({
          itineraries: items.map((item) => ({
            day: item.day,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl || null,
            meals: item.meals,
            accommodation: item.accommodation,
            golfCourse: item.golfCourse,
            golfHoles: item.golfHoles,
            transport: item.transport,
            activities: item.activities.filter((a) => a.time || a.activity),
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(
          data.itineraries.map((it: any) => ({
            id: it.id,
            day: it.day,
            title: it.title || "",
            description: it.description || "",
            imageUrl: it.imageUrl || "",
            meals: it.meals || "",
            accommodation: it.accommodation || "",
            golfCourse: it.golfCourse || "",
            golfHoles: it.golfHoles,
            transport: it.transport || "",
            activities: Array.isArray(it.activities) ? it.activities : [],
          }))
        );
        setHasChanges(false);
        toast("일정이 저장되었습니다", "success");
      } else {
        toast(data.error || "저장 실패", "error");
      }
    } catch {
      toast("일정 저장 중 오류가 발생했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isNewMode && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <span className="flex-shrink-0">!</span>
          <p>일정을 추가하면 상품 등록 시 함께 저장됩니다.</p>
        </div>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button onClick={() => moveDay(idx, "up")} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => moveDay(idx, "down")} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {item.day}일차
              </span>
            </div>
            {items.length > 1 && (
              <button onClick={() => removeDay(idx)} className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">일정 제목</label>
              <input type="text" value={item.title} onChange={(e) => updateDay(idx, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="인천 출발 - 후쿠오카 도착" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">상세 설명</label>
              <textarea value={item.description} onChange={(e) => updateDay(idx, "description", e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> 일정 이미지</span>
              </label>
              <div className="flex gap-3 items-start">
                <input type="text" value={item.imageUrl} onChange={(e) => updateDay(idx, "imageUrl", e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="이미지 URL (선택사항)" />
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={`${item.day}일차`} referrerPolicy="no-referrer" className="w-20 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">식사</label>
              <input type="text" value={item.meals} onChange={(e) => updateDay(idx, "meals", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="조식: 호텔식 / 중식: 현지식 / 석식: 자유식" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">숙소</label>
              <input type="text" value={item.accommodation} onChange={(e) => updateDay(idx, "accommodation", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="호텔명" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">골프장</label>
              <input type="text" value={item.golfCourse} onChange={(e) => updateDay(idx, "golfCourse", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="코스명" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">라운드 홀 수</label>
              <input type="number" min="0" value={item.golfHoles ?? ""} onChange={(e) => { const val = e.target.value; updateDay(idx, "golfHoles", val === "" ? null : parseInt(val)); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="18" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이동수단</label>
              <input type="text" value={item.transport} onChange={(e) => updateDay(idx, "transport", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="전용버스" />
            </div>
          </div>

          {/* 세부 활동 */}
          <div className="mt-4 border-t pt-3">
            <button onClick={() => toggleActivities(idx)} className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-blue-600">
              <Clock className="w-3.5 h-3.5" />
              세부 활동 ({item.activities.length}건)
              <span className="text-gray-400">{expandedActivities.has(idx) ? "▲" : "▼"}</span>
            </button>
            {expandedActivities.has(idx) && (
              <div className="mt-2 space-y-2">
                {item.activities.map((act, actIdx) => (
                  <div key={actIdx} className="flex gap-2 items-center">
                    <input type="text" value={act.time} onChange={(e) => updateActivity(idx, actIdx, "time", e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="08:00" />
                    <input type="text" value={act.activity} onChange={(e) => updateActivity(idx, actIdx, "activity", e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs" placeholder="호텔 출발" />
                    <button onClick={() => removeActivity(idx, actIdx)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addActivity(idx)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                  <Plus className="w-3 h-3" /> 활동 추가
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <button onClick={addDay} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">
        <Plus className="w-4 h-4" /> 일정 추가
      </button>

      {/* 저장 버튼 (편집 모드에서만) */}
      {!isNewMode && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !hasChanges} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? (<><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>) : (<><Save className="w-4 h-4" /> 일정 저장</>)}
          </button>
        </div>
      )}
    </div>
  );
}
