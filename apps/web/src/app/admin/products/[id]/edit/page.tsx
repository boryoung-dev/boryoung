"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams() as { id: string };
  const { authHeaders } = useAdminAuth();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchProduct();
    }
  }, [authHeaders, id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) setProduct(data.product);
    } catch (error) {
      console.error("상품 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
