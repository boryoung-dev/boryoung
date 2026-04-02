import * as XLSX from "xlsx";

// ============================================
// 타입 정의
// ============================================

export interface ParsedProduct {
  title: string;
  subtitle?: string;
  categorySlug: string;
  destination: string;
  departure?: string;
  airline?: string;
  nights?: number;
  days?: number;
  durationText?: string;
  golfCourses?: { name: string; holes: number; par: number }[];
  totalHoles?: number;
  difficulty?: string;
  minPeople?: number;
  maxPeople?: number;
  basePrice?: number;
  originalPrice?: number;
  inclusions?: string[];
  exclusions?: string[];
  tagSlugs?: string[];
  thumbnailImage?: string;
  detailImages?: string[];
  golfCourseImages?: string[];
  hotelImages?: string[];
  scheduleDates?: { date: string; status: string }[];
  isFeatured?: boolean;
  naverUrl?: string;
  itineraries: ParsedItinerary[];
  priceOptions: ParsedPriceOption[];
  content?: string;
}

export interface ParsedItinerary {
  day: number;
  title: string;
  description?: string;
  meals?: string;
  accommodation?: string;
  golfCourse?: string;
  golfHoles?: number;
  transport?: string;
}

export interface ParsedPriceOption {
  name: string;
  description?: string;
  price: number;
  priceType: string;
  season?: string;
  validFrom?: string;
  validTo?: string;
  isDefault?: boolean;
}

export interface ParseError {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

export interface ParseResult {
  products: ParsedProduct[];
  errors: ParseError[];
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * "한글(DB값)" 패턴에서 괄호 안 DB값을 추출
 * 예: "베트남(vietnam)" → "vietnam"
 * 예: "초급(BEGINNER)" → "BEGINNER"
 * 괄호가 없으면 원본 그대로 반환
 */
export function extractDbValue(cellValue: string): string {
  if (!cellValue) return "";
  const str = String(cellValue).trim();
  const match = str.match(/\(([^)]+)\)\s*$/);
  return match ? match[1] : str;
}

export { slugify } from "@/lib/slugify";

/** 셀 값을 문자열로 안전하게 변환 */
function cellToString(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

/** 셀 값을 정수로 변환 */
function cellToInt(val: unknown): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : Math.round(n);
}

/** 쉼표 구분 문자열을 배열로 변환 */
function splitComma(val: unknown): string[] {
  const str = cellToString(val);
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Y/N 값을 boolean으로 변환 */
function cellToBoolean(val: unknown): boolean | undefined {
  const str = cellToString(val).toUpperCase();
  if (str === "Y") return true;
  if (str === "N") return false;
  return undefined;
}

/** 날짜 셀을 YYYY-MM-DD 문자열로 변환 */
function cellToDateString(val: unknown): string | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  // 엑셀 날짜 객체인 경우
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  // 숫자인 경우 (엑셀 시리얼 날짜)
  if (typeof val === "number") {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  // 문자열인 경우
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return str || undefined;
}

// ============================================
// 시트별 파싱 함수
// ============================================

/** 시트를 JSON 배열로 변환 (헤더는 3행, 데이터는 4행부터) */
function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  // range에서 시작 행을 2(0-indexed, 즉 3행)로 설정
  const json = XLSX.utils.sheet_to_json(sheet, { range: 2, defval: "" });
  return json as Record<string, unknown>[];
}

/** 헤더에서 ★ 마크를 제거하여 정규화 */
function normalizeHeader(header: string): string {
  return header.replace(/^★\s*/, "").trim();
}

/** 시트의 실제 헤더를 정규화된 맵으로 반환 */
function getHeaderMap(sheet: XLSX.WorkSheet): Record<string, string> {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const headerRow = 2; // 0-indexed (3행)
  const map: Record<string, string> = {};

  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = sheet[addr];
    if (cell && cell.v !== undefined) {
      const original = String(cell.v);
      const normalized = normalizeHeader(original);
      map[original] = normalized;
    }
  }
  return map;
}

