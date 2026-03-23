"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Package, Search, GripVertical, LayoutGrid, LayoutList } from "lucide-react";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

// 섹션 타입 정의
const SECTION_TYPES = [
  { value: "", label: "선택 안함 (일반 큐레이션)" },
  { value: "featured_grid", label: "추천 그리드 (2행 3열 카드)" },
  { value: "product_carousel", label: "상품 캐러셀 (가로 슬라이드)" },
  { value: "product_showcase", label: "상품 쇼케이스 (탭 필터 포함)" },
  { value: "destinations_carousel", label: "여행지 캐러셀 (원형 이미지)" },
  { value: "banner_hero", label: "배너 히어로 (전체 너비)" },
  { value: "trust_cta", label: "신뢰 CTA (텍스트 중심)" },
] as const;

// 섹션 타입 라벨 맵
const SECTION_TYPE_LABELS: Record<string, string> = {
  featured_grid: "추천 그리드",
  product_carousel: "상품 캐러셀",
  product_showcase: "상품 쇼케이스",
  destinations_carousel: "여행지 캐러셀",
  banner_hero: "배너 히어로",
  trust_cta: "신뢰 CTA",
};

// 섹션 타입별 색상
const SECTION_TYPE_COLORS: Record<string, string> = {
  featured_grid: "bg-indigo-100 text-indigo-800",
  product_carousel: "bg-cyan-100 text-cyan-800",
  product_showcase: "bg-amber-100 text-amber-800",
  destinations_carousel: "bg-emerald-100 text-emerald-800",
  banner_hero: "bg-rose-100 text-rose-800",
  trust_cta: "bg-violet-100 text-violet-800",
};

interface Curation {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sectionType?: string | null;
  displayConfig?: any;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CurationFormData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  sectionType: string;
  displayConfig: string; // JSON 문자열로 편집
  sortOrder: number;
  isActive: boolean;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  destination: string;
  basePrice: number;
}

interface CurationProduct {
  id: string;
  productId: string;
  product: Product;
}

