import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ToursPageClient } from "@/components/tours/ToursPageClient";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
import { TourHeroCarousel } from "@/components/tours/TourHeroCarousel";
import { getTourProducts, getCategories, getTags } from "@/lib/tours/queries";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

// 국가명 → 국기 이모지 매핑 (없으면 📍)
const COUNTRY_EMOJI: Record<string, string> = {
  일본: "🇯🇵",
  태국: "🇹🇭",
  베트남: "🇻🇳",
  대만: "🇹🇼",
  중국: "🇨🇳",
  인도네시아: "🇮🇩",
  필리핀: "🇵🇭",
  말레이시아: "🇲🇾",
  라오스: "🇱🇦",
  캄보디아: "🇰🇭",
  미국: "🇺🇸",
  괌: "🇬🇺",
  사이판: "🇲🇵",
  한국: "🇰🇷",
};

function pickEmoji(name: string, parentName?: string): string {
  if (COUNTRY_EMOJI[name]) return COUNTRY_EMOJI[name];
  if (parentName && COUNTRY_EMOJI[parentName]) return COUNTRY_EMOJI[parentName];
  for (const [k, v] of Object.entries(COUNTRY_EMOJI)) {
    if (name.includes(k) || parentName?.includes(k)) return v;
  }
  return "📍";
}

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
    <form action="/tours" method="get" className="w-full max-w-2xl mx-auto">
      <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2">
        <Search className="ml-3 w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          name="search"
          placeholder="목적지, 국가, 골프장 이름으로 검색"
          className="flex-1 px-3 h-12 text-sm md:text-base outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="h-12 px-6 md:px-8 bg-[color:var(--brand,#0066ff)] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition-opacity"
        >
          검색
        </button>
      </div>
    </form>
  );
}

export const revalidate = 60;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const destination = typeof params.destination === "string" ? params.destination : undefined;

  const [products, categories, tags, heroBanners, popularRaw] = await Promise.all([
    getTourProducts({ categorySlug: category, tagSlug: tag, search }),
    getCategories(),
    getTags(),
    prisma.banner.findMany({
      where: {
        placement: "tour",
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
      },
      orderBy: { sortOrder: "asc" },
    }),
    // 인기 목적지: 활성 상품을 가진 카테고리를 상품수 기준 상위 8개
    prisma.category.findMany({
      where: {
        isActive: true,
        products: { some: { isActive: true } },
      },
      include: {
        parent: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { products: { _count: "desc" } },
      take: 8,
    }),
  ]);

  const popularDestinations = popularRaw.map((c) => ({
    label: c.name,
    href: `/tours?destination=${encodeURIComponent(c.name)}`,
    emoji: pickEmoji(c.name, c.parent?.name),
  }));

  const displayBanners =
    heroBanners.length > 0
      ? heroBanners.map(({ id, title, subtitle, imageUrl }) => ({
          id,
          title,
          subtitle,
          imageUrl,
        }))
      : [
          {
            id: "tour-banner-fallback",
            title: "골프, 어디로 떠나시겠어요?",
            subtitle: "22년 노하우로 엄선한 전 세계 명문 골프코스",
            imageUrl:
              "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1920&q=80",
          },
        ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />

      <TourHeroCarousel banners={displayBanners}>
        <HeroSearchForm />

        {/* 인기 목적지 칩 (등록된 카테고리 기준 동적 노출) */}
        {popularDestinations.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs md:text-sm text-white/80 mr-1">
              인기 목적지
            </span>
            {popularDestinations.map((d) => (
              <Link
                key={d.label}
                href={d.href}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-full text-xs md:text-sm text-white transition-colors"
              >
                <span>{d.emoji}</span>
                {d.label}
              </Link>
            ))}
          </div>
        )}
      </TourHeroCarousel>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-[1440px] px-[60px] py-[40px]">
        <Suspense fallback={<div className="text-center py-12 text-[color:var(--muted)]">로딩 중...</div>}>
          <ToursPageClient
            initialProducts={products}
            categories={categories}
            tags={tags}
            initialFilters={{ category, tag, search, destination }}
          />
        </Suspense>
      </main>

      <SiteFooter />

      <KakaoFloating />
    </div>
  );
}