/** "상품 기본정보" 시트 파싱 */
function parseBasicInfoSheet(
  wb: XLSX.WorkBook,
  errors: ParseError[]
): Map<string, Partial<ParsedProduct>> {
  const sheetName = "상품 기본정보";
  const sheet = wb.Sheets[sheetName];
  const productMap = new Map<string, Partial<ParsedProduct>>();

  if (!sheet) {
    errors.push({ sheet: sheetName, row: 0, column: "", message: "시트를 찾을 수 없습니다" });
    return productMap;
  }

  const rows = sheetToRows(sheet);

  rows.forEach((row, idx) => {
    const rowNum = idx + 4; // 4행부터 데이터
    // ★ 마크가 있는 헤더와 없는 헤더 모두 대응
    const get = (name: string): unknown => {
      return row[name] ?? row[`★ ${name}`] ?? "";
    };

    const title = cellToString(get("상품명"));
    if (!title) return; // 빈 행 스킵

    const categoryRaw = cellToString(get("카테고리"));
    const categorySlug = extractDbValue(categoryRaw);
    const destination = cellToString(get("목적지"));

    // 필수값 검증
    if (!categorySlug) {
      errors.push({ sheet: sheetName, row: rowNum, column: "카테고리", message: "카테고리를 선택해주세요" });
    }
    if (!destination) {
      errors.push({ sheet: sheetName, row: rowNum, column: "목적지", message: "목적지를 입력해주세요" });
    }

    const nights = cellToInt(get("숙박(박)"));
    const days = cellToInt(get("여행(일)"));
    if (nights === undefined) {
      errors.push({ sheet: sheetName, row: rowNum, column: "숙박(박)", message: "숙박 일수를 입력해주세요" });
    }
    if (days === undefined) {
      errors.push({ sheet: sheetName, row: rowNum, column: "여행(일)", message: "여행 일수를 입력해주세요" });
    }

    const basePrice = cellToInt(get("판매가(원)"));
    if (basePrice === undefined) {
      errors.push({ sheet: sheetName, row: rowNum, column: "판매가(원)", message: "판매가를 입력해주세요" });
    }

    // 골프코스 파싱
    const golfCourseNames = splitComma(get("골프코스명"));
    const golfCourses = golfCourseNames.length > 0
      ? golfCourseNames.map((name) => ({ name, holes: 18, par: 72 }))
      : undefined;

    // 난이도
    const difficultyRaw = cellToString(get("난이도"));
    const difficulty = difficultyRaw ? extractDbValue(difficultyRaw) : undefined;

    // 포함/불포함 사항
    const inclusions = splitComma(get("포함사항"));
    const exclusions = splitComma(get("불포함사항"));

    // 태그
    const tagsRaw = splitComma(get("태그"));
    const tagSlugs = tagsRaw.map((t) => extractDbValue(t));

    // 이미지
    const thumbnailImage = cellToString(get("대표이미지"));
    if (!thumbnailImage) {
      errors.push({ sheet: sheetName, row: rowNum, column: "대표이미지", message: "대표이미지 파일명을 입력해주세요" });
    }
    const detailImages = splitComma(get("상세이미지"));
    const golfCourseImages = splitComma(get("골프장이미지"));
    const hotelImages = splitComma(get("호텔이미지"));

    // 출발일정
    const scheduleDatesRaw = splitComma(get("출발일정"));
    const scheduleDates = scheduleDatesRaw.length > 0
      ? scheduleDatesRaw.map((d) => ({ date: d, status: "available" }))
      : undefined;

    // 기간 텍스트 자동생성
    let durationText = cellToString(get("기간텍스트"));
    if (!durationText && nights !== undefined && days !== undefined) {
      durationText = `${nights}박${days}일`;
    }

    productMap.set(title, {
      title,
      subtitle: cellToString(get("부제목")) || undefined,
      categorySlug,
      destination,
      departure: cellToString(get("출발지")) || undefined,
      airline: cellToString(get("항공사")) || undefined,
      nights,
      days,
      durationText,
      golfCourses,
      totalHoles: cellToInt(get("총 홀수")),
      difficulty,
      minPeople: cellToInt(get("최소인원")),
      maxPeople: cellToInt(get("최대인원")),
      basePrice,
      originalPrice: cellToInt(get("정가(원)")),
      inclusions: inclusions.length > 0 ? inclusions : undefined,
      exclusions: exclusions.length > 0 ? exclusions : undefined,
      tagSlugs: tagSlugs.length > 0 ? tagSlugs : undefined,
      thumbnailImage,
      detailImages: detailImages.length > 0 ? detailImages : undefined,
      golfCourseImages: golfCourseImages.length > 0 ? golfCourseImages : undefined,
      hotelImages: hotelImages.length > 0 ? hotelImages : undefined,
      scheduleDates,
      isFeatured: cellToBoolean(get("추천상품")),
      naverUrl: cellToString(get("네이버 URL")) || undefined,
      itineraries: [],
      priceOptions: [],
    });
  });

  return productMap;
}

