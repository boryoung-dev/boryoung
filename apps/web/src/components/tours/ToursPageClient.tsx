"use client";

import { useState } from "react";
import { PackageOpen } from "lucide-react";
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedTag) params.set("tag", selectedTag);
    window.location.href = `/tours?${params.toString()}`;
  };

  const handleCategoryClick = (slug?: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (slug) params.set("category", slug);
    if (selectedTag) params.set("tag", selectedTag);
    window.location.href = `/tours?${params.toString()}`;
  };

  const handleTagClick = (slug: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedTag !== slug) params.set("tag", slug);
    window.location.href = `/tours?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      {/* 필터 영역 */}
      <div className="space-y-4">
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick(undefined)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !selectedCategory
                ? "bg-[color:var(--brand)] text-white shadow-sm"
                : "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--border)]"
            }`}
          >
            전체
          </button>
          {categories.map((cat: Category) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat.slug
                  ? "bg-[color:var(--brand)] text-white shadow-sm"
                  : "bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--border)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 태그 필터 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: Tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagClick(tag.slug)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                  selectedTag === tag.slug
                    ? "bg-[color:var(--brand)] text-white"
                    : "text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 결과 개수 */}
      <div className="text-sm text-[color:var(--muted)]">
        총 <span className="font-semibold text-[color:var(--fg)]">{initialProducts.length}개</span> 상품
      </div>

      {/* 상품 그리드 */}
      {initialProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="w-16 h-16 text-[color:var(--border)] mb-4" />
          <p className="text-lg font-medium text-[color:var(--fg)] mb-2">검색 결과가 없습니다</p>
          <p className="text-sm text-[color:var(--muted)]">
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
  );
}
