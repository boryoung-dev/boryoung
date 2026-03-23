"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Select from "@/components/ui/Select";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
  isEditMode?: boolean;
}

export function BasicInfoTab({ formData, updateField, isEditMode }: Props) {
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    updateField("title", title);
    // 수정 모드에서는 slug을 자동으로 덮어쓰지 않음 (URL 깨짐 방지)
    if (!isEditMode) {
      updateField("slug", generateSlug(title));
    }
  };

  const updateDuration = (nights: number, days: number) => {
    updateField("nights", nights);
    updateField("days", days);
    if (nights && days) {
      updateField("durationText", `${nights}박${days}일`);
    }
  };

  // 골프 코스 관리
  const golfCourses = Array.isArray(formData.golfCourses) ? formData.golfCourses : [];

  const addGolfCourse = () => {
    updateField("golfCourses", [...golfCourses, { name: "", holes: 18, par: 72 }]);
  };

  const updateGolfCourse = (index: number, field: string, value: any) => {
    const updated = golfCourses.map((c: any, i: number) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateField("golfCourses", updated);
  };

  const removeGolfCourse = (index: number) => {
    updateField("golfCourses", golfCourses.filter((_: any, i: number) => i !== index));
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
            onChange={(e) => handleTitleChange(e.target.value)}
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
            Slug {isEditMode && <span className="text-xs text-amber-600 ml-1">(변경 시 기존 URL이 깨질 수 있습니다)</span>}
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="자동 생성됩니다"
            readOnly={!isEditMode && !!formData.slug}
          />
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-400">영문, 숫자, 하이픈만 사용 권장</p>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.categoryId}
            onChange={(val) => updateField("categoryId", val)}
            options={[
              { value: "", label: "카테고리 선택" },
              ...categories.map((cat) => ({
                value: cat.id,
                label: `${"  ".repeat(cat.depth)}${cat.depth > 0 ? "└ " : ""}${cat.name}`,
              })),
            ]}
            className="w-full"
          />
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
            value={formData.basePrice ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              updateField("basePrice", val === "" ? null : parseInt(val));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1990000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">정가 (원, 선택)</label>
          <input
            type="number"
            value={formData.originalPrice ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              updateField("originalPrice", val === "" ? null : parseInt(val));
            }}
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

      {/* 골프 정보 섹션 */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">골프 정보</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
            <Select
              value={formData.difficulty || ""}
              onChange={(val) => updateField("difficulty", val || "")}
              options={[
                { value: "", label: "선택 안함" },
                { value: "BEGINNER", label: "초급" },
                { value: "INTERMEDIATE", label: "중급" },
                { value: "ADVANCED", label: "상급" },
                { value: "ALL", label: "전체" },
              ]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">총 홀 수</label>
            <input
              type="number"
              min="0"
              value={formData.totalHoles ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                updateField("totalHoles", val === "" ? null : parseInt(val));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="54"
            />
          </div>
        </div>

        {/* 골프 코스 목록 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">골프 코스</label>
            <button
              onClick={addGolfCourse}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              + 코스 추가
            </button>
          </div>
          {golfCourses.length === 0 && (
            <p className="text-sm text-gray-400">골프 코스를 추가해주세요</p>
          )}
          <div className="space-y-3">
            {golfCourses.map((course: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={course.name || ""}
                    onChange={(e) => updateGolfCourse(idx, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="코스명"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={course.holes ?? 18}
                    onChange={(e) => updateGolfCourse(idx, "holes", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="홀"
                  />
                  <span className="text-xs text-gray-400">홀</span>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={course.par ?? 72}
                    onChange={(e) => updateGolfCourse(idx, "par", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="파"
                  />
                  <span className="text-xs text-gray-400">파</span>
                </div>
                <button
                  onClick={() => removeGolfCourse(idx)}
                  className="p-2 text-gray-400 hover:text-red-600 mt-0.5"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