/** "일별 일정" 시트 파싱 */
function parseItinerarySheet(
  wb: XLSX.WorkBook,
  productMap: Map<string, Partial<ParsedProduct>>,
  errors: ParseError[]
): void {
  const sheetName = "일별 일정";
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return; // 선택 시트

  const rows = sheetToRows(sheet);

  rows.forEach((row, idx) => {
    const rowNum = idx + 4;
    const get = (name: string): unknown => row[name] ?? row[`★ ${name}`] ?? "";

    const productTitle = cellToString(get("상품명"));
    if (!productTitle) return;

    const product = productMap.get(productTitle);
    if (!product) {
      errors.push({ sheet: sheetName, row: rowNum, column: "상품명", message: `"${productTitle}" 상품을 '상품 기본정보' 시트에서 찾을 수 없습니다` });
      return;
    }

    const day = cellToInt(get("일차"));
    const title = cellToString(get("일정 제목"));

    if (day === undefined) {
      errors.push({ sheet: sheetName, row: rowNum, column: "일차", message: "일차를 입력해주세요" });
      return;
    }
    if (!title) {
      errors.push({ sheet: sheetName, row: rowNum, column: "일정 제목", message: "일정 제목을 입력해주세요" });
      return;
    }

    product.itineraries!.push({
      day,
      title,
      description: cellToString(get("일정 상세")) || undefined,
      meals: cellToString(get("식사")) || undefined,
      accommodation: cellToString(get("숙소")) || undefined,
      golfCourse: cellToString(get("골프코스")) || undefined,
      golfHoles: cellToInt(get("라운딩 홀수")),
      transport: cellToString(get("이동수단")) || undefined,
    });
  });
}

/** "가격 옵션" 시트 파싱 */
function parsePriceOptionSheet(
  wb: XLSX.WorkBook,
  productMap: Map<string, Partial<ParsedProduct>>,
  errors: ParseError[]
): void {
  const sheetName = "가격 옵션";
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return;

  const rows = sheetToRows(sheet);

  rows.forEach((row, idx) => {
    const rowNum = idx + 4;
    const get = (name: string): unknown => row[name] ?? row[`★ ${name}`] ?? "";

    const productTitle = cellToString(get("상품명"));
    if (!productTitle) return;

    const product = productMap.get(productTitle);
    if (!product) {
      errors.push({ sheet: sheetName, row: rowNum, column: "상품명", message: `"${productTitle}" 상품을 '상품 기본정보' 시트에서 찾을 수 없습니다` });
      return;
    }

    const name = cellToString(get("옵션명"));
    const price = cellToInt(get("가격(원)"));
    const priceTypeRaw = cellToString(get("가격유형"));
    const priceType = extractDbValue(priceTypeRaw);

    if (!name) {
      errors.push({ sheet: sheetName, row: rowNum, column: "옵션명", message: "옵션명을 입력해주세요" });
      return;
    }
    if (price === undefined) {
      errors.push({ sheet: sheetName, row: rowNum, column: "가격(원)", message: "가격을 입력해주세요" });
      return;
    }
    if (!priceType) {
      errors.push({ sheet: sheetName, row: rowNum, column: "가격유형", message: "가격유형을 선택해주세요" });
      return;
    }

    const seasonRaw = cellToString(get("시즌"));
    const season = seasonRaw ? extractDbValue(seasonRaw) : undefined;

    product.priceOptions!.push({
      name,
      description: cellToString(get("옵션 설명")) || undefined,
      price,
      priceType,
      season,
      validFrom: cellToDateString(get("적용시작일")),
      validTo: cellToDateString(get("적용종료일")),
      isDefault: cellToBoolean(get("기본옵션")),
    });
  });
}

/** "상품 상세설명" 시트 파싱 */
function parseDescriptionSheet(
  wb: XLSX.WorkBook,
  productMap: Map<string, Partial<ParsedProduct>>,
  errors: ParseError[]
): void {
  const sheetName = "상품 상세설명";
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return;

  const rows = sheetToRows(sheet);

  rows.forEach((row, idx) => {
    const rowNum = idx + 4;
    const get = (name: string): unknown => row[name] ?? row[`★ ${name}`] ?? "";

    const productTitle = cellToString(get("상품명"));
    if (!productTitle) return;

    const product = productMap.get(productTitle);
    if (!product) {
      errors.push({ sheet: sheetName, row: rowNum, column: "상품명", message: `"${productTitle}" 상품을 '상품 기본정보' 시트에서 찾을 수 없습니다` });
      return;
    }

    const content = cellToString(get("상세설명"));
    if (content) {
      product.content = content;
    }
  });
}

// ============================================
// 메인 파싱 함수
// ============================================

export function parseProductExcel(buffer: Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  const errors: ParseError[] = [];

  // 1. 기본정보 파싱
  const productMap = parseBasicInfoSheet(wb, errors);

  if (productMap.size === 0) {
    errors.push({
      sheet: "상품 기본정보",
      row: 0,
      column: "",
      message: "파싱할 상품 데이터가 없습니다. 예시 데이터를 삭제하고 실제 데이터를 입력해주세요.",
    });
    return { products: [], errors };
  }

  // 2. 일별 일정 파싱
  parseItinerarySheet(wb, productMap, errors);

  // 3. 가격 옵션 파싱
  parsePriceOptionSheet(wb, productMap, errors);

  // 4. 상세설명 파싱
  parseDescriptionSheet(wb, productMap, errors);

  const products = Array.from(productMap.values()) as ParsedProduct[];
  return { products, errors };
}
