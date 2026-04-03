"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2, EyeOff } from "lucide-react";
import { GlobePlaceholder } from "./preview/GlobePlaceholder";
import { FeaturedGridPreview } from "./preview/FeaturedGridPreview";
import { ProductCarouselPreview } from "./preview/ProductCarouselPreview";
import { ProductShowcasePreview } from "./preview/ProductShowcasePreview";
import { DestinationsCarouselPreview } from "./preview/DestinationsCarouselPreview";
import { BannerHeroPreview } from "./preview/BannerHeroPreview";
import { TrustCtaPreview } from "./preview/TrustCtaPreview";
import type { Curation } from "./HomepageEditor";

const SECTION_TYPE_LABELS: Record<string, string> = {
  featured_grid: "추천 그리드",
  product_carousel: "상품 캐러셀",
  product_showcase: "상품 쇼케이스",
  destinations_carousel: "여행지 캐러셀",
  banner_hero: "배너 히어로",
  trust_cta: "신뢰 CTA",
};

interface SectionListProps {
  curations: Curation[];
  selectedId: string | null;
  onSelect: (curation: Curation) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

/** 미리보기 섹션 목록 (세로 스크롤) */
export function SectionList({
  curations,
  selectedId,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SectionListProps) {
  return (
    <div
      className="space-y-0"
      style={{
        ["--fg" as any]: "#1d1d1f",
        ["--muted" as any]: "#86868b",
        ["--surface" as any]: "#f5f5f7",
        ["--border" as any]: "#d2d2d7",
        ["--brand" as any]: "#0071e3",
      }}
    >
      {/* 지구본 섹션 (항상 최상단 고정) */}
      <div className="relative group">
        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden opacity-80">
          <GlobePlaceholder />
        </div>
        <div className="absolute top-2 right-2 bg-gray-800/70 text-white text-[10px] px-2 py-0.5 rounded">
          고정 섹션
        </div>
      </div>

      {/* 큐레이션 섹션 */}
      {curations.map((curation, index) => {
        const isSelected = curation.id === selectedId;
        return (
          <div
            key={curation.id}
            className={`relative group cursor-pointer transition-all ${
              !curation.isActive ? "opacity-50" : ""
            }`}
            onClick={() => onSelect(curation)}
          >
            {/* 섹션 미리보기 */}
            <div
              className={`rounded-xl overflow-hidden border-2 transition-colors ${
                isSelected
                  ? "border-blue-500 shadow-lg shadow-blue-500/10"
                  : "border-transparent hover:border-blue-300"
              }`}
            >
              <div className="bg-white">
                <SectionPreview curation={curation} />
              </div>
            </div>

            {/* Hover 오버레이 */}
            <div
              className={`absolute inset-0 rounded-xl transition-opacity ${
                isSelected
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {/* 상단 정보 바 */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/50 to-transparent rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-white text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                    {SECTION_TYPE_LABELS[curation.sectionType || ""] ||
                      "일반"}
                  </span>
                  {!curation.isActive && (
                    <span className="flex items-center gap-0.5 text-white/70 text-[10px]">
                      <EyeOff className="w-3 h-3" /> 비활성
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* 순서 변경 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(curation.id);
                    }}
                    disabled={index === 0}
                    className="p-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded disabled:opacity-30 backdrop-blur-sm"
                    title="위로"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(curation.id);
                    }}
                    disabled={index === curations.length - 1}
                    className="p-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded disabled:opacity-30 backdrop-blur-sm"
                    title="아래로"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {/* 편집 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(curation);
                    }}
                    className="p-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded backdrop-blur-sm"
                    title="편집"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {/* 삭제 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(curation.id);
                    }}
                    className="p-1 text-red-300 hover:text-red-200 bg-white/10 hover:bg-red-500/30 rounded backdrop-blur-sm"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 섹션 타입에 따라 적절한 미리보기 렌더링 */
function SectionPreview({ curation }: { curation: Curation }) {
  switch (curation.sectionType) {
    case "featured_grid":
      return <FeaturedGridPreview curation={curation} />;
    case "product_carousel":
      return <ProductCarouselPreview curation={curation} />;
    case "product_showcase":
      return <ProductShowcasePreview curation={curation} />;
    case "destinations_carousel":
      return <DestinationsCarouselPreview curation={curation} />;
    case "banner_hero":
      return <BannerHeroPreview curation={curation} />;
    case "trust_cta":
      return <TrustCtaPreview curation={curation} />;
    default:
      // 타입 미지정 → 상품이 있으면 캐러셀로 표시
      return <ProductCarouselPreview curation={curation} />;
  }
}
