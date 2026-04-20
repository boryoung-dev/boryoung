"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2, EyeOff } from "lucide-react";
import { useApiQuery } from "@/hooks/useApi";
import { GlobePlaceholder } from "./preview/GlobePlaceholder";
import { FeaturedGridPreview } from "./preview/FeaturedGridPreview";
import { ProductCarouselPreview } from "./preview/ProductCarouselPreview";
import { ProductShowcasePreview } from "./preview/ProductShowcasePreview";
import { DestinationsCarouselPreview } from "./preview/DestinationsCarouselPreview";
import { BannerHeroPreview } from "./preview/BannerHeroPreview";
import { TrustCtaPreview } from "./preview/TrustCtaPreview";
import { FullBleedHeroPreview } from "./preview/FullBleedHeroPreview";
import { GradientBannerPreview } from "./preview/GradientBannerPreview";
import { StorySplitPreview } from "./preview/StorySplitPreview";
import { StatHighlightsPreview } from "./preview/StatHighlightsPreview";
import { FeatureCardsPreview } from "./preview/FeatureCardsPreview";
import { TestimonialSliderPreview } from "./preview/TestimonialSliderPreview";
import { ProcessStepsPreview } from "./preview/ProcessStepsPreview";
import { CtaCenteredPreview } from "./preview/CtaCenteredPreview";
import { ImageGalleryPreview } from "./preview/ImageGalleryPreview";
import { RichTextPreview } from "./preview/RichTextPreview";
import { VideoHeroPreview } from "./preview/VideoHeroPreview";
import { LogoWallPreview } from "./preview/LogoWallPreview";
import { FaqAccordionPreview } from "./preview/FaqAccordionPreview";
import { PriceTablePreview } from "./preview/PriceTablePreview";
import { TimelinePreview } from "./preview/TimelinePreview";
import { ComparisonTablePreview } from "./preview/ComparisonTablePreview";
import { IconCalloutsPreview } from "./preview/IconCalloutsPreview";
import { QuoteBlockPreview } from "./preview/QuoteBlockPreview";
import { AwardsBadgesPreview } from "./preview/AwardsBadgesPreview";
import { FeatureAlternatingPreview } from "./preview/FeatureAlternatingPreview";
// 신규 상품 섹션 미리보기 (21~30)
import { ProductMasonryPreview } from "./preview/ProductMasonryPreview";
import { ProductMagazinePreview } from "./preview/ProductMagazinePreview";
import { ProductSpotlightPreview } from "./preview/ProductSpotlightPreview";
import { ProductSplitCarouselPreview } from "./preview/ProductSplitCarouselPreview";
import { ProductCompactListPreview } from "./preview/ProductCompactListPreview";
import { ProductHeroBannerPreview } from "./preview/ProductHeroBannerPreview";
import { ProductTabsCountryPreview } from "./preview/ProductTabsCountryPreview";
import { ProductDealGridPreview } from "./preview/ProductDealGridPreview";
import { ProductPolaroidCarouselPreview } from "./preview/ProductPolaroidCarouselPreview";
import { ProductOverlapGridPreview } from "./preview/ProductOverlapGridPreview";
// 신규 상품 섹션 (31~40) — 여행/골프 CSS 차별화
import { ProductPassportPreview } from "./preview/ProductPassportPreview";
import { ProductTicketPreview } from "./preview/ProductTicketPreview";
import { ProductVintagePosterPreview } from "./preview/ProductVintagePosterPreview";
import { ProductGreenLuxuryPreview } from "./preview/ProductGreenLuxuryPreview";
import { ProductSunsetPreview } from "./preview/ProductSunsetPreview";
import { ProductWatercolorPreview } from "./preview/ProductWatercolorPreview";
import { ProductPostcardPreview } from "./preview/ProductPostcardPreview";
import { ProductLuxuryBlackPreview } from "./preview/ProductLuxuryBlackPreview";
import { ProductCinematicPreview } from "./preview/ProductCinematicPreview";
import { ProductJournalPreview } from "./preview/ProductJournalPreview";
import type { Curation } from "./HomepageEditor";

