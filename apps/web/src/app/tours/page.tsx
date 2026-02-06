import { Suspense } from "react";
import { ToursPageClient } from "@/components/tours/ToursPageClient";
import { SiteHeader } from "@/components/common/SiteHeader";
import { getTourProducts, getCategories, getTags } from "@/lib/tours/queries";

export const metadata = {
  title: "여행 상품 | 보령항공여행",
  description: "보령항공여행의 다양한 골프 여행 상품을 만나보세요",
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; search?: string };
}) {
  const [products, categories, tags] = await Promise.all([
    getTourProducts({
      categorySlug: searchParams.category,
      tagSlug: searchParams.tag,
      search: searchParams.search,
    }),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">여행 상품</h1>
          <p className="mt-2 text-lg text-gray-600">
            최고의 골프 여행을 경험하세요
          </p>
        </div>

        <Suspense fallback={<div>로딩 중...</div>}>
          <ToursPageClient
            initialProducts={products}
            categories={categories}
            tags={tags}
            initialFilters={{
              category: searchParams.category,
              tag: searchParams.tag,
              search: searchParams.search,
            }}
          />
        </Suspense>
      </main>
    </div>
  );
}
