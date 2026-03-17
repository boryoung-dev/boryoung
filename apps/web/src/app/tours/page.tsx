import type { Metadata } from "next";
import { Suspense } from "react";
import { ToursPageClient } from "@/components/tours/ToursPageClient";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
import { getTourProducts, getCategories, getTags } from "@/lib/tours/queries";
import { Search } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "해외 골프투어 상품",
  description: "일본, 태국, 베트남, 대만 등 해외 골프투어 상품을 비교하고 예약하세요. 보령항공여행의 프리미엄 골프 패키지.",
  alternates: {
    canonical: `${SITE_URL}/tours`,
  },
  openGraph: {
    title: "해외 골프투어 상품 | 보령항공여행",
    description: "일본, 태국, 베트남, 대만 등 해외 골프투어 상품을 비교하고 예약하세요.",
    url: `${SITE_URL}/tours`,
    type: "website",
  },
};

function HeroSearchForm() {
  return (
    <form action="/tours" method="get" className="max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
        <input
          type="text"
          name="search"
          placeholder="어디로 여행하고 싶으신가요?"
          className="w-full pl-12 pr-4 h-12 bg-white border border-[color:var(--border)] rounded-xl text-sm focus:ring-2 focus:ring-[color:var(--border)] outline-none"
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
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />

      {/* 히어로 배너 */}
      <section className="pt-16 pb-8 md:pt-20 md:pb-10 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--fg)] mb-6">
            골프투어 상품
          </h1>
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
