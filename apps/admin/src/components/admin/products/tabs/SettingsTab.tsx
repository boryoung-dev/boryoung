"use client";

import { Plus, X } from "lucide-react";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function SettingsTab({ formData, updateField }: Props) {
  const badgeMode = formData.badgeMode || "AUTO";
  const customBadges: string[] = Array.isArray(formData.customBadges)
    ? formData.customBadges
    : [];

  const updateCustomBadge = (index: number, value: string) => {
    const next = [...customBadges];
    next[index] = value;
    updateField("customBadges", next);
  };

  const addCustomBadge = () => {
    if (customBadges.length >= 3) return;
    updateField("customBadges", [...customBadges, ""]);
  };

  const removeCustomBadge = (index: number) => {
    updateField(
      "customBadges",
      customBadges.filter((_, badgeIndex) => badgeIndex !== index)
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 활성/비활성 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm font-medium text-gray-900">상품 활성화</div>
          <div className="text-xs text-gray-500">비활성 시 사이트에 표시되지 않습니다</div>
        </div>
        <button
          type="button"
          onClick={() => updateField("isActive", !formData.isActive)}
          aria-label="상품 활성화 전환"
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.isActive ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              formData.isActive ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* 추천 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm font-medium text-gray-900">추천 상품</div>
          <div className="text-xs text-gray-500">홈페이지 및 목록 상단에 우선 노출</div>
        </div>
        <button
          type="button"
          onClick={() => updateField("isFeatured", !formData.isFeatured)}
          aria-label="추천 상품 전환"
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.isFeatured ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              formData.isFeatured ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* 상품 라벨 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900">상품 라벨</div>
          <div className="mt-1 text-xs leading-5 text-gray-500">
            상품 카드와 상세 페이지에 표시할 라벨을 선택합니다.
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            {
              value: "AUTO",
              label: "자동 (기본)",
              description: "추천·할인 조건으로 자동 표시",
            },
            {
              value: "CUSTOM",
              label: "직접 지정",
              description: "원하는 문구를 최대 3개 표시",
            },
            {
              value: "HIDDEN",
              label: "모두 숨김",
              description: "이 상품에는 라벨을 표시하지 않음",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField("badgeMode", option.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                badgeMode === option.value
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="block text-sm font-medium text-gray-900">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-4 text-gray-500">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        {badgeMode === "AUTO" && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600">
            추천 상품이면 <strong>베스트</strong>, 정가보다 판매가가 낮으면
            <strong> 할인율</strong>이 기존 코드 기준으로 자동 표시됩니다.
          </div>
        )}

        {badgeMode === "CUSTOM" && (
          <div className="mt-4 space-y-3">
            {customBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={badge}
                  maxLength={20}
                  onChange={(event) =>
                    updateCustomBadge(index, event.target.value)
                  }
                  placeholder={`라벨 ${index + 1} (예: 이번 주 특가)`}
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => removeCustomBadge(index)}
                  aria-label={`라벨 ${index + 1} 삭제`}
                  className="rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {customBadges.length < 3 && (
              <button
                type="button"
                onClick={addCustomBadge}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                라벨 추가
              </button>
            )}

            <p className="text-xs text-gray-500">
              빈 라벨은 저장할 때 제외되며, 라벨 하나당 최대 20자입니다.
            </p>
          </div>
        )}

        {badgeMode === "HIDDEN" && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            추천 상품이나 할인 상품이어도 이 상품에는 라벨이 표시되지 않습니다.
          </div>
        )}
      </div>

      {/* 정렬 순서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => updateField("sortOrder", parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">숫자가 작을수록 앞에 표시됩니다</p>
      </div>

      {/* 발행일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">발행일</label>
        <input
          type="datetime-local"
          value={formData.publishedAt || ""}
          onChange={(e) => updateField("publishedAt", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