const SECTION_TYPE_LABELS: Record<string, string> = {
  featured_grid: "추천 그리드",
  product_carousel: "상품 캐러셀",
  product_showcase: "상품 쇼케이스",
  destinations_carousel: "여행지 캐러셀",
  banner_hero: "배너 히어로",
  trust_cta: "신뢰 CTA",
  full_bleed_hero: "풀스크린 히어로",
  gradient_banner: "그라디언트 배너",
  story_split: "스토리 (좌우)",
  stat_highlights: "숫자 강조",
  feature_cards: "기능 카드",
  testimonial_slider: "고객 후기",
  process_steps: "프로세스 단계",
  cta_centered: "중앙 CTA",
  image_gallery: "이미지 갤러리",
  rich_text: "리치 텍스트",
  video_hero: "비디오 히어로",
  logo_wall: "로고월",
  faq_accordion: "FAQ 아코디언",
  price_table: "가격 플랜",
  timeline: "타임라인",
  comparison_table: "비교 테이블",
  icon_callouts: "아이콘 콜아웃",
  quote_block: "인용구",
  awards_badges: "수상 배지",
  feature_alternating: "기능 좌우 교차",
  // 신규 상품 섹션
  product_masonry: "상품 메이슨리",
  product_magazine: "상품 매거진",
  product_spotlight: "상품 스포트라이트",
  product_split_carousel: "상품 좌우+캐러셀",
  product_compact_list: "상품 컴팩트 리스트",
  product_hero_banner: "상품 히어로 배너",
  product_tabs_country: "상품 국가 탭",
  product_deal_grid: "특가 그리드",
  product_polaroid_carousel: "폴라로이드 캐러셀",
  product_overlap_grid: "오버랩 그리드",
  // 신규 상품 섹션 (31~40)
  product_passport: "여권 스탬프",
  product_ticket: "항공권 티켓",
  product_vintage_poster: "빈티지 포스터",
  product_green_luxury: "그린 럭셔리",
  product_sunset: "선셋",
  product_watercolor: "수채화",
  product_postcard: "엽서",
  product_luxury_black: "럭셔리 블랙",
  product_cinematic: "시네마 파노라마",
  product_journal: "여행 일지",
};

interface SectionListProps {
  curations: Curation[];
  selectedId: string | null;
  globeSelected: boolean;
  onSelect: (curation: Curation) => void;
  onGlobeSelect: () => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  /** 지구본 섹션 타이틀 (편집된 값) — placeholder에 표시 */
  globeTitle?: string;
  /** 지구본 섹션 라벨 (편집된 값) — placeholder에 표시 */
  globeSubtitle?: string;
}

