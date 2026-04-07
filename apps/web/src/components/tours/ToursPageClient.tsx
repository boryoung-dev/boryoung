"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { PackageOpen, ChevronDown, SlidersHorizontal, X, ChevronUp } from "lucide-react";
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

/** 아코디언 섹션 */
function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[24px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-[color:var(--fg)]">{title}</h3>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[color:var(--muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[color:var(--muted)]" />
        )}
      </button>
      {open && <div className="px-6 pb-6 pt-0">{children}</div>}
    </div>
  );
}

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
    destination?: string;
  };
}) {
  const [searchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedTag] = useState(initialFilters.tag);
  // URL의 destination 파라미터로 여행지 자동 선택 (부분 매칭)
  const initialDestinations = useMemo(() => {
    if (!initialFilters.destination) return [];
    const keyword = initialFilters.destination;
    return initialProducts
      .map((p) => p.destination)
      .filter((d): d is string => !!d && d.includes(keyword))
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [initialFilters.destination, initialProducts]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(initialDestinations);
  const [selectedDepartures, setSelectedDepartures] = useState<string[]>([]);
  const [selectedNights, setSelectedNights] = useState<string[]>([]); // "1-2", "3", "4+"
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
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

  // 상품 데이터에서 출발지 목록 동적 추출
  const departures = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.departure) set.add(p.departure);
    });
    return Array.from(set).sort();
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
    setSelectedDepartures([]);
    setSelectedNights([]);
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

  const toggleDeparture = (id: string) => {
    setSelectedDepartures((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleNights = (id: string) => {
    setSelectedNights((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const matchesNightsBucket = (nights: number | null | undefined, bucket: string) => {
    if (nights == null) return false;
    if (bucket === "1-2") return nights <= 2;
    if (bucket === "3") return nights === 3;
    if (bucket === "4+") return nights >= 4;
    return false;
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

    // 여행지 필터 (사이드바 체크박스)
    if (selectedDestinations.length > 0) {
      result = result.filter((p) =>
        selectedDestinations.includes(p.destination)
      );
    } else if (initialFilters.destination) {
      // URL destination 파라미터가 있지만 정확히 매칭되는 여행지가 없을 때 부분 매칭
      const keyword = initialFilters.destination;
      result = result.filter((p) =>
        p.destination?.includes(keyword)
      );
    }

    // 출발지 필터
    if (selectedDepartures.length > 0) {
      result = result.filter((p) => p.departure && selectedDepartures.includes(p.departure));
    }

    // 여행 기간 필터
    if (selectedNights.length > 0) {
      result = result.filter((p) =>
        selectedNights.some((bucket) => matchesNightsBucket(p.nights, bucket))
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
  }, [initialProducts, minPrice, maxPrice, priceRange, selectedDestinations, selectedDepartures, selectedNights, sortKey]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "추천순";

  // 필터 내용 공통 렌더링
  const filterContent = (
    <>
      {/* 가격대 필터 */}
      <FilterSection title="1인 가격">
        <RangeSlider
          min={priceRange.min}
          max={priceRange.max}
          step={PRICE_STEP}
          minValue={minPrice}
          maxValue={maxPrice}
          onChange={(newMin, newMax) => { setMinPrice(newMin); setMaxPrice(newMax); }}
          formatLabel={formatPrice}
        />
      </FilterSection>

      {/* 여행지 필터 */}
      <FilterSection title="여행지">
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
      </FilterSection>

      {/* 출발지 필터 */}
      {departures.length > 0 && (
        <FilterSection title="출발지">
          <div className="space-y-3">
            {departures.map((dep) => (
              <Checkbox
                key={dep}
                checked={selectedDepartures.includes(dep)}
                onChange={() => toggleDeparture(dep)}
                label={dep}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* 여행 기간 필터 */}
      <FilterSection title="여행 기간">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "1-2", label: "1~2박" },
            { value: "3", label: "3박" },
            { value: "4+", label: "4박 이상" },
          ].map((opt) => {
            const selected = selectedNights.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleNights(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selected
                    ? "bg-[color:var(--fg)] text-white"
                    : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="flex gap-[40px]">
      {/* 왼쪽: 필터 사이드바 (데스크톱) */}
      <aside className="w-[309px] flex-shrink-0 space-y-6 hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
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
        {filterContent}
      </aside>

      {/* 모바일 필터 오버레이 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">필터</h3>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[color:var(--surface)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {filterContent}
            </div>
            <button onClick={() => setFilterOpen(false)} className="w-full mt-6 h-12 bg-[color:var(--fg)] text-white rounded-xl font-medium">
              적용하기
            </button>
          </div>
        </div>
      )}

      {/* 오른쪽: 콘텐츠 영역 */}
      <div className="flex-1 space-y-6">
        {/* 정렬 바 + 모바일 필터 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex lg:hidden items-center gap-2 px-4 py-2 bg-[color:var(--surface)] rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              필터
            </button>
            <p className="text-[15px] text-[color:var(--muted)]">
              총 <span className="font-semibold text-[color:var(--fg)]">{filteredProducts.length}</span>개의 여행 상품
            </p>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
