"use client";

import { Plus, X } from "lucide-react";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function ContentTab({ formData, updateField }: Props) {
  const addItem = (field: string) => {
    updateField(field, [...(formData[field] || []), ""]);
  };

  const updateItem = (field: string, index: number, value: string) => {
    const items = [...(formData[field] || [])];
    items[index] = value;
    updateField(field, items);
  };

  const removeItem = (field: string, index: number) => {
    const items = [...(formData[field] || [])];
    items.splice(index, 1);
    updateField(field, items);
  };

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상품 요약</label>
        <textarea
          value={formData.excerpt || ""}
          onChange={(e) => updateField("excerpt", e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="상품 목록에 표시될 짧은 소개"
        />
      </div>

      {/* 리치 에디터 안내 */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <span className="flex-shrink-0">💡</span>
        <p>리치 텍스트(이미지, 표, 서식 등)로 편집하려면 <strong>&quot;페이지 편집&quot;</strong> 탭을 이용해주세요.</p>
      </div>

      {/* 본문 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상품 소개</label>
        <textarea
          value={formData.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="상세 상품 소개 내용"
        />
      </div>

      {/* 포함사항 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">포함사항</label>
          <button
            onClick={() => addItem("inclusions")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
        <div className="space-y-2">
          {(formData.inclusions || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("inclusions", idx, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="왕복 항공료"
              />
              <button
                onClick={() => removeItem("inclusions", idx)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!formData.inclusions || formData.inclusions.length === 0) && (
            <p className="text-sm text-gray-400">포함사항을 추가해주세요</p>
          )}
        </div>
      </div>

      {/* 불포함사항 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">불포함사항</label>
          <button
            onClick={() => addItem("exclusions")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> 추가
          </button>
        </div>
        <div className="space-y-2">
          {(formData.exclusions || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem("exclusions", idx, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="여행자보험"
              />
              <button
                onClick={() => removeItem("exclusions", idx)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!formData.exclusions || formData.exclusions.length === 0) && (
            <p className="text-sm text-gray-400">불포함사항을 추가해주세요</p>
          )}
        </div>
      </div>
    </div>
  );
}
