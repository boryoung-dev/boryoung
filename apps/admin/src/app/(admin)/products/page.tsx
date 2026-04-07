"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, ChevronLeft, ChevronRight, Star, Info, X } from "lucide-react";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

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

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
}

interface CategoriesResponse {
  success: boolean;
  categories: { id: string; name: string }[];
}

export default function AdminProductsPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);

  // 상품 목록 조회
  const productsParams = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) productsParams.set("search", search);
  if (statusFilter !== "all") productsParams.set("status", statusFilter);
  if (categoryFilter) productsParams.set("categoryId", categoryFilter);

  const { data: productsData, isLoading } = useApiQuery<ProductsResponse>(
    ["products", String(page), search, statusFilter, categoryFilter],
    `/api/products?${productsParams}`
  );

  // 카테고리 목록 조회
  const { data: categoriesData } = useApiQuery<CategoriesResponse>(
    ["categories"],
    "/api/categories"
  );

  const products = productsData?.products ?? [];
  const pagination = productsData?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
  const categories = categoriesData?.categories ?? [];

  // 활성/추천 토글 mutation
  const toggleMutation = useApiMutation<any, { id: string; field: "isActive" | "isFeatured"; value: boolean }>(
    async ({ id, field, value }, token) =>
      fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      }),
    {
      invalidateKeys: [["products", String(page), search, statusFilter, categoryFilter]],
      onError: () => toast("변경 실패", "error"),
    }
  );

  // 삭제 mutation
  const deleteMutation = useApiMutation<any, { id: string }>(
    async ({ id }, token) =>
      fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      invalidateKeys: [["products", String(page), search, statusFilter, categoryFilter]],
      onError: () => toast("삭제 실패", "error"),
    }
  );

  const handleToggle = (id: string, field: "isActive" | "isFeatured", current: boolean) => {
    toggleMutation.mutate({ id, field, value: !current });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!(await confirm({ message: `"${title}" 상품을 삭제하시겠습니까?`, variant: "danger", confirmText: "삭제" }))) return;
    deleteMutation.mutate({ id });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  return (
    <div>
      {/* 기능 안내 모달 */}
      {infoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setInfoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">상품 관리 기능 안내</h2>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">📋 목록 / 검색 / 필터</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>상품명으로 실시간 검색</li>
                  <li>상태(전체/활성/비활성) · 카테고리별 필터</li>
                  <li>페이지당 20개씩 페이지네이션</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">🟢 활성 토글</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>웹사이트(<code className="px-1 bg-gray-100 rounded">/tours</code>) 노출 여부를 한 번에 켜고 끔</li>
                  <li>비활성 시 목록·상세·홈 큐레이션 모두에서 자동 제외</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">⭐ 추천 토글</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code className="px-1 bg-gray-100 rounded">/tours</code> 정렬 옵션 "추천순" 선택 시 우선 노출</li>
                  <li>상품 카드/상세에 별표 마크 표시</li>
                  <li>홈 큐레이션 자동 채움 시 우선순위 (수동 큐레이션은 별도)</li>
                  <li className="text-gray-500">※ 홈 메인 노출은 <b>홈페이지 에디터</b>에서 직접 큐레이션</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">📊 조회 / 예약 카운트</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>조회: 사용자가 상품 상세 페이지를 본 횟수</li>
                  <li>예약: 해당 상품으로 들어온 예약 신청 건수</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">✏️ 작업 (수정 / 삭제)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>연필 아이콘 → 상품 상세 편집 페이지로 이동</li>
                  <li>휴지통 아이콘 → 확인 후 영구 삭제 (복구 불가)</li>
                  <li>새 상품은 우측 상단 <b>+ 상품 등록</b> 버튼으로 추가</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">💡 팁</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>가격 0원/미정 상품은 "-"로 표시됩니다</li>
                  <li>기본 정렬은 진열 순서(sortOrder) → 최신 등록순</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="기능 안내"
            aria-label="기능 안내"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 상품 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="상품명 검색..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={[
              { value: "all", label: "전체 상태" },
              { value: "active", label: "활성" },
              { value: "inactive", label: "비활성" },
            ]}
            className="w-32"
          />
          <Select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            options={[
              { value: "", label: "전체 카테고리" },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <span className="text-sm text-gray-500">
            총 <span className="font-medium text-gray-900">{pagination.total}</span>개 상품
          </span>
        </div>
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <Plus className="w-12 h-12" />
            </div>
            <p className="text-sm text-gray-500">상품이 없습니다</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상품</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">가격</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">활성</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">추천</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">조회</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">예약</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  {/* 상품 (썸네일 + 제목 + 카테고리 + 지역) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[280px]">{product.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex px-1.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded">{product.category.name}</span>
                          <span className="text-[11px] text-gray-400">{product.destination}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* 가격 */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {product.basePrice ? `${product.basePrice.toLocaleString()}` : "-"}
                    </span>
                    {product.basePrice && <span className="text-xs text-gray-400">원</span>}
                  </td>
                  {/* 활성 토글 */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggle(product.id, "isActive", product.isActive); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={product.isActive ? "활성 → 비활성" : "비활성 → 활성"}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        product.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                      }`} />
                    </button>
                  </td>
                  {/* 추천 토글 */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggle(product.id, "isFeatured", product.isFeatured); }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        product.isFeatured
                          ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                          : "text-gray-300 hover:text-yellow-400 hover:bg-gray-50"
                      }`}
                      title={product.isFeatured ? "추천 해제" : "추천 설정"}
                    >
                      <Star className={`w-4 h-4 ${product.isFeatured ? "fill-current" : ""}`} />
                    </button>
                  </td>
                  {/* 조회 */}
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{product.viewCount}</td>
                  {/* 예약 */}
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{product._count.bookings}</td>
                  {/* 작업 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(product.id, product.title); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {pagination.page} / {pagination.totalPages} 페이지
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
