"use client";

import { useState, useEffect } from "react";
import { Search, X, GripVertical } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiMutation } from "@/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Product {
  id: string;
  title: string;
  slug: string;
  destination: string;
  basePrice: number;
  thumbnail?: string | null;
  imageUrl?: string;
}

interface CurationProduct {
  id: string;
  productId: string;
  product: Product;
}

interface ProductSelectorProps {
  curationId: string;
  maxItems?: number;
  onProductsChange?: (
    products: Array<{
      id?: string;
      title: string;
      imageUrl?: string;
      destination?: string;
      duration?: string;
      basePrice?: number;
    }>
  ) => void;
}

/** 드래그 가능한 상품 아이템 */
function SortableProductItem({ id, index, title, onRemove }: { id: string; index: number; title: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded border border-blue-200 text-xs">
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 text-gray-400 hover:text-gray-600">
        <GripVertical className="w-3 h-3" />
      </button>
      <span className="text-gray-400 font-mono w-4">{index + 1}</span>
      <span className="flex-1 truncate">{title}</span>
      <button type="button" onClick={onRemove} className="p-0.5 text-gray-400 hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/** 상품 검색/선택 UI */
export function ProductSelector({
  curationId,
  maxItems,
  onProductsChange,
}: ProductSelectorProps) {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 초기 데이터 로드
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const [productsRes, linkedRes] = await Promise.all([
          fetch("/api/products?limit=100", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/curations/${curationId}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const productsData = await productsRes.json();
        const linkedData = await linkedRes.json();
        if (productsData.success) setAllProducts(productsData.products || []);
        if (linkedData.success) {
          const ids = (linkedData.products || []).map(
            (cp: CurationProduct) => cp.productId
          );
          setSelectedProductIds(ids);
        }
      } catch {
        // 무시
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [curationId, token]);

  // 선택 변경시 부모에게 상품 정보 전달
  useEffect(() => {
    if (onProductsChange && allProducts.length > 0) {
      const selected = selectedProductIds
        .map((pid) => allProducts.find((p) => p.id === pid))
        .filter(Boolean)
        .map((p) => ({
          id: p!.id,
          title: p!.title,
          imageUrl: p!.thumbnail || (p! as any).imageUrl || "",
          destination: p!.destination,
          basePrice: p!.basePrice,
        }));
      onProductsChange(selected);
    }
  }, [selectedProductIds, allProducts]);

  const saveProductsMutation = useApiMutation<
    any,
    { curationId: string; productIds: string[] }
  >(
    async ({ curationId, productIds }, token) =>
      fetch(`/api/curations/${curationId}/products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds }),
      }),
    {}
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (maxItems && prev.length >= maxItems) {
        toast(`최대 ${maxItems}개까지 선택 가능합니다`, "error");
        return prev;
      }
      return [...prev, productId];
    });
  };

  const moveProduct = (productId: string, direction: "up" | "down") => {
    setSelectedProductIds((prev) => {
      const idx = prev.indexOf(productId);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleSaveProducts = () => {
    saveProductsMutation.mutate(
      { curationId, productIds: selectedProductIds },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast("상품이 업데이트되었습니다", "success");
            // 저장 후 반환된 데이터로 순서 동기화
            if (data.products) {
              const savedIds = data.products.map((p: any) => p.productId);
              setSelectedProductIds(savedIds);
            }
          }
        },
        onError: () => toast("상품 저장 실패", "error"),
      }
    );
  };

  const filteredProducts = search
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.destination?.toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-gray-500">
        상품 로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">연결 상품</label>
        <button
          type="button"
          onClick={handleSaveProducts}
          disabled={saveProductsMutation.isPending}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {saveProductsMutation.isPending ? "저장 중..." : "상품 저장"}
        </button>
      </div>

      {/* 선택된 상품 (드래그앤드롭) */}
      {selectedProductIds.length > 0 && (
        <div className="p-2 bg-blue-50 rounded-lg space-y-1">
          <p className="text-[10px] font-medium text-blue-700 mb-1">
            선택됨 ({selectedProductIds.length}개{maxItems ? ` / 최대 ${maxItems}개` : ""}) — 드래그로 순서 변경
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                setSelectedProductIds((prev) => {
                  const oldIdx = prev.indexOf(active.id as string);
                  const newIdx = prev.indexOf(over.id as string);
                  return arrayMove(prev, oldIdx, newIdx);
                });
              }
            }}
          >
            <SortableContext items={selectedProductIds} strategy={verticalListSortingStrategy}>
              {selectedProductIds.map((pid, idx) => {
                const product = allProducts.find((p) => p.id === pid);
                return product ? (
                  <SortableProductItem
                    key={pid}
                    id={pid}
                    index={idx}
                    title={product.title}
                    onRemove={() => removeProduct(pid)}
                  />
                ) : null;
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상품명 검색..."
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
        />
      </div>

      {/* 상품 목록 */}
      <div className="max-h-[240px] overflow-y-auto space-y-1">
        {filteredProducts.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {search ? "검색 결과 없음" : "등록된 상품 없음"}
          </p>
        ) : (
          filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <label
                key={product.id}
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-xs ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProduct(product.id)}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                  <p className="text-gray-400">
                    {product.destination} ·{" "}
                    {product.basePrice
                      ? `${product.basePrice.toLocaleString()}원`
                      : "가격 문의"}
                  </p>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
