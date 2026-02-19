"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { PackageOpen, ChevronDown, Check } from "lucide-react";
import { ProductCard } from "./ProductCard";

type Product = any;
type Category = any;
type Tag = any;

type SortKey = "recommended" | "priceLow" | "priceHigh" | "newest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "추천순" },
  { key: "priceLow", label: "낮은 가격순" },
  { key: "priceHigh", label: "높은 가격순" },
  { key: "newest", label: "최신순" },
];

const PRICE_STEP = 100000;

function formatPrice(value: number): string {
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    const remainder = value % 10000;
    return remainder > 0 ? `${man}만 ${remainder.toLocaleString()}원` : `${man}만 원`;
  }
  return `${value.toLocaleString()}원`;
}

export function ToursPageClient({
  initialProducts,
  categories,
  tags,
  initialFilters,
}: {
  initialProducts: Product[];
  categories: Category[];
  tags: Tag[];
  initialFilters: {
    category?: string;
    tag?: string;
    search?: string;
  };
}) {
  const [searchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedTag] = useState(initialFilters.tag);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // 상품 데이터에서 가격 범위 동적 추출
  const priceRange = useMemo(() => {
    const prices = initialProducts
      .map((p: Product) => p.basePrice)
      .filter((p: number | null): p is number => p != null && p > 0);
    if (prices.length === 0) return { min: 0, max: 5000000 };
    const min = Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP;
    const max = Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP;
    return { min, max };
  }, [initialProducts]);

  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);

  // 상품 데이터에서 여행지 목록 동적 추출
  const destinations = useMemo(() => {
    const destSet = new Set<string>();
    initialProducts.forEach((p: Product) => {
      if (p.destination) destSet.add(p.destination);
    });
    return Array.from(destSet).sort();
  }, [initialProducts]);

  // 정렬 드롭다운 외부 클릭 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCategoryClick = (slug?: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (slug) params.set("category", slug);
    if (selectedTag) params.set("tag", selectedTag);
    window.location.href = `/tours?${params.toString()}`;
  };

  const handleResetFilters = () => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedDestinations([]);
    setSortKey("recommended");
    if (selectedCategory || searchQuery) {
      window.location.href = `/tours`;
    }
  };

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // 클라이언트 필터링 + 정렬
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 가격 필터
    if (minPrice > priceRange.min || maxPrice < priceRange.max) {
      result = result.filter(
        (p) => !p.basePrice || (p.basePrice >= minPrice && p.basePrice <= maxPrice)
      );
    }

    // 여행지 필터
    if (selectedDestinations.length > 0) {
      result = result.filter((p) =>
        selectedDestinations.includes(p.destination)
      );
    }

    // 정렬
    switch (sortKey) {
      case "priceLow":
        result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        break;
      case "priceHigh":
        result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      // recommended: 서버 기본 정렬 유지
    }

    return result;
  }, [initialProducts, minPrice, maxPrice, priceRange, selectedDestinations, sortKey]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "추천순";

  return (
    <div className="flex gap-[40px]">
      {/* 왼쪽: 필터 사이드바 */}
      <aside className="w-[309px] flex-shrink-0 space-y-6 hidden lg:block">
        {/* 필터 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#18181B]">필터</h2>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[14px] font-medium text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 가격대 필터 */}
        <div className="bg-white rounded-[24px] p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[16px] font-semibold text-[#18181B]">1인 가격</h3>
            <span className="text-[13px] text-[#71717A]">
              {formatPrice(minPrice)} ~ {formatPrice(maxPrice)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>{formatPrice(priceRange.min)}</span>
              <span>{formatPrice(priceRange.max)}</span>
            </div>
            {/* 듀얼 레인지 슬라이더 */}
            <div className="relative h-7 flex items-center">
              {/* 트랙 배경 */}
              <div className="absolute left-0 right-0 h-1 bg-[#E4E4E7] rounded-full" />
              {/* 활성 트랙 */}
              <div
                className="absolute h-1 bg-[#8B5CF6] rounded-full"
                style={{
                  left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                  right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                }}
              />
              {/* 최소 핸들 */}
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={PRICE_STEP}
                value={minPrice}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMinPrice(Math.min(v, maxPrice - PRICE_STEP));
                }}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#8B5CF6] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#8B5CF6] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: minPrice > priceRange.max - PRICE_STEP * 2 ? 5 : 3 }}
              />
              {/* 최대 핸들 */}
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaxPrice(Math.max(v, minPrice + PRICE_STEP));
                }}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#8B5CF6] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#8B5CF6] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: 4 }}
              />
            </div>
          </div>
        </div>

        {/* 여행지 필터 */}
        <div className="bg-white rounded-[24px] p-6 space-y-4">
          <h3 className="text-[16px] font-semibold text-[#18181B]">여행지</h3>
          <div className="space-y-3">
            {destinations.map((dest) => (
              <label
                key={dest}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleDestination(dest)}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedDestinations.includes(dest)
                      ? "bg-[#8B5CF6] border-[#8B5CF6]"
                      : "border-[#D4D4D8] group-hover:border-[#8B5CF6]"
                  }`}
                >
                  {selectedDestinations.includes(dest) && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="text-[14px] text-[#18181B]">{dest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#18181B] mb-4">카테고리</h3>
            <button
              type="button"
              onClick={() => handleCategoryClick(undefined)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedCategory
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium"
                  : "text-[#71717A] hover:bg-gray-50"
              }`}
            >
              전체
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium"
                    : "text-[#71717A] hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* 오른쪽: 콘텐츠 영역 */}
      <div className="flex-1 space-y-6">
        {/* 정렬 바 */}
        <div className="flex items-center justify-between">
          <p className="text-[15px] text-[#71717A]">
            총 <span className="font-semibold text-[#18181B]">{filteredProducts.length}</span>개의 여행 상품
          </p>
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 border border-[#E4E4E7] rounded-[20px] px-4 py-2.5 bg-white hover:border-[#8B5CF6] transition-colors"
            >
              <span className="text-sm text-[#18181B]">{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-[#71717A] transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#E4E4E7] py-1 z-20">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortKey(opt.key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortKey === opt.key
                        ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium"
                        : "text-[#18181B] hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상품 그리드 */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] shadow-sm">
            <PackageOpen className="w-16 h-16 text-[#E4E4E7] mb-4" />
            <p className="text-lg font-medium text-[#18181B] mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-[#71717A]">
              다른 검색어나 필터를 시도해 보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
