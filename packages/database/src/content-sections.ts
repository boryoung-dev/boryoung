/**
 * 섹션 기반 페이지 빌더 타입 정의
 * admin(편집)과 web(렌더링) 양쪽에서 공유
 */

// --- 섹션 타입 enum ---
export type SectionType =
  | "text"          // 리치 텍스트
  | "image"         // 단일 이미지
  | "imageText"     // 이미지 + 텍스트 (좌우 배치)
  | "gallery"       // 이미지 갤러리 (그리드)
  | "video"         // 유튜브/비메오 임베드
  | "quote"         // 인용구
  | "callout"       // 강조 박스 (info, warning, tip)
  | "divider"       // 구분선
  | "faq"           // FAQ 아코디언
  | "features"      // 특징 카드 그리드
  | "banner"        // 배너 (배경이미지 + 텍스트 오버레이)
  | "table"         // 표
  | "buttonGroup"   // 버튼 그룹 (CTA)
  | "spacer";       // 여백

// --- 각 섹션 데이터 타입 ---

export interface TextSection {
  type: "text";
  html: string; // TiptapEditor HTML
}

export interface ImageSection {
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
  width?: "full" | "large" | "medium"; // full=100%, large=80%, medium=60%
}

export interface ImageTextSection {
  type: "imageText";
  imageUrl: string;
  imageAlt?: string;
  html: string;
  imagePosition: "left" | "right";
  imageRatio?: "1:1" | "1:2" | "2:1"; // 이미지:텍스트 비율
}

export interface GallerySection {
  type: "gallery";
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  columns: 2 | 3 | 4;
}

export interface VideoSection {
  type: "video";
  url: string; // YouTube/Vimeo URL
  caption?: string;
}

export interface QuoteSection {
  type: "quote";
  text: string;
  author?: string;
}

export interface CalloutSection {
  type: "callout";
  variant: "info" | "warning" | "tip" | "important";
  title?: string;
  html: string;
}

export interface DividerSection {
  type: "divider";
  style?: "solid" | "dashed" | "dotted";
}

export interface FaqSection {
  type: "faq";
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface FeaturesSection {
  type: "features";
  items: Array<{
    icon?: string; // emoji 또는 아이콘명
    title: string;
    description: string;
  }>;
  columns: 2 | 3 | 4;
}

export interface BannerSection {
  type: "banner";
  backgroundUrl: string;
  title: string;
  subtitle?: string;
  overlay?: "light" | "dark" | "none";
}

export interface TableSection {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface ButtonGroupSection {
  type: "buttonGroup";
  buttons: Array<{
    label: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
  }>;
  align: "left" | "center" | "right";
}

export interface SpacerSection {
  type: "spacer";
  height: "sm" | "md" | "lg" | "xl"; // 16px, 32px, 48px, 64px
}

// --- 유니온 타입 ---
export type ContentSectionData =
  | TextSection
  | ImageSection
  | ImageTextSection
  | GallerySection
  | VideoSection
  | QuoteSection
  | CalloutSection
  | DividerSection
  | FaqSection
  | FeaturesSection
  | BannerSection
  | TableSection
  | ButtonGroupSection
  | SpacerSection;

// --- 저장용 섹션 (id + 순서 포함) ---
export interface ContentSection {
  id: string;
  sortOrder: number;
  data: ContentSectionData;
}

// --- 팔레트 아이템 정의 ---
export interface PaletteItem {
  type: SectionType;
  label: string;
  icon: string;
  description: string;
  group: "기본" | "미디어" | "레이아웃" | "고급";
}

export const SECTION_PALETTE: PaletteItem[] = [
  // 기본
  { type: "text", label: "텍스트", icon: "Type", description: "리치 텍스트 블록", group: "기본" },
  { type: "quote", label: "인용구", icon: "Quote", description: "인용문 또는 리뷰", group: "기본" },
  { type: "callout", label: "강조 박스", icon: "AlertCircle", description: "안내·주의·팁 박스", group: "기본" },
  { type: "faq", label: "FAQ", icon: "HelpCircle", description: "자주 묻는 질문", group: "기본" },

  // 미디어
  { type: "image", label: "이미지", icon: "Image", description: "단일 이미지", group: "미디어" },
  { type: "imageText", label: "이미지+텍스트", icon: "Columns", description: "이미지와 텍스트 나란히", group: "미디어" },
  { type: "gallery", label: "갤러리", icon: "Grid3x3", description: "이미지 그리드", group: "미디어" },
  { type: "video", label: "동영상", icon: "Play", description: "YouTube/Vimeo 임베드", group: "미디어" },
  { type: "banner", label: "배너", icon: "ImagePlus", description: "배경이미지 + 텍스트 오버레이", group: "미디어" },

  // 레이아웃
  { type: "divider", label: "구분선", icon: "Minus", description: "섹션 구분선", group: "레이아웃" },
  { type: "spacer", label: "여백", icon: "MoveVertical", description: "빈 여백 추가", group: "레이아웃" },
  { type: "buttonGroup", label: "버튼", icon: "MousePointerClick", description: "CTA 버튼 그룹", group: "레이아웃" },

  // 고급
  { type: "features", label: "특징 카드", icon: "LayoutGrid", description: "아이콘+제목+설명 카드", group: "고급" },
  { type: "table", label: "표", icon: "Table", description: "데이터 테이블", group: "고급" },
];

// --- 기본값 생성 헬퍼 ---
export function createDefaultSectionData(type: SectionType): ContentSectionData {
  switch (type) {
    case "text":
      return { type: "text", html: "" };
    case "image":
      return { type: "image", url: "", alt: "", caption: "", width: "full" };
    case "imageText":
      return { type: "imageText", imageUrl: "", imageAlt: "", html: "", imagePosition: "left", imageRatio: "1:1" };
    case "gallery":
      return { type: "gallery", images: [], columns: 3 };
    case "video":
      return { type: "video", url: "", caption: "" };
    case "quote":
      return { type: "quote", text: "", author: "" };
    case "callout":
      return { type: "callout", variant: "info", title: "", html: "" };
    case "divider":
      return { type: "divider", style: "solid" };
    case "faq":
      return { type: "faq", items: [{ question: "", answer: "" }] };
    case "features":
      return { type: "features", items: [{ icon: "✨", title: "", description: "" }], columns: 3 };
    case "banner":
      return { type: "banner", backgroundUrl: "", title: "", subtitle: "", overlay: "dark" };
    case "table":
      return { type: "table", headers: ["항목", "내용"], rows: [["", ""]] };
    case "buttonGroup":
      return { type: "buttonGroup", buttons: [{ label: "버튼", url: "", variant: "primary" }], align: "center" };
    case "spacer":
      return { type: "spacer", height: "md" };
  }
}
