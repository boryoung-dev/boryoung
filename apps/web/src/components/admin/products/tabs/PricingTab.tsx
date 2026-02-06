"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: string, value: any) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
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
              <select
                value={opt.priceType}
                onChange={(e) => updateOption(idx, "priceType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="PER_PERSON">1인당</option>
                <option value="PER_ROOM">1실당</option>
                <option value="ADDITIONAL">추가</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시즌</label>
              <select
                value={opt.season}
                onChange={(e) => updateOption(idx, "season", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">전체 시즌</option>
                <option value="PEAK">성수기</option>
                <option value="REGULAR">일반</option>
                <option value="OFF">비수기</option>
              </select>
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
    </div>
  );
}
