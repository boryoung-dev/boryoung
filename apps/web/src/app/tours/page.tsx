import { Suspense } from "react";
import { ToursPageClient } from "@/components/tours/ToursPageClient";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
import { getTourProducts, getCategories, getTags } from "@/lib/tours/queries";
import { Search } from "lucide-react";

export const metadata = {
  title: "여행 상품 | 보령항공여행",
  description: "보령항공여행의 다양한 골프 여행 상품을 만나보세요",
};

function HeroSearchForm() {
  return (
    <form action="/tours" method="get" className="w-full max-w-[600px] mx-auto">
      <div className="relative flex items-center bg-white rounded-full shadow-lg h-[60px] px-6">
        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          name="search"
          placeholder="어디로 여행하고 싶으신가요?"
          className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-[#18181B] placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="flex-shrink-0 bg-[#8B5CF6] text-white px-8 py-2.5 rounded-[22px] font-medium hover:bg-[#7C3AED] transition-colors h-[44px] w-[120px] flex items-center justify-center"
        >
          검색
        </button>
      </div>
    </form>
  );
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [products, categories, tags] = await Promise.all([
    getTourProducts({
      categorySlug: resolvedParams.category,
      tagSlug: resolvedParams.tag,
      search: resolvedParams.search,
    }),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />

      {/* 히어로 배너 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] py-[60px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1440px] px-[60px] text-center">
          <h1 className="text-[42px] font-bold text-[#18181B] mb-3 tracking-tight">
            특별한 여행을 찾아보세요
          </h1>
          <p className="text-[18px] font-normal text-[#18181B]/80 mb-8">
            전 세계 프리미엄 골프 & 리조트 패키지
          </p>
          <HeroSearchForm />
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-[1440px] px-[60px] py-[40px]">
        <Suspense fallback={<div className="text-center py-12 text-[color:var(--muted)]">로딩 중...</div>}>
          <ToursPageClient
            initialProducts={products}
            categories={categories}
            tags={tags}
            initialFilters={{
              category: resolvedParams.category,
              tag: resolvedParams.tag,
              search: resolvedParams.search,
            }}
          />
        </Suspense>
      </main>

      <SiteFooter />

      <KakaoFloating />
    </div>
  );
}