/** 미리보기 섹션 목록 (세로 스크롤) */
export function SectionList({
  curations,
  selectedId,
  globeSelected,
  onSelect,
  onGlobeSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  globeTitle,
  globeSubtitle,
}: SectionListProps) {
  // 지구본 요약용 최상위 카테고리 조회
  const { data: categoriesData } = useApiQuery<{ success: boolean; categories: any[] }>(
    ["categories", "globe-summary"],
    "/api/categories"
  );
  const topCountries: Array<{ id: string; emoji?: string | null; name: string }> =
    (categoriesData?.success ? categoriesData.categories ?? [] : [])
      .filter((c: any) => !c.parentId && c.isActive && c.showOnGlobe)
      .sort((a: any, b: any) => (a.globeSortOrder ?? 0) - (b.globeSortOrder ?? 0));

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
        <div
          className={`border-2 rounded-xl overflow-hidden transition-colors ${
            globeSelected
              ? "border-blue-500 shadow-lg shadow-blue-500/10"
              : "border-dashed border-gray-300 hover:border-blue-300 opacity-80"
          }`}
        >
          <GlobePlaceholder
            isSelected={globeSelected}
            onClick={onGlobeSelect}
            countries={topCountries}
            title={globeTitle}
            subtitle={globeSubtitle}
          />
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
    case "full_bleed_hero":
      return <FullBleedHeroPreview curation={curation} />;
    case "gradient_banner":
      return <GradientBannerPreview curation={curation} />;
    case "story_split":
      return <StorySplitPreview curation={curation} />;
    case "stat_highlights":
      return <StatHighlightsPreview curation={curation} />;
    case "feature_cards":
      return <FeatureCardsPreview curation={curation} />;
    case "testimonial_slider":
      return <TestimonialSliderPreview curation={curation} />;
    case "process_steps":
      return <ProcessStepsPreview curation={curation} />;
    case "cta_centered":
      return <CtaCenteredPreview curation={curation} />;
    case "image_gallery":
      return <ImageGalleryPreview curation={curation} />;
    case "rich_text":
      return <RichTextPreview curation={curation} />;
    case "video_hero":
      return <VideoHeroPreview curation={curation} />;
    case "logo_wall":
      return <LogoWallPreview curation={curation} />;
    case "faq_accordion":
      return <FaqAccordionPreview curation={curation} />;
    case "price_table":
      return <PriceTablePreview curation={curation} />;
    case "timeline":
      return <TimelinePreview curation={curation} />;
    case "comparison_table":
      return <ComparisonTablePreview curation={curation} />;
    case "icon_callouts":
      return <IconCalloutsPreview curation={curation} />;
    case "quote_block":
      return <QuoteBlockPreview curation={curation} />;
    case "awards_badges":
      return <AwardsBadgesPreview curation={curation} />;
    case "feature_alternating":
      return <FeatureAlternatingPreview curation={curation} />;
    // 신규 상품 섹션 (21~30)
    case "product_masonry":
      return <ProductMasonryPreview curation={curation} />;
    case "product_magazine":
      return <ProductMagazinePreview curation={curation} />;
    case "product_spotlight":
      return <ProductSpotlightPreview curation={curation} />;
    case "product_split_carousel":
      return <ProductSplitCarouselPreview curation={curation} />;
    case "product_compact_list":
      return <ProductCompactListPreview curation={curation} />;
    case "product_hero_banner":
      return <ProductHeroBannerPreview curation={curation} />;
    case "product_tabs_country":
      return <ProductTabsCountryPreview curation={curation} />;
    case "product_deal_grid":
      return <ProductDealGridPreview curation={curation} />;
    case "product_polaroid_carousel":
      return <ProductPolaroidCarouselPreview curation={curation} />;
    case "product_overlap_grid":
      return <ProductOverlapGridPreview curation={curation} />;
    // 신규 상품 섹션 (31~40)
    case "product_passport":
      return <ProductPassportPreview curation={curation} />;
    case "product_ticket":
      return <ProductTicketPreview curation={curation} />;
    case "product_vintage_poster":
      return <ProductVintagePosterPreview curation={curation} />;
    case "product_green_luxury":
      return <ProductGreenLuxuryPreview curation={curation} />;
    case "product_sunset":
      return <ProductSunsetPreview curation={curation} />;
    case "product_watercolor":
      return <ProductWatercolorPreview curation={curation} />;
    case "product_postcard":
      return <ProductPostcardPreview curation={curation} />;
    case "product_luxury_black":
      return <ProductLuxuryBlackPreview curation={curation} />;
    case "product_cinematic":
      return <ProductCinematicPreview curation={curation} />;
    case "product_journal":
      return <ProductJournalPreview curation={curation} />;
    default:
      // 타입 미지정 → 상품이 있으면 캐러셀로 표시
      return <ProductCarouselPreview curation={curation} />;
  }
}
