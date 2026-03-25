"use client";

import { useParams } from "next/navigation";
import { useApiQuery } from "@/hooks/useApi";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams() as { id: string };

  const { data, isLoading } = useApiQuery<any>(
    ["product", id],
    `/api/products/${id}`
  );

  const product = data?.success ? data.product : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">로딩 중...</div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center h-64 text-gray-500">상품을 찾을 수 없습니다</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">상품 수정</h1>
      <ProductForm initialData={product} />
    </div>
  );
}
