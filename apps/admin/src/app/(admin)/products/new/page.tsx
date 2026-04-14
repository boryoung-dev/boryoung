"use client";

import { useSearchParams } from "next/navigation";
import { useApiQuery } from "@/hooks/useApi";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { slugify } from "@/lib/slugify";

export default function NewProductPage() {
  const searchParams = useSearchParams();
  const fromId = searchParams.get("from");

  // 복제 모드: 기존 상품 데이터를 가져와서 프리필
  const { data, isLoading } = useApiQuery<any>(
    ["product", fromId],
    `/api/products/${fromId}`,
    { enabled: !!fromId }
  );

  if (fromId && isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">상품 데이터 불러오는 중...</div>;
  }

  // 복제 시 id/slug 제거, 제목에 "(복사본)" 추가
  let duplicateData: any = undefined;
  if (fromId && data?.success && data.product) {
    const src = data.product;
    const newTitle = `${src.title} (복사본)`;
    duplicateData = {
      ...src,
      id: undefined,
      slug: slugify(newTitle),
      title: newTitle,
      // 관계 데이터 복제
      images: src.images?.map((img: any) => ({ ...img, id: undefined, productId: undefined })) || [],
      itineraries: src.itineraries?.map((it: any) => ({ ...it, id: undefined, productId: undefined })) || [],
      priceOptions: src.priceOptions?.map((opt: any) => ({ ...opt, id: undefined, productId: undefined })) || [],
      tagList: src.tagList || src.tags?.map((t: any) => t.tag || t) || [],
      scheduleDates: src.scheduleDates || [],
      // 메타 초기화
      viewCount: 0,
      publishedAt: "",
      createdAt: undefined,
      updatedAt: undefined,
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {fromId ? "상품 복제 등록" : "상품 등록"}
      </h1>
      <ProductForm initialData={duplicateData} isDuplicate={!!fromId} />
    </div>
  );
}
