"use client";

import { useApiQuery } from "@/hooks/useApi";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function TagsSeoTab({ formData, updateField }: Props) {
  const { data: tagsData } = useApiQuery<any>(["tags"], "/api/tags");
  const tags: any[] = tagsData?.success ? tagsData.tags : [];

  const toggleTag = (tagId: string) => {
    const current = formData.tagIds || [];
    if (current.includes(tagId)) {
      updateField("tagIds", current.filter((id: string) => id !== tagId));
    } else {
      updateField("tagIds", [...current, tagId]);
    }
  };

  const grouped = tags.reduce((acc: any, tag: any) => {
    const type = tag.type || "FEATURE";
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    FEATURE: "특징",
    DURATION: "기간",
    PRICE_RANGE: "가격대",
    ACCOMMODATION: "숙소",
  };

  return (
    <div className="space-y-8">
      {/* 태그 선택 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">태그 선택</h3>
        {Object.entries(grouped).map(([type, typeTags]: any) => (
          <div key={type} className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">
              {typeLabels[type] || type}
            </div>
            <div className="flex flex-wrap gap-2">
              {typeTags.map((tag: any) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (formData.tagIds || []).includes(tag.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-gray-400">태그가 없습니다. 태그 관리에서 먼저 추가해주세요.</p>
        )}
      </div>

      {/* SEO */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">SEO 설정</h3>
          <button
            type="button"
            onClick={() => {
              const title = formData.title || "";
              const dest = formData.destination || "";
              const duration = formData.durationText || "";
              const price = formData.basePrice ? `${Number(formData.basePrice).toLocaleString()}원~` : "";

              const metaTitle = `${title} | 보령항공여행`;
              const parts = [dest, duration, "골프투어"].filter(Boolean);
              const metaDesc = price
                ? `${parts.join(" ")} ${price}. 왕복 항공권, 숙박, 그린피 포함 패키지. 보령항공여행에서 예약하세요.`
                : `${parts.join(" ")} 패키지. 왕복 항공권, 숙박, 그린피 포함. 보령항공여행에서 예약하세요.`;

              updateField("metaTitle", metaTitle);
              updateField("metaDescription", metaDesc);
            }}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            자동 생성
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
            <input
              type="text"
              value={formData.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="검색 엔진에 표시될 제목 (자동 생성 버튼을 눌러보세요)"
            />
            {formData.metaTitle && (
              <p className="mt-1 text-xs text-gray-400">{formData.metaTitle.length}/60자</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
            <textarea
              value={formData.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="검색 결과에 표시될 설명 (자동 생성 버튼을 눌러보세요)"
            />
            {formData.metaDescription && (
              <p className="mt-1 text-xs text-gray-400">{formData.metaDescription.length}/160자</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">네이버 블로그 URL</label>
            <input
              type="url"
              value={formData.naverUrl || ""}
              onChange={(e) => updateField("naverUrl", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://blog.naver.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
