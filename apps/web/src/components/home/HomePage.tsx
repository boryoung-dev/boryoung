import { homeSections } from "@/content/homeSections";
import { getRankingProducts, getCollectionItems } from "@/lib/home/seed";
import type { HomeSection } from "@/lib/home/types";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { HeroSection } from "./sections/HeroSection";
import { GlobeSection } from "./GlobeSection";
import { PopularDestinationsCarousel } from "./PopularDestinationsCarousel";
import { FeaturedTourCarousel } from "./FeaturedTourCarousel";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";
import { SiteFooter } from "../common/SiteFooter";
import { AnimateOnScroll } from "../common/AnimateOnScroll";

// 패키지 인기 여행지 (해외)
const PACKAGE_DESTINATIONS = [
  { name: "나트랑", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80" },
  { name: "다낭", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { name: "장가계", image: "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=800&q=80" },
  { name: "오사카", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { name: "삿포로", image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80" },
  { name: "파리", image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80" },
];

// 국내 인기 여행지
const DOMESTIC_DESTINATIONS = [
  { name: "제주도", image: "https://images.unsplash.com/photo-1579169825453-1f9c4f9e8a7e?w=800&q=80" },
  { name: "서울", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80" },
  { name: "부산", image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80" },
  { name: "강릉", image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80" },
  { name: "인천", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80" },
  { name: "경주", image: "https://images.unsplash.com/photo-1553881781-4c55174dc758?w=800&q=80" },
];

export async function HomePage() {
  const heroSection = homeSections.find(
    (s): s is Extract<HomeSection, { type: "hero" }> => s.type === "hero" && s.isVisible
  );

  const now = new Date();
  const [rankingItems, allProducts, banners] = await Promise.all([
    getRankingProducts(),
    prisma.tourProduct.findMany({
      where: { isActive: true },
      include: { images: { where: { isThumbnail: true }, take: 1 }, category: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // 추천 상품 전체 (2행 3열 캐러셀)
  const featured = rankingItems;

  // 국가별 상품 그룹핑 (지구본용)
  const DEST_MAP: Record<string, string> = {
    "일본 후쿠오카": "japan", "일본 오키나와": "japan",
    "베트남 다낭": "vietnam", "태국 치앙마이": "thailand",
    "대만 타이베이": "taiwan", "제주도": "domestic-jeju",
  };
  const productsByCountry: Record<string, Array<{ slug: string; title: string; imageUrl: string; price: string; destination: string }>> = {};
  for (const p of allProducts) {
    const key = Object.entries(DEST_MAP).find(([dest]) => p.destination?.includes(dest.split(" ")[0]))?.[1]
      || p.destination?.toLowerCase().replace(/\s/g, "-") || "other";
    if (!productsByCountry[key]) productsByCountry[key] = [];
    productsByCountry[key].push({
      slug: p.slug,
      title: p.title,
      imageUrl: p.images?.[0]?.url || "",
      price: p.basePrice ? `${p.basePrice.toLocaleString()}원` : "가격 문의",
      destination: p.destination || "",
    });
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main>
        {/* 히어로 — 추후 활성화 */}
        {/* {heroSection && (
          <div className="relative">
            <HeroSection {...heroSection} banners={banners} />
            <div className="flex justify-center flex-wrap gap-2 md:gap-3 py-5">
              {[
                { name: "일본", emoji: "🇯🇵" },
                { name: "태국", emoji: "🇹🇭" },
                { name: "베트남", emoji: "🇻🇳" },
                { name: "대만", emoji: "🇹🇼" },
                { name: "괌·사이판", emoji: "🇬🇺" },
                { name: "국내·제주", emoji: "🏌️" },
              ].map((country) => (
                <Link
                  key={country.name}
                  href={`/tours?country=${country.name}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[color:var(--surface)] hover:bg-[color:var(--border)]/50 text-[13px] text-[color:var(--fg)] font-medium transition-all duration-200 hover:shadow-sm"
                >
                  <span className="text-[15px]">{country.emoji}</span>
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        )} */}

        {/* 1. 3D 지구본 — 국가별 투어 탐색 */}
        <GlobeSection productsByCountry={productsByCountry} />

        {/* 3. 패키지 인기 여행지 (해외) */}
        <AnimateOnScroll animation="fadeUp">
          <PopularDestinationsCarousel
            title="패키지 인기 여행지"
            destinations={PACKAGE_DESTINATIONS}
            href="/tours"
          />
        </AnimateOnScroll>

        {/* 4. 국내 인기 여행지 */}
        <AnimateOnScroll animation="fadeUp">
          <PopularDestinationsCarousel
            title="국내 인기 여행지"
            destinations={DOMESTIC_DESTINATIONS}
            href="/tours"
          />
        </AnimateOnScroll>

        {/* 5. 추천 골프투어 — 4카드 수평 캐러셀 */}
        {featured.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
              <AnimateOnScroll animation="fadeUp">
                <div className="flex items-end justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">추천 골프투어</h2>
                  <Link href="/tours" className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors">
                    전체 보기 →
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeUp" delay={100}>
                <FeaturedTourCarousel items={featured} />
              </AnimateOnScroll>
            </div>
          </section>
        )}

        {/* 6. 신뢰 + CTA */}
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <AnimateOnScroll animation="fadeUp">
              <h2 className="text-2xl md:text-[42px] font-semibold tracking-tight leading-[1.15] mb-6">
                22년간,<br />10,000명의 골퍼가 선택했습니다
              </h2>
              <p className="text-base text-[color:var(--muted)] mb-10 max-w-lg mx-auto leading-relaxed">
                2004년부터 오직 골프여행만 해온 전문 여행사.<br />
                명문 코스 직접 제휴, 맞춤 일정 설계, 현지 전문가 동행.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact" className="inline-flex items-center justify-center h-12 px-8 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                  상담 문의하기
                </Link>
                <a href="tel:1588-0320" className="inline-flex items-center justify-center h-12 px-8 border border-[color:var(--border)] rounded-full text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors">
                  1588-0320
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
