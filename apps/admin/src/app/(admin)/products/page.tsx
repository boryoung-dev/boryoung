"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  destination: string;
  basePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  sortOrder: number;
  category: { id: string; name: string };
  thumbnail: string | null;
  tagList: { id: string; name: string }[];
  _count: { bookings: number; reviews: number };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const { authHeaders } = useAdminAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);

      const res = await fetch(`/api/products?${params}`, {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("상품 목록 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter, authHeaders]);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchProducts();
      fetchCategories();
    }
  }, [authHeaders]);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchProducts(1);
    }
  }, [search, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { headers: authHeaders as any });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch {}
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 상품을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });
      if (res.ok) fetchProducts(pagination.page);
    } catch {
      alert("삭제 실패");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> 상품 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="상품명 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <span className="text-sm text-gray-600">
            총 {pagination.total}개 상품
          </span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">상품이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">상품</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">조회/예약</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</div>
                          <div className="text-xs text-gray-500">{product.destination}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.basePrice ? `${product.basePrice.toLocaleString()}원` : "가격 문의"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">{product.isActive ? "활성" : "비활성"}</span>
                        {product.isFeatured && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">추천</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {product.viewCount}
                      </div>
                      <div className="text-xs">{product._count.bookings}건 예약</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {pagination.page} / {pagination.totalPages} 페이지
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
