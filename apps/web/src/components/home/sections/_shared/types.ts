/**
 * 모든 신규 섹션이 공유하는 스타일 시스템 타입.
 * `Curation.displayConfig.style` 객체에 저장된다.
 */
export interface SectionStyleConfig {
  /** 배경 처리 */
  background?: {
    type: "transparent" | "color" | "gradient" | "image";
    /** type=color */
    color?: string;
    /** type=gradient */
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: "to-r" | "to-br" | "to-b" | "to-bl";
    /** type=image */
    imageUrl?: string;
    /** 0~1 검정 오버레이 강도 */
    imageOverlay?: number;
  };
  /** 좌우 풀블리드 (max-width 해제 + px-0) */
  fullWidth?: boolean;
  /** 수직 패딩 프리셋 */
  verticalPadding?: "sm" | "md" | "lg" | "xl";
  /** 본문 색상 테마 (배경이 어두우면 light) */
  textTheme?: "light" | "dark";
  /** 본문 정렬 */
  textAlign?: "left" | "center" | "right";
  /** 좌우 가장자리 페이드 마스크 */
  edgeFade?: boolean;
  /** 헤딩 폰트 크기 */
  fontSize?: {
    eyebrow?: "xs" | "sm" | "base";
    title?: "sm" | "md" | "lg" | "xl" | "2xl";
    description?: "sm" | "base" | "lg";
  };
}

// ============================================================================
// 섹션별 displayConfig 타입 정의
// ============================================================================

export interface CtaButtonItem {
  label: string;
  url: string;
  style?: "primary" | "outline";
}

export interface FullBleedHeroConfig {
  style?: SectionStyleConfig;
  ctaButtons?: CtaButtonItem[];
  /** 60 / 80 / 100 */
  heightPreset?: "60vh" | "80vh" | "100vh";
}

export interface GradientBannerConfig {
  style?: SectionStyleConfig;
}

