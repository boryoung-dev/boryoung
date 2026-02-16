"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export function BasicInfoTab({ formData, updateField }: Props) {
  const { authHeaders } = useAdminAuth();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, [authHeaders]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { headers: authHeaders as any });
      const data = await res.json();
      if (data.success) {
        const flat: any[] = [];
        const flatten = (cats: any[], depth = 0) => {
          cats.forEach((c: any) => {
            flat.push({ ...c, depth });
            if (c.children?.length) flatten(c.children, depth + 1);
          });
        };
        flatten(data.categories);
        setCategories(flat);
      }
    } catch {}
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    updateField("slug", slug);
  };

  const updateDuration = (nights: number, days: number) => {
    updateField("nights", nights);
    updateField("days", days);
    if (nights && days) {
      updateField("durationText", `${nights}박${days}일`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 제목 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="[일본골프] 규슈 3색온천 54홀 골프 4박5일"
          />
        </div>

        {/* 부제 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">부제</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="프리미엄 골프 투어"
          />
        </div>

        {/* Slug */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="kyushu-golf-54-4n5d"
            />
            <button
              onClick={generateSlug}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              자동생성
            </button>
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {"  ".repeat(cat.depth)}{cat.depth > 0 ? "└ " : ""}{cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 목적지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            목적지 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => updateField("destination", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="일본"
          />
        </div>

        {/* 출발지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">출발지</label>
          <input
            type="text"
            value={formData.departure}
            onChange={(e) => updateField("departure", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="인천"
          />
        </div>

        {/* 항공사 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">항공사</label>
          <input
            type="text"
            value={formData.airline}
            onChange={(e) => updateField("airline", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="대한항공"
          />
        </div>

        {/* 기간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기간 (박)</label>
          <input
            type="number"
            min="0"
            value={formData.nights || ""}
            onChange={(e) => updateDuration(parseInt(e.target.value) || 0, formData.days)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기간 (일)</label>
          <input
            type="number"
            min="0"
            value={formData.days || ""}
            onChange={(e) => updateDuration(formData.nights, parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기본 가격 (원)</label>
          <input
            type="number"
            value={formData.basePrice || ""}
            onChange={(e) => updateField("basePrice", parseInt(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1990000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">정가 (원, 선택)</label>
          <input
            type="number"
            value={formData.originalPrice || ""}
            onChange={(e) => updateField("originalPrice", parseInt(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2490000"
          />
        </div>

        {/* 인원 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최소 인원</label>
          <input
            type="number"
            min="1"
            value={formData.minPeople || ""}
            onChange={(e) => updateField("minPeople", parseInt(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
          <input
            type="number"
            min="1"
            value={formData.maxPeople || ""}
            onChange={(e) => updateField("maxPeople", parseInt(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
