"use client";

import { useState, useEffect, useRef } from "react";
import { Save, X, GripVertical } from "lucide-react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/components/ui/Toast";
import { ProductSelector } from "./ProductSelector";
import type { Curation } from "../HomepageEditor";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StyleConfigEditor, type SectionStyleConfig } from "./StyleConfigEditor";
import {
  FullBleedHeroEditor,
  StorySplitEditor,
  StatHighlightsEditor,
  FeatureCardsEditor,
  TestimonialSliderEditor,
  ProcessStepsEditor,
  CtaCenteredEditor,
  ImageGalleryEditor,
  RichTextEditor,
  VideoHeroEditor,
  LogoWallEditor,
  FaqAccordionEditor,
  PriceTableEditor,
  TimelineEditor,
  ComparisonTableEditor,
  IconCalloutsEditor,
  QuoteBlockEditor,
  AwardsBadgesEditor,
  FeatureAlternatingEditor,
  ProductMasonryEditor,
  ProductSpotlightEditor,
  ProductSplitCarouselEditor,
  ProductCompactListEditor,
  ProductHeroBannerEditor,
  ProductTabsCountryEditor,
  ProductDealGridEditor,
  ProductOverlapGridEditor,
} from "./NewSectionDataEditors";

/** 신규 섹션 타입 — 공용 스타일/헤딩 편집 + 데이터 편집 적용 */
const NEW_SECTION_TYPES = new Set([
  "full_bleed_hero",
  "gradient_banner",
  "story_split",
  "stat_highlights",
  "feature_cards",
  "testimonial_slider",
  "process_steps",
  "cta_centered",
  "image_gallery",
  "rich_text",
  "video_hero",
  "logo_wall",
  "faq_accordion",
  "price_table",
  "timeline",
  "comparison_table",
  "icon_callouts",
  "quote_block",
  "awards_badges",
  "feature_alternating",
  // 신규 상품 섹션 (21~30)
  "product_masonry",
  "product_magazine",
  "product_spotlight",
  "product_split_carousel",
  "product_compact_list",
  "product_hero_banner",
  "product_tabs_country",
  "product_deal_grid",
  "product_polaroid_carousel",
  "product_overlap_grid",
]);

/** 상품 연결이 필요한 섹션 타입 (기존 3개 + 신규 10개) */
const PRODUCT_SECTION_TYPES = new Set([
  "featured_grid",
  "product_carousel",
  "product_showcase",
  "product_masonry",
  "product_magazine",
  "product_spotlight",
  "product_split_carousel",
  "product_compact_list",
  "product_hero_banner",
  "product_tabs_country",
  "product_deal_grid",
  "product_polaroid_carousel",
  "product_overlap_grid",
]);