export interface StorySplitConfig {
  style?: SectionStyleConfig;
  imagePosition?: "left" | "right";
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface StatItem {
  value: string;
  unit?: string;
  label: string;
  description?: string;
}

export interface StatHighlightsConfig {
  style?: SectionStyleConfig;
  stats?: StatItem[];
  columns?: 2 | 3 | 4;
}

export interface FeatureCardItem {
  icon?: string; // lucide icon name
  title: string;
  description?: string;
  linkUrl?: string;
}

export interface FeatureCardsConfig {
  style?: SectionStyleConfig;
  cards?: FeatureCardItem[];
  columns?: 2 | 3 | 4;
  cardBackground?: {
    type: "transparent" | "color" | "gradient";
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: "to-r" | "to-br" | "to-b" | "to-bl";
  };
}

export interface TestimonialItem {
  rating: number; // 1~5
  quote: string;
  name: string;
  affiliation?: string;
  avatarUrl?: string;
}

export interface TestimonialSliderConfig {
  style?: SectionStyleConfig;
  testimonials?: TestimonialItem[];
}

export interface ProcessStepItem {
  title: string;
  description?: string;
  icon?: string;
}

export interface ProcessStepsConfig {
  style?: SectionStyleConfig;
  steps?: ProcessStepItem[];
}

export interface CtaCenteredConfig {
  style?: SectionStyleConfig;
  buttons?: CtaButtonItem[];
}

export interface ImageGalleryItem {
  url: string;
  caption?: string;
}

export interface ImageGalleryConfig {
  style?: SectionStyleConfig;
  images?: ImageGalleryItem[];
  columns?: 2 | 3 | 4;
}

export interface RichTextConfig {
  style?: SectionStyleConfig;
  body?: string;
  maxWidth?: "narrow" | "normal" | "wide";
}

// ============================================================================
// 추가 신규 섹션 (11~20)
// ============================================================================

export interface VideoHeroConfig {
  style?: SectionStyleConfig;
  videoUrl?: string;
  posterUrl?: string;
  /** 0~1 검정 오버레이 강도 */
  overlay?: number;
  heightPreset?: "60vh" | "80vh" | "100vh";
  ctaButtons?: CtaButtonItem[];
}

export interface LogoWallItem {
  imageUrl: string;
  name: string;
  linkUrl?: string;
}

export interface LogoWallConfig {
  style?: SectionStyleConfig;
  logos?: LogoWallItem[];
  columns?: 3 | 4 | 5 | 6;
  grayscale?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionConfig {
  style?: SectionStyleConfig;
  items?: FaqItem[];
  /** 처음에 펼쳐둘 인덱스 */
  defaultOpenIndex?: number;
}

export interface PricePlanItem {
  name: string;
  price: string;
  priceUnit?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  highlighted?: boolean;
}

export interface PriceTableConfig {
  style?: SectionStyleConfig;
  plans?: PricePlanItem[];
  columns?: 2 | 3 | 4;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description?: string;
}

export interface TimelineConfig {
  style?: SectionStyleConfig;
  events?: TimelineEvent[];
  /** 세로선 색상 (기본 #d2d2d7) */
  lineColor?: string;
}

export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface ComparisonTableConfig {
  style?: SectionStyleConfig;
  /** 첫 번째는 보통 빈 문자열 또는 "구분" */
  headers?: string[];
  rows?: ComparisonRow[];
  /** 0=라벨 컬럼, 1+ = 값 컬럼 (1부터 강조) */
  highlightCol?: number;
}

export interface IconCalloutItem {
  /** lucide icon name */
  icon: string;
  title: string;
  description?: string;
}

export interface IconCalloutsConfig {
  style?: SectionStyleConfig;
  items?: IconCalloutItem[];
  columns?: 3 | 4 | 5 | 6;
}

export interface QuoteBlockConfig {
  style?: SectionStyleConfig;
  quote?: string;
  author?: string;
  role?: string;
  avatarUrl?: string;
}

export interface AwardBadgeItem {
  imageUrl: string;
  name: string;
  year?: string;
}

export interface AwardsBadgesConfig {
  style?: SectionStyleConfig;
  badges?: AwardBadgeItem[];
  columns?: 3 | 4 | 5 | 6;
}

export interface FeatureAlternatingBlock {
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface FeatureAlternatingConfig {
  style?: SectionStyleConfig;
  blocks?: FeatureAlternatingBlock[];
  /** 첫 블록의 이미지 위치 */
  startSide?: "left" | "right";
}

// ============================================================================
// 추가 신규 상품 섹션 (21~30)
// ============================================================================

export interface ProductMasonryConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3 | 4;
}

export interface ProductMagazineConfig {
  style?: SectionStyleConfig;
}

export interface ProductSpotlightConfig {
  style?: SectionStyleConfig;
  heightPreset?: "60vh" | "80vh" | "100vh";
  /** 0~1 검정 오버레이 강도 */
  overlay?: number;
  ctaLabel?: string;
}

export interface ProductSplitCarouselConfig {
  style?: SectionStyleConfig;
  ctaLabel?: string;
}

export interface ProductCompactListConfig {
  style?: SectionStyleConfig;
  columns?: 1 | 2;
}

export interface ProductHeroBannerConfig {
  style?: SectionStyleConfig;
  imagePosition?: "left" | "right";
  ctaLabel?: string;
}

export interface ProductTabsCountryConfig {
  style?: SectionStyleConfig;
  /** 첫 탭이 "전체"이면 모든 상품 표시. 그 외 탭은 destination에 매칭되는 상품만 */
  tabs?: string[];
  columns?: 2 | 3 | 4;
}

export interface ProductDealGridConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3 | 4;
}

export interface ProductPolaroidCarouselConfig {
  style?: SectionStyleConfig;
}

export interface ProductOverlapGridConfig {
  style?: SectionStyleConfig;
  columns?: 3 | 4;
}

// ============================================================================
// 신규 상품 섹션 (31~40) — 여행/골프 CSS 차별화
// ============================================================================

/** 여권 스탬프 — 크래프트 베이지 + 스탬프 오버레이 + 세리프 */
export interface ProductPassportConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3 | 4;
}

/** 항공권 티켓 — 좌우 원형 홈 + 점선 절취선 */
export interface ProductTicketConfig {
  style?: SectionStyleConfig;
}

/** 빈티지 여행 포스터 — 1960s 느낌 크림색 + sepia */
export interface ProductVintagePosterConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3;
}

/** 골프 그린 럭셔리 — 딥 그린 + 골드 포인트 */
export interface ProductGreenLuxuryConfig {
  style?: SectionStyleConfig;
}

/** 선셋 — 오렌지/핑크/퍼플 그라디언트 */
export interface ProductSunsetConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3 | 4;
}

/** 수채화 소프트 — 파스텔 블롭 + 블러 */
export interface ProductWatercolorConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3 | 4;
}

/** 엽서 — 우표 영역 + 손글씨 + 회전 */
export interface ProductPostcardConfig {
  style?: SectionStyleConfig;
}

/** 럭셔리 블랙 — 검정 + 골드 라인 */
export interface ProductLuxuryBlackConfig {
  style?: SectionStyleConfig;
}

/** 시네마 파노라마 — letterbox + 가로 스크롤 */
export interface ProductCinematicConfig {
  style?: SectionStyleConfig;
  aspectRatio?: "16:9" | "21:9";
}

/** 여행 일지 — 크래프트 페이퍼 + 테이프 + DAY 라벨 */
export interface ProductJournalConfig {
  style?: SectionStyleConfig;
  columns?: 2 | 3;
  /** 시작 DAY 번호 (기본 1) */
  startDay?: number;
}

// ============================================================================
// 헬퍼 - 텍스트 줄바꿈 처리
// ============================================================================

/** 리터럴 \n과 실제 개행 모두 줄바꿈으로 변환 */
export function splitLines(text: string): string[] {
  return text.replace(/\\n/g, "\n").split("\n");
}
