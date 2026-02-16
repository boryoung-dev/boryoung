"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Info, Image as ImageIcon, Check, X, Save, Loader2 } from "lucide-react";

interface Props {
  formData: any;
  updateField: (field: string, value: any) => void;
  initialData?: any;
}

export function TemplateEditorTab({ formData, updateField, initialData }: Props) {
  const { authHeaders } = useAdminAuth();
  const [itineraryDescriptions, setItineraryDescriptions] = useState<Record<number, string>>({});
  const [itineraryChanged, setItineraryChanged] = useState(false);
  const [savingItinerary, setSavingItinerary] = useState(false);

  useEffect(() => {
    if (initialData?.itineraries) {
      const descs: Record<number, string> = {};
      initialData.itineraries.forEach((it: any, idx: number) => {
        descs[idx] = it.description || "";
      });
      setItineraryDescriptions(descs);
    }
  }, [initialData?.itineraries]);

  const handleSaveItineraryDescriptions = async () => {
    if (!initialData?.id || !initialData?.itineraries) return;
    setSavingItinerary(true);
    try {
      const updates = initialData.itineraries
        .map((it: any, idx: number) => ({
          itineraryId: it.id,
          description: itineraryDescriptions[idx] || "",
        }))
        .filter((u: any) => u.itineraryId);

      const res = await fetch(`/api/products/${initialData.id}/itineraries`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.success) {
        setItineraryChanged(false);
        alert("일정 설명이 저장되었습니다");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("일정 설명 저장 중 오류가 발생했습니다");
    } finally {
      setSavingItinerary(false);
    }
  };

  const thumbnailUrl = initialData?.images?.find((img: any) => img.isThumbnail)?.url
    || initialData?.images?.[0]?.url;

  return (
    <div className="space-y-6">
      {/* 안내 배너 */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">상세페이지 미리보기 + 편집</p>
          <p>
            실제 상세페이지 레이아웃을 미러링합니다. 편집 가능한 영역은 파란 테두리로 표시됩니다.
            읽기전용 영역은 해당 탭에서 수정해주세요.
          </p>
        </div>
      </div>

      {/* 히어로 미리보기 (읽기전용) */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative h-48 bg-gray-300 flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="썸네일"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold">{formData.title || "상품 제목"}</h1>
              {formData.subtitle && (
                <p className="text-sm mt-1 opacity-80">{formData.subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-gray-500 text-center">
          히어로 영역 — &quot;기본 정보&quot; / &quot;이미지&quot; 탭에서 수정
        </div>
      </div>

      {/* 메인 콘텐츠 + 사이드바 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 하이라이트 카드 미리보기 (읽기전용) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 text-xs">목적지</p>
                <p className="font-semibold text-gray-800">{formData.destination || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 text-xs">기간</p>
                <p className="font-semibold text-gray-800">{formData.durationText || `${formData.nights || 0}박${formData.days || 0}일`}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 text-xs">출발</p>
                <p className="font-semibold text-gray-800">{formData.departure || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-500 text-xs">항공</p>
                <p className="font-semibold text-gray-800">{formData.airline || "-"}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              하이라이트 카드 — &quot;기본 정보&quot; 탭에서 수정
            </p>
          </div>

          {/* 상품 소개 (편집 가능) */}
          <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-800">상품 소개</span>
              <span className="text-xs text-blue-500">— 편집 가능</span>
            </div>
            <div className="p-4">
              {formData.excerpt && (
                <p className="text-gray-700 leading-relaxed text-base mb-4 pb-4 border-b border-gray-100">
                  {formData.excerpt}
                </p>
              )}
              <TiptapEditor
                content={formData.contentHtml || ""}
                onChange={(html) => updateField("contentHtml", html)}
                placeholder="상품 소개를 작성하세요. 이미지, 표, 서식 등을 자유롭게 사용할 수 있습니다."
                minHeight="300px"
              />
            </div>
          </div>

          {/* 여행 일정 (부분 편집) */}
          {initialData?.itineraries && initialData.itineraries.length > 0 && (
            <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-800">여행 일정</span>
                <span className="text-xs text-blue-500">— 설명 편집 가능</span>
              </div>
              <div className="p-4 space-y-4">
                {initialData.itineraries.map((day: any, idx: number) => (
                  <div key={day.id || idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        DAY {day.day}
                      </span>
                      <h3 className="font-semibold text-gray-900">{day.title}</h3>
                      <span className="text-xs text-gray-400 ml-auto">제목은 &quot;일정&quot; 탭에서 수정</span>
                    </div>
                    <TiptapEditor
                      content={itineraryDescriptions[idx] || ""}
                      onChange={(html) => {
                        setItineraryDescriptions((prev) => ({ ...prev, [idx]: html }));
                        setItineraryChanged(true);
                      }}
                      placeholder={`${day.day}일차 상세 설명을 작성하세요...`}
                      minHeight="100px"
                      compact
                    />
                    {/* 메타 정보 미리보기 */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      {day.meals && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          식사: {day.meals}
                        </span>
                      )}
                      {day.accommodation && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          숙소: {day.accommodation}
                        </span>
                      )}
                      {day.golfCourse && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          골프: {day.golfCourse}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {/* 일정 설명 저장 버튼 */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    일정 추가/삭제는 &quot;일정&quot; 탭에서 관리해주세요.
                  </p>
                  <button
                    onClick={handleSaveItineraryDescriptions}
                    disabled={savingItinerary || !itineraryChanged}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingItinerary ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 저장 중...</>
                    ) : (
                      <><Save className="w-3.5 h-3.5" /> 일정 설명 저장</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 포함/불포함 미리보기 (읽기전용) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">포함 / 불포함 사항</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-green-700 mb-2">포함사항</p>
                {formData.inclusions?.length > 0 ? (
                  <ul className="space-y-1">
                    {formData.inclusions.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">없음</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-red-700 mb-2">불포함사항</p>
                {formData.exclusions?.length > 0 ? (
                  <ul className="space-y-1">
                    {formData.exclusions.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">없음</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              포함/불포함 사항은 &quot;상품 소개&quot; 탭에서 수정
            </p>
          </div>
        </div>

        {/* 우측 예약바 미리보기 (1/3, 읽기전용) */}
        <div className="hidden lg:block">
          <div className="sticky top-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">예약 영역 미리보기</h3>
            <div className="space-y-3">
              <div>
                {formData.basePrice ? (
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {Number(formData.basePrice).toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-500 ml-1">~</span>
                    {formData.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        {Number(formData.originalPrice).toLocaleString()}원
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-500">가격 문의</span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>기간: {formData.durationText || `${formData.nights || 0}박${formData.days || 0}일`}</p>
                {formData.minPeople && (
                  <p>인원: {formData.minPeople}~{formData.maxPeople || ""}명</p>
                )}
              </div>
              <button className="w-full py-2.5 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                예약하기 (미리보기)
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              가격/인원은 &quot;기본 정보&quot; / &quot;가격 옵션&quot; 탭에서 수정
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
