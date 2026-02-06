// Prisma 스키마 기반 TypeScript 타입 정의

// ============================================
// 이미지 타입
// ============================================
export type ImageType = "THUMBNAIL" | "DETAIL" | "GOLF_COURSE" | "HOTEL" | "FOOD";

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  type: ImageType;
  sortOrder: number;
  isThumbnail: boolean;
  createdAt: string;
}

// ============================================
// 카테고리 (계층형)
// ============================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  level: number; // 0=대분류, 1=중분류, 2=소분류
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 태그
// ============================================
export type TagType = "FEATURE" | "DURATION" | "PRICE_RANGE" | "ACCOMMODATION";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: TagType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 일정
// ============================================
export interface ItineraryActivity {
  time: string;
  activity: string;
}

export interface Itinerary {
  id: string;
  productId: string;
  day: number;
  title: string;
  description: string | null;
  activities: ItineraryActivity[];
  meals: string | null;
  accommodation: string | null;
  golfCourse: string | null;
  golfHoles: number | null;
  transport: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 가격 옵션
// ============================================
export type PriceType = "PER_PERSON" | "PER_ROOM" | "ADDITIONAL";
export type Season = "PEAK" | "REGULAR" | "OFF";

export interface PriceOption {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: PriceType;
  season: string | null;
  validFrom: string | null;
  validTo: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 리뷰
// ============================================
export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  travelDate: string | null;
  isVerified: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 골프 코스 (JSON 필드)
// ============================================
export interface GolfCourse {
  name: string;
  holes: number;
  par?: number;
}

// ============================================
// 출발 일정 (JSON 필드)
// ============================================
export interface ScheduleDate {
  date: string;
  status: "available" | "few_left" | "sold_out";
  note?: string;
}

// ============================================
// 난이도
// ============================================
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";

// ============================================
// 상품 (TourProduct)
// ============================================
export interface TourProduct {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;

  categoryId: string;
  category: Category;

  destination: string;
  departure: string | null;
  airline: string | null;
  nights: number | null;
  days: number | null;
  durationText: string | null;

  golfCourses: GolfCourse[] | null;
  totalHoles: number | null;
  difficulty: Difficulty | null;

  minPeople: number | null;
  maxPeople: number | null;

  basePrice: number | null;
  originalPrice: number | null;

  content: string | null;
  contentHtml: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;

  scheduleDates: ScheduleDate[] | null;

  metaTitle: string | null;
  metaDescription: string | null;

  publishedAt: string | null;
  naverUrl: string | null;
  viewCount: number;
  bookingCount: number;

  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt: string;

  // Relations
  images: ProductImage[];
  tags: { tag: Tag }[];
  tagList?: Tag[];
  itineraries: Itinerary[];
  priceOptions: PriceOption[];
  reviews: Review[];
}

// 목록용 간략 타입
export interface TourProductListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  departure: string | null;
  airline: string | null;
  durationText: string | null;
  basePrice: number | null;
  originalPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  category: Category;
  thumbnail: string | null;
  tagList: Tag[];
  createdAt: string;
}

// ============================================
// 예약
// ============================================
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface SelectedOption {
  optionId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  tourProductId: string;
  tourProduct?: Pick<TourProduct, "id" | "title" | "destination" | "durationText" | "basePrice"> & {
    thumbnail?: string | null;
  };
  name: string;
  phone: string;
  email: string | null;
  peopleCount: number;
  desiredDate: string | null;
  selectedOptions: SelectedOption[];
  totalPrice: number | null;
  requests: string | null;
  status: BookingStatus;
  adminMemo: string | null;
  paymentStatus: PaymentStatus | null;
  paidAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 레거시 호환 타입
// ============================================
export type Destination = "일본" | "동남아" | "대만" | "국내" | "중국" | "미주" | "기타";

export interface DestinationCategory {
  key: Destination;
  label: string;
  count: number;
}