type DestinationItem = { _uid: string; name: string; image: string };
const genUid = () => `dest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const withUid = (list: Array<{ name: string; image: string; _uid?: string }>): DestinationItem[] =>
  list.map((d) => ({ name: d.name || "", image: d.image || "", _uid: d._uid || genUid() }));

/** 드래그 가능한 여행지 행 래퍼 */
function SortableDestinationRow({
  id,
  children,
}: {
  id: string;
  children: (args: { dragHandleProps: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

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
  const [destinations, setDestinations] = useState<DestinationItem[]>(
    withUid(curation.displayConfig?.destinations || [])
  );
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [tabs, setTabs] = useState<string[]>(
    curation.displayConfig?.tabs || []
  );
  const [ctaPhone, setCtaPhone] = useState(
    curation.displayConfig?.phone || ""
  );
  // 연결 상품 ID 순서 (드래그 후 순서 저장용)
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productIdsDirty, setProductIdsDirty] = useState(false);

  // 신규 섹션 공용 상태 — style + 타입별 데이터 (displayConfig 통째로 관리)
  const [styleConfig, setStyleConfig] = useState<SectionStyleConfig>(
    curation.displayConfig?.style || {}
  );
  // 신규 섹션의 displayConfig 전체 (style은 위에서 관리, 나머지 데이터)
  const [newConfig, setNewConfig] = useState<any>(curation.displayConfig || {});

  // curation 변경시 상태 리셋
  useEffect(() => {
    setTitle(curation.title);
    setSubtitle(curation.subtitle || "");
    setLinkUrl(curation.linkUrl || "");
    setIsActive(curation.isActive);
    setDescription(curation.description || "");
    setDestinations(withUid(curation.displayConfig?.destinations || []));
    setTabs(curation.displayConfig?.tabs || []);
    setCtaPhone(curation.displayConfig?.phone || "");
    setStyleConfig(curation.displayConfig?.style || {});
    setNewConfig(curation.displayConfig || {});
    setProductIds([]);
    setProductIdsDirty(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, linkUrl, isActive, description, destinations, tabs, ctaPhone, styleConfig, newConfig]);

  const buildDisplayConfig = () => {
    const base = curation.displayConfig || {};
    const sectionType = curation.sectionType || "";
    // 신규 섹션: newConfig 통째로 사용 + style 병합
    if (NEW_SECTION_TYPES.has(sectionType)) {
      return { ...newConfig, style: styleConfig };
    }
    // 기존 6개 섹션: 데이터 + 공용 style 병합
    switch (sectionType) {
      case "destinations_carousel":
        return {
          ...base,
          destinations: destinations
            .filter((d) => d.name)
            .map(({ name, image }) => ({ name, image })),
          style: styleConfig,
        };
      case "product_showcase":
        return { ...base, tabs: tabs.filter((t) => t), style: styleConfig };
      case "trust_cta":
        return { ...base, phone: ctaPhone, style: styleConfig };
      default:
        // featured_grid, product_carousel, banner_hero 등
        return { ...base, style: styleConfig };
    }
  };

  // 연결 상품 순서 저장 mutation
  const saveProductsMutation = useApiMutation<any, { curationId: string; productIds: string[] }>(
    async ({ curationId, productIds }, token) =>
      fetch(`/api/curations/${curationId}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productIds }),
      }),
    { invalidateKeys: [["curations"]] }
  );

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
    const isNewSection = NEW_SECTION_TYPES.has(curation.sectionType || "");
    const body = {
      title,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      isActive,
      // trust_cta 또는 신규 섹션은 description 저장
      description:
        curation.sectionType === "trust_cta" || isNewSection
          ? description || null
          : curation.description,
      displayConfig: buildDisplayConfig(),
    };
    saveMutation.mutate(
      { id: curation.id, body },
      {
        onSuccess: async (data) => {
          if (!data.success) {
            toast(data.error || "저장 실패", "error");
            return;
          }
          // 연결 상품 순서가 변경되었으면 함께 저장
          if (productIdsDirty && needsProducts) {
            try {
              await saveProductsMutation.mutateAsync({
                curationId: curation.id,
                productIds,
              });
              setProductIdsDirty(false);
            } catch {
              toast("상품 순서 저장 실패", "error");
              return;
            }
          }
          toast("저장되었습니다", "success");
          onSaved();
        },
        onError: () => toast("저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const sectionType = curation.sectionType || "";
  const needsProducts = PRODUCT_SECTION_TYPES.has(sectionType);
  const isNewSection = NEW_SECTION_TYPES.has(sectionType);
  const NEW_SECTION_DESCS: Record<string, string> = {
    full_bleed_hero: "풀스크린 히어로 — 풀화면 배경 이미지 또는 그라디언트 + 큰 카피 + CTA",
    gradient_banner: "그라디언트 배너 — 풀와이드 그라디언트 배경 + 중앙 정렬 카피",
    story_split: "스토리 (좌우) — 이미지와 텍스트를 50:50으로 배치",
    stat_highlights: "숫자 강조 — 큰 숫자 + 단위 + 라벨로 통계 어필",
    feature_cards: "기능 카드 — 아이콘 + 타이틀 + 설명 카드 그리드",
    testimonial_slider: "고객 후기 — 별점 + 인용문 카드를 가로 슬라이더로",
    process_steps: "프로세스 단계 — 번호가 매겨진 단계별 안내 카드",
    cta_centered: "중앙 CTA — 큰 카피 + 1~2개 버튼 (중앙 정렬)",
    image_gallery: "이미지 갤러리 — 캡션 포함 이미지 그리드",
    rich_text: "리치 텍스트 — 자유 본문 + 정렬 + 최대폭 옵션",
    video_hero: "비디오 히어로 — 자동재생 배경 영상 + 큰 카피 + CTA",
    logo_wall: "로고월 — 파트너/협력사 로고 그리드 (그레이스케일 옵션)",
    faq_accordion: "FAQ 아코디언 — 질문 클릭 시 답변 펼침/접힘",
    price_table: "가격 플랜 — 플랜 카드 비교 (추천 강조)",
    timeline: "타임라인 — 세로 연혁/히스토리 (좌측 라인)",
    comparison_table: "비교 테이블 — 헤더/행 비교 (특정 컬럼 강조)",
    icon_callouts: "아이콘 콜아웃 — 작은 아이콘 + 짧은 텍스트 가로 배치",
    quote_block: "인용구 블록 — 큰 인용 + 작성자 정보",
    awards_badges: "수상 배지 — 수상/인증 배지 그리드 (이름/연도)",
    feature_alternating: "기능 좌우 교차 — 이미지+텍스트 블록을 좌우 번갈아 배치",
    // 신규 상품 섹션 (21~30)
    product_masonry: "상품 메이슨리 — 다양한 비율의 카드가 자연스러운 메이슨리 그리드",
    product_magazine: "상품 매거진 — 큰 메인 1개 + 서브 4개의 매거진 레이아웃 (최대 5개)",
    product_spotlight: "상품 스포트라이트 — 단일 상품을 풀스크린 히어로로 강조 (첫 상품만)",
    product_split_carousel: "상품 좌우+캐러셀 — 좌측 헤딩 + 우측 가로 스크롤 캐러셀",
    product_compact_list: "상품 컴팩트 리스트 — 한 행 한 상품의 작은 카드 리스트",
    product_hero_banner: "상품 히어로 배너 — 단일 상품 50:50 풀와이드 배너 (첫 상품만)",
    product_tabs_country: "상품 국가 탭 — 탭 클릭으로 destination 필터링",
    product_deal_grid: "특가 그리드 — 원가 대비 할인율이 강조된 그리드 (원가 필수)",
    product_polaroid_carousel: "폴라로이드 캐러셀 — 폴라로이드 스타일 카드 캐러셀",
    product_overlap_grid: "오버랩 그리드 — 카드가 일부 겹치며 호버 시 떠오름",
  };

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
            {isNewSection && NEW_SECTION_DESCS[sectionType]}
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

        {/* 공통: 부제 (trust_cta 제외) — 신규 섹션은 eyebrow로 사용됨 */}
        {sectionType !== "trust_cta" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isNewSection ? "Eyebrow (작은 윗 라벨)" : "부제"}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder={isNewSection ? "ABOUT US" : "부제목"}
            />
          </div>
        )}

        {/* 신규 섹션: 설명 (description) 입력 — 모든 신규 섹션 공용 */}
        {isNewSection && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="섹션 설명 (줄바꿈 보존)"
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
                  setDestinations([...destinations, { _uid: genUid(), name: "", image: "" }])
                }
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + 추가
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2">드래그하여 순서를 변경할 수 있습니다</p>
            <DndContext
              sensors={dndSensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldIdx = destinations.findIndex((d) => d._uid === active.id);
                  const newIdx = destinations.findIndex((d) => d._uid === over.id);
                  if (oldIdx >= 0 && newIdx >= 0) {
                    setDestinations(arrayMove(destinations, oldIdx, newIdx));
                  }
                }
              }}
            >
              <SortableContext
                items={destinations.map((d) => d._uid)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {destinations.map((dest, idx) => (
                    <SortableDestinationRow key={dest._uid} id={dest._uid}>
                      {({ dragHandleProps }) => (
                <div
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <button
                    type="button"
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 self-center"
                    title="드래그하여 순서 변경"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
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
                      )}
                    </SortableDestinationRow>
                  ))}
                  {destinations.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">
                      여행지를 추가해주세요
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
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

        {/* 신규 섹션: 타입별 데이터 편집기 */}
        {isNewSection && (
          <div className="space-y-4">
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                콘텐츠
              </h4>
              {sectionType === "full_bleed_hero" && (
                <FullBleedHeroEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "gradient_banner" && (
                <p className="text-xs text-gray-400">
                  헤딩(타이틀, eyebrow, 설명)과 스타일만 설정하면 됩니다.
                </p>
              )}
              {sectionType === "story_split" && (
                <StorySplitEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "stat_highlights" && (
                <StatHighlightsEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "feature_cards" && (
                <FeatureCardsEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "testimonial_slider" && (
                <TestimonialSliderEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "process_steps" && (
                <ProcessStepsEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "cta_centered" && (
                <CtaCenteredEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "image_gallery" && (
                <ImageGalleryEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "rich_text" && (
                <RichTextEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "video_hero" && (
                <VideoHeroEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "logo_wall" && (
                <LogoWallEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "faq_accordion" && (
                <FaqAccordionEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "price_table" && (
                <PriceTableEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "timeline" && (
                <TimelineEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "comparison_table" && (
                <ComparisonTableEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "icon_callouts" && (
                <IconCalloutsEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "quote_block" && (
                <QuoteBlockEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "awards_badges" && (
                <AwardsBadgesEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "feature_alternating" && (
                <FeatureAlternatingEditor config={newConfig} onChange={setNewConfig} />
              )}
              {/* 신규 상품 섹션 (21~30) */}
              {sectionType === "product_masonry" && (
                <ProductMasonryEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_magazine" && (
                <p className="text-xs text-gray-400">
                  헤딩(타이틀, eyebrow, 설명)과 상품 5개를 선택하세요. 첫 상품이 큰 메인으로 표시됩니다.
                </p>
              )}
              {sectionType === "product_spotlight" && (
                <ProductSpotlightEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_split_carousel" && (
                <ProductSplitCarouselEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_compact_list" && (
                <ProductCompactListEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_hero_banner" && (
                <ProductHeroBannerEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_tabs_country" && (
                <ProductTabsCountryEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_deal_grid" && (
                <ProductDealGridEditor config={newConfig} onChange={setNewConfig} />
              )}
              {sectionType === "product_polaroid_carousel" && (
                <p className="text-xs text-gray-400">
                  헤딩(타이틀, eyebrow, 설명)과 상품을 선택하세요. 별도 옵션은 없습니다.
                </p>
              )}
              {sectionType === "product_overlap_grid" && (
                <ProductOverlapGridEditor config={newConfig} onChange={setNewConfig} />
              )}
            </div>
          </div>
        )}

        {/* 공용 스타일 편집기 — 모든 섹션 타입에 노출 (배경/풀와이드/패딩/폰트/정렬/엣지페이드) */}
        <StyleConfigEditor value={styleConfig} onChange={setStyleConfig} />

        {/* 상품 연결이 필요한 섹션 */}
        {needsProducts && (
          <ProductSelector
            curationId={curation.id}
            maxItems={
              sectionType === "featured_grid" ? 6 :
              sectionType === "banner_hero" ? 4 :
              sectionType === "product_spotlight" ? 1 :
              sectionType === "product_hero_banner" ? 1 :
              sectionType === "product_magazine" ? 5 :
              undefined
            }
            onProductsChange={(products) => onLocalUpdate({ products })}
            onIdsChange={(ids) => {
              setProductIds(ids);
              setProductIdsDirty(true);
            }}
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
