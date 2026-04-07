/**
 * 웹 클라이언트에서 사용하는 공통 타입 정의
 * DB 모델 기반이지만 클라이언트에서 필요한 필드만 포함
 */

import type { LucideIcon } from "lucide-react";
import type { JsonValue } from "@prisma/client/runtime/library";

// 상품 이미지
export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  type: string;
  sortOrder: number;
}

// 가격 옵션
export interface PriceOption {
  id: string;
  name: string;
  price: number;
  priceType: string;
  season?: string | null;
}

// 일정 활동 항목
export interface ItineraryActivity {
  time?: string;
  activity: string;
}

// 일정
export interface Itinerary {
  id: string;
  day: number;
  title?: string | null;
  description?: string | null;
  activities?: JsonValue;
  meals?: string | null;
  accommodation?: string | null;
  golfCourse?: string | null;
  golfHoles?: number | null;
  transport?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | JsonValue; // 여러 이미지 URL 배열 (DB에서 JsonValue로 반환)
}

// 리뷰
export interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  content: string;
  travelDate?: string | Date | null;
  isVerified: boolean;
  isPublished: boolean;
}

// 태그
export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: string;
}

// 출발일정
export interface ScheduleDate {
  date: string;
  status: "available" | "few_left" | "sold_out";
}

// 카테고리
export interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentId?: string | null;
  children?: Category[];
}

// 여행 상품 (목록용)
export interface TourProductSummary {
  id: string;
  slug: string;
  title: string;
  destination: string;
  basePrice: number | null;
  originalPrice?: number | null;
  durationText?: string | null;
  thumbnail?: string | null | undefined;
  images: ProductImage[];
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  bookingCount: number;
  createdAt: string | Date;
  category?: Category | null;
  tagList?: Tag[];
  // 필터링용 추가 필드
  departure?: string | null;
  nights?: number | null;
  days?: number | null;
  airline?: string | null;
}

// 여행 상품 (상세용)
export interface TourProductDetail extends TourProductSummary {
  excerpt?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  contentSections?: any;
  nights?: number | null;
  days?: number | null;
  departure?: string | null;
  airline?: string | null;
  difficulty?: string | null;
  minPeople?: number | null;
  maxPeople?: number | null;
  inclusions: JsonValue;
  exclusions: JsonValue;
  scheduleDates?: JsonValue;
  itineraries: Itinerary[];
  priceOptions: PriceOption[];
  reviews: Review[];
}

// 하이라이트 카드
export interface HighlightCard {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}