export default function CurationsPage() {
  const { authHeaders, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [editingCuration, setEditingCuration] = useState<Curation | null>(null);
  const [managingCuration, setManagingCuration] = useState<Curation | null>(null);
  const [formData, setFormData] = useState<CurationFormData>({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    sectionType: "",
    displayConfig: "",
    sortOrder: 0,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // 상품 관리 관련 state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<CurationProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0 && !isLoading) {
      fetchCurations();
    }
  }, [authHeaders, isLoading]);

  const fetchCurations = async () => {
    try {
      const res = await fetch("/api/curations", {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        setCurations(data.curations);
      }
    } catch (error) {
      console.error("큐레이션 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCuration(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      sectionType: "",
      displayConfig: "",
      sortOrder: curations.length > 0 ? Math.max(...curations.map((c) => c.sortOrder)) + 1 : 0,
      isActive: true,
    });
    setImagePreview("");
    setModalOpen(true);
  };

  const openEditModal = (curation: Curation) => {
    setEditingCuration(curation);
    setFormData({
      title: curation.title,
      subtitle: curation.subtitle || "",
      description: curation.description || "",
      imageUrl: curation.imageUrl || "",
      linkUrl: curation.linkUrl || "",
      sectionType: curation.sectionType || "",
      displayConfig: curation.displayConfig ? JSON.stringify(curation.displayConfig, null, 2) : "",
      sortOrder: curation.sortOrder,
      isActive: curation.isActive,
    });
    setImagePreview(curation.imageUrl || "");
    setModalOpen(true);
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast("제목은 필수입니다", "error");
      return;
    }

    // displayConfig JSON 파싱 검증
    let parsedDisplayConfig: any = null;
    if (formData.displayConfig.trim()) {
      try {
        parsedDisplayConfig = JSON.parse(formData.displayConfig);
      } catch {
        toast("표시 설정(displayConfig)이 올바른 JSON 형식이 아닙니다", "error");
        return;
      }
    }

    try {
      const url = editingCuration ? `/api/curations/${editingCuration.id}` : "/api/curations";
      const method = editingCuration ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify({
          ...formData,
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          linkUrl: formData.linkUrl || null,
          sectionType: formData.sectionType || null,
          displayConfig: parsedDisplayConfig,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCurations();
        toast(editingCuration ? "큐레이션이 수정되었습니다" : "큐레이션이 추가되었습니다", "success");
      } else {
        toast(data.error || "저장에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("큐레이션 저장 실패:", error);
      toast("큐레이션 저장 중 오류가 발생했습니다", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 이 큐레이션을 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    try {
      const res = await fetch(`/api/curations/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });

      const data = await res.json();
      if (data.success) {
        fetchCurations();
        toast("큐레이션이 삭제되었습니다", "success");
      } else {
        toast(data.error || "삭제에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("큐레이션 삭제 실패:", error);
      toast("큐레이션 삭제 중 오류가 발생했습니다", "error");
    }
  };

  // 상품 관리 모달 열기
  const openProductsModal = async (curation: Curation) => {
    setManagingCuration(curation);
    setProductsLoading(true);
    setProductsModalOpen(true);
    setProductSearch("");

    try {
      const productsRes = await fetch("/api/products", {
        headers: authHeaders as any,
      });
      const productsData = await productsRes.json();
      if (productsData.success) {
        setAllProducts(productsData.products || []);
      }

      const linkedRes = await fetch(`/api/curations/${curation.id}/products`, {
        headers: authHeaders as any,
      });
      const linkedData = await linkedRes.json();
      if (linkedData.success) {
        setLinkedProducts(linkedData.products || []);
        setSelectedProductIds((linkedData.products || []).map((cp: CurationProduct) => cp.productId));
      }
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!managingCuration) return;

    try {
      const res = await fetch(`/api/curations/${managingCuration.id}/products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify({ productIds: selectedProductIds }),
      });

      const data = await res.json();
      if (data.success) {
        setProductsModalOpen(false);
        fetchCurations();
        toast("상품 연결이 업데이트되었습니다", "success");
      } else {
        toast(data.error || "저장에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("상품 연결 저장 실패:", error);
      toast("상품 연결 저장 중 오류가 발생했습니다", "error");
    }
  };

  // 상품 검색 필터
  const filteredProducts = productSearch
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.destination.toLowerCase().includes(productSearch.toLowerCase())
      )
    : allProducts;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">큐레이션 관리</h1>
          <p className="text-sm text-gray-500 mt-1">메인페이지 섹션을 관리합니다. 정렬 순서대로 표시됩니다.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 큐레이션 추가
        </button>
      </div>

      {curations.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">등록된 큐레이션이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">큐레이션을 추가하여 메인페이지 섹션을 구성하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {curations.map((curation, index) => (
            <div
              key={curation.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                curation.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-stretch">
                {/* 순서 표시 */}
                <div className="flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 text-gray-400">
                  <div className="text-center">
                    <GripVertical className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-xs font-mono">{curation.sortOrder}</span>
                  </div>
                </div>

                {/* 이미지 썸네일 */}
                {curation.imageUrl && (
                  <div className="w-[120px] flex-shrink-0">
                    <img
                      src={curation.imageUrl}
                      alt={curation.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* 정보 */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base">{curation.title}</h3>
                        {curation.sectionType && (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              SECTION_TYPE_COLORS[curation.sectionType] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {SECTION_TYPE_LABELS[curation.sectionType] || curation.sectionType}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            curation.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {curation.isActive ? "활성" : "비활성"}
                        </span>
                      </div>
                      {curation.subtitle && (
                        <p className="text-sm text-gray-500 mb-1">{curation.subtitle}</p>
                      )}
                      {curation.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{curation.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {curation._count && (
                          <span>상품 {curation._count.products}개</span>
                        )}
                        {curation.sectionType && (
                          <span>
                            미리보기:{" "}
                            {curation.sectionType === "featured_grid" && "2행 3열 카드 그리드"}
                            {curation.sectionType === "product_carousel" && "가로 스크롤 상품 캐러셀"}
                            {curation.sectionType === "product_showcase" && "탭 필터 + 상품 캐러셀"}
                            {curation.sectionType === "destinations_carousel" && "원형 이미지 여행지 캐러셀"}
                            {curation.sectionType === "banner_hero" && "전체 너비 배너 슬라이드"}
                            {curation.sectionType === "trust_cta" && "중앙 정렬 텍스트 + CTA 버튼"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 px-3 border-l border-gray-100">
                  <button
                    onClick={() => openProductsModal(curation)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="상품 관리"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(curation)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(curation.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 큐레이션 생성/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCuration ? "큐레이션 수정" : "큐레이션 추가"}
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setModalOpen(false)} />
            <ModalConfirmButton
              type="submit"
              onClick={() => {
                document.getElementById("curation-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
              }}
            >
              {editingCuration ? "수정" : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="curation-form" onSubmit={handleSubmit} className="space-y-4">
          {/* 섹션 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              섹션 타입 <span className="text-xs text-gray-400">(메인페이지에서의 표시 형태)</span>
            </label>
            <select
              value={formData.sectionType}
              onChange={(e) => setFormData({ ...formData, sectionType: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
            >
              {SECTION_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            {formData.sectionType && (
              <p className="mt-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded">
                {formData.sectionType === "featured_grid" && "2행 3열 카드 그리드로 표시됩니다. 연결된 상품이 카드로 노출됩니다."}
                {formData.sectionType === "product_carousel" && "가로 스크롤 캐러셀로 상품이 표시됩니다."}
                {formData.sectionType === "product_showcase" && "탭 필터와 함께 가로 캐러셀로 표시됩니다. displayConfig에서 tabs를 설정하세요."}
                {formData.sectionType === "destinations_carousel" && "원형 이미지로 여행지가 표시됩니다. displayConfig에서 destinations를 설정하세요."}
                {formData.sectionType === "banner_hero" && "전체 너비 배너로 표시됩니다. DB의 Banner 데이터를 사용합니다."}
                {formData.sectionType === "trust_cta" && "텍스트 중심의 신뢰 섹션입니다. 제목과 설명이 중앙 정렬됩니다."}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              required
              placeholder="예: 추천 골프투어, 이번 주 특가"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">부제</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="예: 이번 달 가장 인기 있는 상품"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="trust_cta 타입에서 본문으로 사용됩니다"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="https://example.com/image.jpg"
            />
            {imagePreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-[160px] object-cover"
                  onError={() => setImagePreview("")}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="https://example.com"
            />
          </div>

          {/* 표시 설정 (JSON) */}
          {formData.sectionType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시 설정 (JSON) <span className="text-xs text-gray-400">선택사항</span>
              </label>
              <textarea
                value={formData.displayConfig}
                onChange={(e) => setFormData({ ...formData, displayConfig: e.target.value })}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm font-mono text-xs"
                placeholder={
                  formData.sectionType === "product_showcase"
                    ? '{\n  "tabs": ["전체", "일본", "태국", "베트남"]\n}'
                    : formData.sectionType === "destinations_carousel"
                    ? '{\n  "destinations": [\n    {"name": "나트랑", "image": "https://..."}\n  ]\n}'
                    : formData.sectionType === "featured_grid"
                    ? '{\n  "columns": 3,\n  "rows": 2\n}'
                    : '{\n  "layout": "default"\n}'
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">작을수록 먼저 표시됩니다</p>
            </div>

            <div className="flex items-end pb-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-700">활성화</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* 상품 관리 모달 */}
      <Modal
        isOpen={productsModalOpen && !!managingCuration}
        onClose={() => setProductsModalOpen(false)}
        title={`상품 관리: ${managingCuration?.title || ""}`}
        size="xl"
        footer={
          <>
            <div className="flex-1 text-sm text-gray-600">선택된 상품: {selectedProductIds.length}개</div>
            <ModalCancelButton onClick={() => setProductsModalOpen(false)} />
            <ModalConfirmButton onClick={handleSaveProducts}>저장</ModalConfirmButton>
          </>
        }
      >
        {productsLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
        ) : (
          <div>
            {/* 검색 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="상품명 또는 여행지로 검색..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            {/* 선택된 상품 목록 */}
            {selectedProductIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-2">선택된 상품 ({selectedProductIds.length}개)</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProductIds.map((pid) => {
                    const product = allProducts.find((p) => p.id === pid);
                    return product ? (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white text-blue-700 rounded text-xs border border-blue-200"
                      >
                        {product.title}
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(pid)}
                          className="text-blue-400 hover:text-red-500 ml-1"
                        >
                          x
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* 전체 상품 목록 */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  {productSearch ? "검색 결과가 없습니다" : "등록된 상품이 없습니다"}
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.title}</h4>
                        <p className="text-xs text-gray-500">
                          {product.destination} · {product.basePrice ? `${product.basePrice.toLocaleString()}원` : "가격 문의"}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
