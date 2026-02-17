"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import Select from "@/components/ui/Select";

interface PriceItem {
  id?: string;
  name: string;
  description: string;
  price: number | null;
  priceType: string;
  season: string;
  isDefault: boolean;
  isActive: boolean;
}

interface Props {
  productId?: string;
  priceOptions: any[];
}

export function PricingTab({ productId, priceOptions: initial }: Props) {
  const { authHeaders } = useAdminAuth();
  const [options, setOptions] = useState<PriceItem[]>(
    initial.length > 0
      ? initial.map((o: any) => ({
          id: o.id,
          name: o.name,
          description: o.description || "",
          price: o.price,
          priceType: o.priceType || "PER_PERSON",
          season: o.season || "",
          isDefault: o.isDefault || false,
          isActive: o.isActive ?? true,
        }))
      : []
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        price: null,
        priceType: "PER_PERSON",
        season: "",
        isDefault: false,
        isActive: true,
      },
    ]);
    markChanged();
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    markChanged();
  };

  const updateOption = (index: number, field: string, value: any) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
    markChanged();
  };

  const handleSave = async () => {
    if (!productId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/price-options`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({
          priceOptions: options.map((opt) => ({
            name: opt.name,
            description: opt.description,
            price: opt.price || 0,
            priceType: opt.priceType,
            season: opt.season,
            isDefault: opt.isDefault,
            isActive: opt.isActive,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOptions(
          data.priceOptions.map((o: any) => ({
            id: o.id,
            name: o.name,
            description: o.description || "",
            price: o.price,
            priceType: o.priceType || "PER_PERSON",
            season: o.season || "",
            isDefault: o.isDefault || false,
            isActive: o.isActive ?? true,
          }))
        );
        setHasChanges(false);
        alert("가격 옵션이 저장되었습니다");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("가격 옵션 저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>가격 옵션을 관리하려면 먼저 상품을 저장해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((opt, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">옵션 {idx + 1}</span>
            <button onClick={() => removeOption(idx)} className="p-1 text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">옵션명</label>
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateOption(idx, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="1인실 추가"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">가격 (원)</label>
              <input
                type="number"
                value={opt.price || ""}
                onChange={(e) => updateOption(idx, "price", parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">가격 유형</label>
              {/* 가격 유형 선택 */}
              <Select
                value={opt.priceType}
                onChange={(val) => updateOption(idx, "priceType", val)}
                options={[
                  { value: "PER_PERSON", label: "1인당" },
                  { value: "PER_ROOM", label: "1실당" },
                  { value: "ADDITIONAL", label: "추가" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시즌</label>
              {/* 시즌 선택 */}
              <Select
                value={opt.season}
                onChange={(val) => updateOption(idx, "season", val)}
                options={[
                  { value: "", label: "전체 시즌" },
                  { value: "PEAK", label: "성수기" },
                  { value: "REGULAR", label: "일반" },
                  { value: "OFF", label: "비수기" },
                ]}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={opt.isDefault}
                  onChange={(e) => updateOption(idx, "isDefault", e.target.checked)}
                />
                기본옵션
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={opt.isActive}
                  onChange={(e) => updateOption(idx, "isActive", e.target.checked)}
                />
                활성
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addOption}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" /> 가격 옵션 추가
      </button>

      {/* 저장 버튼 */}
      {options.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="w-4 h-4" /> 가격 옵션 저장</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
