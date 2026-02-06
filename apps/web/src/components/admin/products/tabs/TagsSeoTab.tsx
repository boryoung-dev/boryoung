"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function TagsSeoTab({ formData, updateField }: Props) {
  const { authHeaders } = useAdminAuth();
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetchTags();
  }, [authHeaders]);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/tags", { headers: authHeaders as any });
      const data = await res.json();
      if (data.success) setTags(data.tags);
    } catch {}
  };

  const toggleTag = (tagId: string) => {
    const current = formData.tagIds || [];
    if (current.includes(tagId)) {
      updateField("tagIds", current.filter((id: string) => id !== tagId));
    } else {
      updateField("tagIds", [...current, tagId]);
    }
  };

  // 타입별 그룹
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
        <h3 className="text-sm font-medium text-gray-700 mb-4">SEO 설정</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
            <input
              type="text"
              value={formData.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="검색 엔진에 표시될 제목"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
            <textarea
              value={formData.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="검색 결과에 표시될 설명"
            />
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
