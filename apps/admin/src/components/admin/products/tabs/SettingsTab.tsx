"use client";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function SettingsTab({ formData, updateField }: Props) {
  return (
    <div className="space-y-6 max-w-lg">
      {/* 활성/비활성 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm font-medium text-gray-900">상품 활성화</div>
          <div className="text-xs text-gray-500">비활성 시 사이트에 표시되지 않습니다</div>
        </div>
        <button
          onClick={() => updateField("isActive", !formData.isActive)}
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
          onClick={() => updateField("isFeatured", !formData.isFeatured)}
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
