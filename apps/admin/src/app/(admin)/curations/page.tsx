"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Eye, EyeOff, Package } from "lucide-react";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Curation {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

interface CurationFormData {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
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
    description: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // 상품 관리 관련 state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<CurationProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0 && !isLoading) {
      fetchCurations();
    }
  }, [authHeaders, isLoading]);

  const fetchCurations = async () => {
    try {
      const res = await fetch("/api/curations", {
        headers: authHeaders as any
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
      description: "",
      imageUrl: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true
    });
    setImagePreview("");
    setModalOpen(true);
  };

  const openEditModal = (curation: Curation) => {
    setEditingCuration(curation);
    setFormData({
      title: curation.title,
      description: curation.description || "",
      imageUrl: curation.imageUrl || "",
      linkUrl: curation.linkUrl || "",
      sortOrder: curation.sortOrder,
      isActive: curation.isActive
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

    try {
      const url = editingCuration ? `/api/curations/${editingCuration.id}` : "/api/curations";
      const method = editingCuration ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        } as any,
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          linkUrl: formData.linkUrl || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCurations();
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
        headers: authHeaders as any
      });

      const data = await res.json();
      if (data.success) {
        fetchCurations();
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

    try {
      const productsRes = await fetch("/api/products", {
        headers: authHeaders as any
      });
      const productsData = await productsRes.json();
      if (productsData.success) {
        setAllProducts(productsData.products || []);
      }

      const linkedRes = await fetch(`/api/curations/${curation.id}/products`, {
        headers: authHeaders as any
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
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!managingCuration) return;

    try {
      const res = await fetch(`/api/curations/${managingCuration.id}/products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        } as any,
        body: JSON.stringify({ productIds: selectedProductIds })
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
        <h1 className="text-2xl font-bold text-gray-900">큐레이션 관리</h1>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curations.map((curation) => (
            <div key={curation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {curation.imageUrl && (
                <div className="relative h-[200px] bg-gray-100">
                  <img
                    src={curation.imageUrl}
                    alt={curation.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ddd' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='16'%3E이미지 로드 실패%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      curation.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {curation.isActive ? "활성" : "비활성"}
                    </span>
                    {curation._count && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {curation._count.products}개 상품
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{curation.title}</h3>
                    {curation.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{curation.description}</p>
                    )}
                  </div>
                  <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    순서: {curation.sortOrder}
                  </span>
                </div>

                {curation.linkUrl && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">링크: </span>
                    <a
                      href={curation.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {curation.linkUrl}
                    </a>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openProductsModal(curation)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Package className="w-4 h-4" />
                    상품 관리
                  </button>
                  <button
                    onClick={() => openEditModal(curation)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(curation.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
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
                  className="w-full h-[200px] object-cover"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              min="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">활성화</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
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
            <div className="flex-1 text-sm text-gray-600">
              선택된 상품: {selectedProductIds.length}개
            </div>
            <ModalCancelButton onClick={() => setProductsModalOpen(false)} />
            <ModalConfirmButton onClick={handleSaveProducts}>저장</ModalConfirmButton>
          </>
        }
      >
        {productsLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
        ) : (
          <div className="space-y-2">
            {allProducts.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                등록된 상품이 없습니다
              </div>
            ) : (
              allProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.title}</h4>
                      <p className="text-sm text-gray-600">
                        {product.destination} · {product.basePrice.toLocaleString()}원
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
