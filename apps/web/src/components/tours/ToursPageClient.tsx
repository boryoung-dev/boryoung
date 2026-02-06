"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";

type Product = any; // 타입은 나중에 정리
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

  return (
    <div className="space-y-6">
      {/* 검색 & 필터 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 태그 필터 */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTag(selectedTag === tag.slug ? undefined : tag.slug)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedTag === tag.slug
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            검색
          </button>
        </form>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        ) : (
          initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
