"use client";

import { useState, useEffect, useMemo } from "react";
import { useApiQuery } from "@/hooks/useApi";
import Select from "@/components/ui/Select";
import { slugify } from "@/lib/slugify";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
  isEditMode?: boolean;
}

export function BasicInfoTab({ formData, updateField, isEditMode }: Props) {
  const { data: categoriesData } = useApiQuery<any>(
    ["categories"],
    "/api/categories"
  );

  // 최상위(level 0) 카테고리 목록
  const topCategories: any[] = useMemo(() => {
    if (!categoriesData?.success) return [];
    return categoriesData.categories || [];
  }, [categoriesData]);

  // 현재 categoryId로부터 국가(selectedCountry) 초기값 결정
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  useEffect(() => {
    if (!topCategories.length || !formData.categoryId) return;
    // categoryId가 최상위인지 확인
    const isTop = topCategories.find((c: any) => c.id === formData.categoryId);
    if (isTop) {
      setSelectedCountry(isTop.id);
      return;
    }
    // categoryId가 하위 지역인 경우: 부모를 찾는다
    for (const country of topCategories) {
      const region = (country.children || []).find(
        (r: any) => r.id === formData.categoryId
      );
      if (region) {
        setSelectedCountry(country.id);
        return;
      }
    }
  }, [topCategories, formData.categoryId]);

  // 선택된 국가의 하위 지역 목록
  const regions: any[] = useMemo(() => {
    if (!selectedCountry || !topCategories.length) return [];
    const country = topCategories.find((c: any) => c.id === selectedCountry);
    return country?.children || [];
  }, [selectedCountry, topCategories]);

  // 국가 변경 핸들러
  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    if (!countryId) {
      updateField("categoryId", "");
      updateField("destination", "");
      return;
    }
    const country = topCategories.find((c: any) => c.id === countryId);
    if (!country) return;
    // 하위 지역이 없으면 바로 국가를 categoryId로 설정
    if (!country.children?.length) {
      updateField("categoryId", countryId);
      updateField("destination", country.name);
    } else {
      // 지역 선택 대기
      updateField("categoryId", "");
      updateField("destination", "");
    }
  };

  // 지역 변경 핸들러
  const handleRegionChange = (regionId: string) => {
    if (!regionId) {
      updateField("categoryId", "");
      updateField("destination", "");
      return;
    }
    const country = topCategories.find((c: any) => c.id === selectedCountry);
    const region = regions.find((r: any) => r.id === regionId);
    if (country && region) {
      updateField("categoryId", regionId);
      updateField("destination", `${country.name} ${region.name}`);
    }
  };

  const generateSlug = (title: string) => slugify(title);

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
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            placeholder="상품명 입력 시 자동 생성"
            readOnly
          />
          <p className="mt-1 text-xs text-gray-400">상품명에서 자동 생성됩니다</p>
        </div>

        {/* 국가 (카테고리 level 0) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            국가 <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedCountry}
            onChange={handleCountryChange}
            options={[
              { value: "", label: "국가 선택" },
              ...topCategories.map((cat: any) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            className="w-full"
          />
        </div>

        {/* 지역 (카테고리 level 1) - 하위 지역이 있는 경우에만 표시 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지역 {regions.length > 0 && <span className="text-red-500">*</span>}
          </label>
          {regions.length > 0 ? (
            <Select
              value={formData.categoryId}
              onChange={handleRegionChange}
              options={[
                { value: "", label: "지역 선택" },
                ...regions.map((r: any) => ({
                  value: r.id,
                  label: r.name,
                })),
              ]}
              className="w-full"
            />
          ) : (
            <p className="px-4 py-2 text-sm text-gray-400 border border-gray-200 rounded-lg bg-gray-50">
              {selectedCountry ? "하위 지역 없음 (국가가 카테고리로 사용됩니다)" : "국가를 먼저 선택해주세요"}
            </p>
          )}
          {formData.destination && (
            <p className="mt-1 text-xs text-gray-500">
              목적지: <span className="font-medium">{formData.destination}</span>
            </p>
          )}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">기간 (박) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0"
            value={formData.nights || ""}
            onChange={(e) => updateDuration(parseInt(e.target.value) || 0, formData.days)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기간 (일) <span className="text-red-500">*</span></label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">기본 가격 (원) <span className="text-red-500">*</span></label>
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
