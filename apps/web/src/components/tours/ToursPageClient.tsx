"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { PackageOpen, ChevronDown } from "lucide-react";
import { RangeSlider } from "@/components/common/RangeSlider";
import { Checkbox } from "@/components/common/Checkbox";
import { ProductCard } from "./ProductCard";
import type { TourProductSummary, Category, Tag } from "@/lib/types";

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
  initialProducts: TourProductSummary[];
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
      .map((p) => p.basePrice)
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
    initialProducts.forEach((p) => {
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">필터</h2>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 가격대 필터 */}
        <div className="bg-white rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[color:var(--fg)]">1인 가격</h3>
          <RangeSlider
            min={priceRange.min}
            max={priceRange.max}
            step={PRICE_STEP}
            minValue={minPrice}
            maxValue={maxPrice}
            onChange={(newMin, newMax) => { setMinPrice(newMin); setMaxPrice(newMax); }}
            formatLabel={formatPrice}
          />
        </div>

        {/* 여행지 필터 */}
        <div className="bg-white rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[color:var(--fg)]">여행지</h3>
          <div className="space-y-3">
            {destinations.map((dest) => (
              <Checkbox
                key={dest}
                checked={selectedDestinations.includes(dest)}
                onChange={() => toggleDestination(dest)}
                label={dest}
              />
            ))}
          </div>
        </div>

        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 space-y-3">
            <h3 className="text-sm font-semibold text-[color:var(--fg)] mb-4">카테고리</h3>
            <button
              type="button"
              onClick={() => handleCategoryClick(undefined)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedCategory
                  ? "bg-[color:var(--fg)] text-white font-medium"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface)]"
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-[color:var(--fg)] text-white font-medium"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--surface)]"
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
          <p className="text-[15px] text-[color:var(--muted)]">
            총 <span className="font-semibold text-[color:var(--fg)]">{filteredProducts.length}</span>개의 여행 상품
          </p>
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 border border-[color:var(--border)] rounded-[20px] px-4 py-2.5 bg-white hover:border-[color:var(--brand)] transition-colors"
            >
              <span className="text-sm text-[color:var(--fg)]">{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-[color:var(--muted)] transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-[color:var(--border)] py-1 z-20">
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
                        ? "bg-[color:var(--surface)] text-[color:var(--fg)] font-medium"
                        : "text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
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
            <PackageOpen className="w-16 h-16 text-[color:var(--border)] mb-4" />
            <p className="text-lg font-medium text-[color:var(--fg)] mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-[color:var(--muted)]">
              다른 검색어나 필터를 시도해 보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
