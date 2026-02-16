import { Suspense } from "react";
import { ToursPageClient } from "@/components/tours/ToursPageClient";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { getTourProducts, getCategories, getTags } from "@/lib/tours/queries";
import { Search } from "lucide-react";

export const metadata = {
  title: "여행 상품 | 보령항공여행",
  description: "보령항공여행의 다양한 골프 여행 상품을 만나보세요",
};

function HeroSearchForm() {
  return (
    <form action="/tours" method="get" className="w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--muted)]" />
        <input
          type="text"
          name="search"
          placeholder="어디로 떠나고 싶으세요?"
          className="w-full pl-12 pr-6 py-3.5 rounded-full bg-[color:var(--surface)] text-[color:var(--fg)] placeholder:text-[color:var(--muted)] border border-[color:var(--border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:border-transparent transition text-sm"
        />
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
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />

      {/* 히어로 배너 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--brand)] via-blue-500 to-indigo-600 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            여행 상품
          </h1>
          <p className="text-lg text-white/80 mb-8">
            최고의 골프 여행을 경험하세요
          </p>
          <HeroSearchForm />
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-[1200px] px-6 py-12">
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

      {/* 푸터 (홈과 동일) */}
      <footer className="mt-auto border-t border-[color:var(--border)] bg-white py-12 text-center text-sm text-[color:var(--muted)]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center">
          <div className="mb-4 text-xl font-bold tracking-tighter text-[color:var(--brand)] opacity-50">Boryoung</div>
          <p className="mb-2">보령(주) | 대표이사: 심재형 | 사업자등록번호: 123-45-67890</p>
          <p>&copy; 2024 Boryoung. All rights reserved.</p>
        </div>
      </footer>

      <KakaoFloating />
    </div>
  );
}
