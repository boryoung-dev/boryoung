"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Package } from "lucide-react";

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
      alert("제목은 필수입니다");
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
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("큐레이션 저장 실패:", error);
      alert("큐레이션 저장 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 큐레이션을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/curations/${id}`, {
        method: "DELETE",
        headers: authHeaders as any
      });

      const data = await res.json();
      if (data.success) {
        fetchCurations();
      } else {
        alert(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("큐레이션 삭제 실패:", error);
      alert("큐레이션 삭제 중 오류가 발생했습니다");
    }
  };

  // 상품 관리 모달 열기
  const openProductsModal = async (curation: Curation) => {
    setManagingCuration(curation);
    setProductsLoading(true);
    setProductsModalOpen(true);

    try {
      // 전체 상품 목록 조회
      const productsRes = await fetch("/api/products", {
        headers: authHeaders as any
      });
      const productsData = await productsRes.json();
      if (productsData.success) {
        setAllProducts(productsData.products || []);
      }

      // 현재 연결된 상품 조회
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

  // 상품 선택/해제 토글
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 상품 연결 저장
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
        alert("상품 연결이 업데이트되었습니다");
      } else {
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("상품 연결 저장 실패:", error);
      alert("상품 연결 저장 중 오류가 발생했습니다");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">큐레이션 관리</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          큐레이션 추가
        </button>
      </div>

      {curations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>등록된 큐레이션이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curations.map((curation) => (
            <div key={curation.id} className="bg-white rounded-lg shadow overflow-hidden">
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
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      curation.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {curation.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          활성
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          비활성
                        </>
                      )}
                    </span>
                    {curation._count && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Package className="w-3 h-3" />
                        {curation._count.products}개
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
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
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
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    상품 관리
                  </button>
                  <button
                    onClick={() => openEditModal(curation)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(curation.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
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
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingCuration ? "큐레이션 수정" : "큐레이션 추가"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    링크 URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    활성화
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCuration ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상품 관리 모달 */}
      {productsModalOpen && managingCuration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                상품 관리: {managingCuration.title}
              </h2>
              <button
                onClick={() => setProductsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {productsLoading ? (
                <div className="text-center py-12 text-gray-500">로딩 중...</div>
              ) : (
                <div className="space-y-2">
                  {allProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
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
            </div>

            <div className="border-t p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  선택된 상품: {selectedProductIds.length}개
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProductsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveProducts}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
