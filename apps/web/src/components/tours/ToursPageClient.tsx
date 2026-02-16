"use client";

import { useState } from "react";
import { PackageOpen, ChevronDown, Check } from "lucide-react";
import { ProductCard } from "./ProductCard";

type Product = any;
type Category = any;
type Tag = any;

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
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedTag, setSelectedTag] = useState(initialFilters.tag);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const handleCategoryClick = (slug?: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (slug) params.set("category", slug);
    if (selectedTag) params.set("tag", selectedTag);
    window.location.href = `/tours?${params.toString()}`;
  };

  const handleResetFilters = () => {
    window.location.href = `/tours`;
  };

  const destinations = [
    { id: "sea", label: "동남아시아" },
    { id: "japan", label: "일본" },
    { id: "europe", label: "유럽" },
    { id: "america", label: "미주/하와이" },
  ];

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

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
          <h3 className="text-[16px] font-semibold text-[#18181B]">가격대</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-[#71717A]">
              <span>₩{priceRange[0].toLocaleString()}</span>
              <span>₩{priceRange[1].toLocaleString()}+</span>
            </div>
            <div className="relative h-1 bg-[#E4E4E7] rounded-full">
              <div
                className="absolute h-full bg-[#8B5CF6] rounded-full"
                style={{ left: "0%", right: "20%" }}
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
                key={dest.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedDestinations.includes(dest.id)
                      ? "bg-[#8B5CF6] border-[#8B5CF6]"
                      : "border-[#D4D4D8] group-hover:border-[#8B5CF6]"
                  }`}
                  onClick={() => toggleDestination(dest.id)}
                >
                  {selectedDestinations.includes(dest.id) && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="text-[14px] text-[#18181B]">{dest.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 카테고리 필터 (사이드바 스타일) */}
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
            총 <span className="font-semibold text-[#18181B]">{initialProducts.length}</span>개의 여행 상품
          </p>
          <div className="flex items-center gap-2 border border-[#E4E4E7] rounded-[20px] px-4 py-2.5 bg-white">
            <span className="text-sm text-[#18181B]">추천순</span>
            <ChevronDown className="w-4 h-4 text-[#71717A]" />
          </div>
        </div>

        {/* 상품 그리드 */}
        {initialProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] shadow-sm">
            <PackageOpen className="w-16 h-16 text-[#E4E4E7] mb-4" />
            <p className="text-lg font-medium text-[#18181B] mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-[#71717A]">
              다른 검색어나 필터를 시도해 보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
