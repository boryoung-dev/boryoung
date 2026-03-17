import { homeSections } from "@/content/homeSections";
import { getRankingProducts, getCollectionItems } from "@/lib/home/seed";
import type { HomeSection } from "@/lib/home/types";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { HeroSection } from "./sections/HeroSection";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";
import { SiteFooter } from "../common/SiteFooter";
import { AnimateOnScroll } from "../common/AnimateOnScroll";

// 국가 목적지 데이터
const DESTINATIONS = [
  { name: "일본", desc: "규슈·오키나와·홋카이도 명문 코스", href: "/tours?country=japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { name: "베트남", desc: "다낭·호치민 리조트 골프", href: "/tours?country=vietnam", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { name: "태국", desc: "방콕·치앙마이·파타야 무제한 라운딩", href: "/tours?country=thailand", image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80" },
  { name: "대만", desc: "타이베이 근교 명문 골프장", href: "/tours?country=taiwan", image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80" },
];

export async function HomePage() {
  const heroSection = homeSections.find(
    (s): s is Extract<HomeSection, { type: "hero" }> => s.type === "hero" && s.isVisible
  );

  const now = new Date();
  const [rankingItems, banners] = await Promise.all([
    getRankingProducts(),
    prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // 상위 5개 추천 상품
  const featured = rankingItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-white font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main>
        {/* 1. 풀스크린 히어로 */}
        {heroSection && (
          <div className="relative">
            <HeroSection {...heroSection} banners={banners} />
            {/* 국가 바로가기 (히어로 하단) */}
            <div className="flex justify-center flex-wrap gap-4 md:gap-8 py-5 border-b border-[color:var(--border)]">
              {["일본", "태국", "베트남", "대만", "괌·사이판", "국내·제주"].map((country) => (
                <Link
                  key={country}
                  href={`/tours?country=${country}`}
                  className="text-[12px] md:text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors font-medium"
                >
                  {country}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. 추천 골프투어 — 비대칭 그리드 */}
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

              {/* 비대칭 그리드: 큰 카드 2개 + 작은 카드 3개 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {featured.slice(0, 2).map((item, i) => (
                  <AnimateOnScroll key={item.id} animation="scaleIn" delay={i * 150}>
                    <Link href={item.slug ? `/tours/${item.slug}` : "/tours"} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[color:var(--surface)] block">
                      <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        {item.badges && item.badges.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {item.badges.map((b) => (
                              <span key={b} className="text-[10px] font-medium px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white">{b}</span>
                            ))}
                          </div>
                        )}
                        <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-1">{item.title}</h3>
                        <p className="text-white/60 text-sm">{item.price}</p>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {featured.slice(2, 5).map((item, i) => (
                  <AnimateOnScroll key={item.id} animation="fadeUp" delay={i * 100}>
                    <Link href={item.slug ? `/tours/${item.slug}` : "/tours"} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[color:var(--surface)] block">
                      <img src={item.imageUrl} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-base font-semibold text-white tracking-tight mb-0.5 line-clamp-1">{item.title}</h3>
                        <p className="text-white/60 text-[13px]">{item.price}</p>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. 국가별 여행 — 2x2 대형 그리드 */}
        <section className="py-16 md:py-20 bg-[color:var(--surface)]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <AnimateOnScroll animation="fadeUp">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">여행지</h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DESTINATIONS.map((dest, i) => (
                <AnimateOnScroll key={dest.name} animation="fadeUp" delay={i * 100}>
                  <Link href={dest.href} className="group relative aspect-[16/9] rounded-2xl overflow-hidden block">
                    <img src={dest.image} alt={dest.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                      <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">{dest.name}</h3>
                      <p className="text-white/70 text-sm">{dest.desc}</p>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 신뢰 + CTA */}
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
