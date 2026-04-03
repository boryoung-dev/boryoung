"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/components/ui/Toast";
import { ProductSelector } from "./ProductSelector";
import type { Curation } from "../HomepageEditor";

interface SectionEditPanelProps {
  curation: Curation;
  onClose: () => void;
  /** 로컬 state 업데이트 (미리보기 실시간 반영) */
  onLocalUpdate: (updated: Partial<Curation>) => void;
  onSaved: () => void;
}

/** 섹션 편집 패널 - 섹션 타입에 따라 적절한 폼 렌더링 */
export function SectionEditPanel({
  curation,
  onClose,
  onLocalUpdate,
  onSaved,
}: SectionEditPanelProps) {
  const { toast } = useToast();
  const { token } = useAdminAuth();

  // 카테고리 데이터 (전체 보기 링크 동적 생성용)
  const { data: categoriesData } = useApiQuery<any>(
    ["categories"],
    "/api/categories"
  );
  const topCategories: any[] =
    categoriesData?.success ? categoriesData.categories || [] : [];

  const [title, setTitle] = useState(curation.title);
  const [subtitle, setSubtitle] = useState(curation.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(curation.linkUrl || "");
  const [isActive, setIsActive] = useState(curation.isActive);
  const [description, setDescription] = useState(curation.description || "");

  // 타입별 고유 상태
  const [destinations, setDestinations] = useState<
    Array<{ name: string; image: string }>
  >(curation.displayConfig?.destinations || []);
  const [tabs, setTabs] = useState<string[]>(
    curation.displayConfig?.tabs || []
  );
  const [ctaPhone, setCtaPhone] = useState(
    curation.displayConfig?.phone || ""
  );

  // curation 변경시 상태 리셋
  useEffect(() => {
    setTitle(curation.title);
    setSubtitle(curation.subtitle || "");
    setLinkUrl(curation.linkUrl || "");
    setIsActive(curation.isActive);
    setDescription(curation.description || "");
    setDestinations(curation.displayConfig?.destinations || []);
    setTabs(curation.displayConfig?.tabs || []);
    setCtaPhone(curation.displayConfig?.phone || "");
  }, [curation.id]);

  // 변경시 로컬 미리보기 업데이트
  useEffect(() => {
    const displayConfig = buildDisplayConfig();
    onLocalUpdate({
      title,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      isActive,
      description: description || null,
      displayConfig,
    });
  }, [title, subtitle, linkUrl, isActive, description, destinations, tabs, ctaPhone]);

  const buildDisplayConfig = () => {
    const base = curation.displayConfig || {};
    switch (curation.sectionType) {
      case "destinations_carousel":
        return { ...base, destinations: destinations.filter((d) => d.name) };
      case "product_showcase":
        return { ...base, tabs: tabs.filter((t) => t) };
      case "trust_cta":
        return { ...base, phone: ctaPhone };
      default:
        return base;
    }
  };

  const saveMutation = useApiMutation<any, { id: string; body: any }>(
    async ({ id, body }, token) =>
      fetch(`/api/curations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }),
    { invalidateKeys: [["curations"]] }
  );

  const handleSave = () => {
    if (!title.trim()) {
      toast("제목은 필수입니다", "error");
      return;
    }
    const body = {
      title,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      isActive,
      description:
        curation.sectionType === "trust_cta" ? description || null : curation.description,
      displayConfig: buildDisplayConfig(),
    };
    saveMutation.mutate(
      { id: curation.id, body },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast("저장되었습니다", "success");
            onSaved();
          } else {
            toast(data.error || "저장 실패", "error");
          }
        },
        onError: () => toast("저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const sectionType = curation.sectionType || "";
  const needsProducts = [
    "featured_grid",
    "product_carousel",
    "product_showcase",
  ].includes(sectionType);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h3 className="text-base font-bold text-gray-900">섹션 편집</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 폼 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* 섹션 타입 안내 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-700">
            {sectionType === "featured_grid" && "추천 그리드 — 2행 3열 카드 (최대 6개 상품)"}
            {sectionType === "product_carousel" && "상품 캐러셀 — 가로 슬라이드로 상품 표시"}
            {sectionType === "product_showcase" && "상품 쇼케이스 — 탭으로 필터 + 캐러셀 표시"}
            {sectionType === "destinations_carousel" && "여행지 캐러셀 — 원형 이미지로 여행지 표시, 클릭 시 해당 여행지 상품 목록으로 이동"}
            {sectionType === "banner_hero" && "배너 히어로 — 2x2 배너 그리드 (최대 4개, 배너 관리에서 등록)"}
            {sectionType === "trust_cta" && "신뢰 CTA — 큰 문구 + 상담 전화번호 표시"}
          </p>
        </div>

        {/* 공통: 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          {sectionType === "trust_cta" ? (
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="22년간,&#10;10,000명의 골퍼가 선택했습니다"
            />
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="섹션 제목"
            />
          )}
          {sectionType === "trust_cta" && (
            <p className="text-xs text-gray-400 mt-1">줄바꿈이 그대로 반영됩니다</p>
          )}
        </div>

        {/* 공통: 부제 (trust_cta 제외) */}
        {sectionType !== "trust_cta" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부제
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="부제목"
            />
          </div>
        )}

        {/* 공통: 전체 보기 링크 (trust_cta, banner_hero 제외) */}
        {!["trust_cta", "banner_hero"].includes(sectionType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              "전체 보기" 링크
            </label>
            <select
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">선택 안함 (전체 보기 숨김)</option>
              <option value="/tours">여행상품 전체</option>
              {topCategories.map((c: any) => (
                <option key={c.id} value={`/tours?category=${c.slug}`}>
                  {c.name} 상품
                </option>
              ))}
              <option value="/magazine">매거진</option>
              <option value="/about">회사소개</option>
              <option value="/contact">문의하기</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">섹션 우측 상단 "전체 보기 →" 클릭 시 이동할 페이지</p>
          </div>
        )}

        {/* 공통: 활성화 토글 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">활성화</span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isActive ? "translate-x-[22px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* destinations_carousel: 여행지 목록 */}
        {sectionType === "destinations_carousel" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                여행지 목록
              </label>
              <button
                type="button"
                onClick={() =>
                  setDestinations([...destinations, { name: "", image: "" }])
                }
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + 추가
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2">클릭 시 해당 여행지 상품 목록으로 이동합니다</p>
            <div className="space-y-3">
              {destinations.map((dest, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {dest.image ? (
                      <div className="relative group">
                        <img
                          src={dest.image}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity">
                          <span className="text-white text-[10px]">변경</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("folder", "destinations");
                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  headers: { Authorization: `Bearer ${token}` },
                                  body: formData,
                                });
                                const data = await res.json();
                                if (data.success) {
                                  const next = [...destinations];
                                  next[idx] = { ...next[idx], image: data.url };
                                  setDestinations(next);
                                }
                              } catch {}
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                        <span className="text-gray-400 text-[10px] text-center">이미지<br/>업로드</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("folder", "destinations");
                            try {
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData,
                              });
                              const data = await res.json();
                              if (data.success) {
                                const next = [...destinations];
                                next[idx] = { ...next[idx], image: data.url };
                                setDestinations(next);
                              }
                            } catch {}
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={dest.name}
                      onChange={(e) => {
                        const next = [...destinations];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setDestinations(next);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="여행지 이름 (예: 나트랑)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDestinations(destinations.filter((_, i) => i !== idx))
                    }
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {destinations.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  여행지를 추가해주세요
                </p>
              )}
            </div>
          </div>
        )}

        {/* product_showcase: 탭 편집 */}
        {sectionType === "product_showcase" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                탭 필터
              </label>
              <button
                type="button"
                onClick={() => setTabs([...tabs, ""])}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + 탭 추가
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2">상품을 목적지별로 분류하는 탭입니다. 첫 번째 탭은 "전체"로 설정하세요.</p>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map((tab, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-50 border rounded-lg px-2 py-1"
                >
                  <input
                    type="text"
                    value={tab}
                    onChange={(e) => {
                      const next = [...tabs];
                      next[idx] = e.target.value;
                      setTabs(next);
                    }}
                    className="w-16 px-1 py-0.5 border-0 bg-transparent text-xs focus:outline-none"
                    placeholder="탭 이름"
                  />
                  <button
                    type="button"
                    onClick={() => setTabs(tabs.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {tabs.length === 0 && (
                <p className="text-xs text-gray-400">
                  탭을 추가하세요 (예: 전체, 일본, 태국)
                </p>
              )}
            </div>
          </div>
        )}

        {/* trust_cta: 설명 + 전화번호 */}
        {sectionType === "trust_cta" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 문구
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="보령항공여행사와 함께 최고의 골프 여행을 경험하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="text"
                value={ctaPhone}
                onChange={(e) => setCtaPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="1588-0320"
              />
            </div>
          </div>
        )}

        {/* banner_hero: 안내 메시지 + 배너 관리 링크 */}
        {sectionType === "banner_hero" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <p className="text-xs text-amber-800 font-medium">
              배너 이미지와 내용은 "배너 관리" 메뉴에서 등록하세요.
            </p>
            <p className="text-xs text-amber-600">
              이 섹션은 등록된 배너 중 활성 상태인 배너를 최대 4개까지 자동으로 표시합니다.
            </p>
            <a
              href="/banners"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              배너 관리로 이동 →
            </a>
          </div>
        )}

        {/* 상품 연결이 필요한 섹션 */}
        {needsProducts && (
          <ProductSelector
            curationId={curation.id}
            maxItems={
              sectionType === "featured_grid" ? 6 :
              sectionType === "banner_hero" ? 4 :
              undefined
            }
            onProductsChange={(products) => onLocalUpdate({ products })}
          />
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="px-5 py-3 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
