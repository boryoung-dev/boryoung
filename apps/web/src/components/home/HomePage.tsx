import Link from "next/link";
import { homeSections } from "@/content/homeSections";
import { getHomeProductsByTab, getRankingProducts, getCollectionItems } from "@/lib/home/seed";
import type { HomeSection, HomeTabKey } from "@/lib/home/types";
import { prisma } from "@/lib/prisma";

import { CategoryTabsSection } from "./sections/CategoryTabsSection.client";
import { QuickIconsSection } from "./sections/QuickIconsSection";
import { HeroSection } from "./sections/HeroSection";
import { RankingSection } from "./sections/RankingSection";
import { CollectionSection } from "./sections/CollectionSection";
import { CountrySection } from "./sections/CountrySection";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";
import { SiteFooter } from "../common/SiteFooter";

// 메인에 개별 섹션으로 보여줄 국가 목록
const COUNTRY_SECTIONS: { key: HomeTabKey; title: string; subtitle: string; bg: string }[] = [
  { key: "JAPAN", title: "일본 골프여행 추천", subtitle: "시내골프·골프텔·명문코스 다양한 구성", bg: "bg-white" },
  { key: "VIETNAM", title: "베트남 골프여행 추천", subtitle: "다낭·호치민·하노이 리조트 골프", bg: "bg-[color:var(--surface)]" },
  { key: "THAILAND", title: "태국 골프여행 추천", subtitle: "방콕·치앙마이·파타야 무제한 라운딩", bg: "bg-white" },
  { key: "TAIWAN", title: "대만 골프여행 추천", subtitle: "타이베이 근교 명문 골프장", bg: "bg-[color:var(--surface)]" },
];

export async function HomePage() {
  const categoryTabs = homeSections.find(
    (s): s is Extract<HomeSection, { type: "categoryTabs" }> => s.type === "categoryTabs"
  );

  // DB에서 데이터 가져오기
  const now = new Date();
  const [productsByTab, rankingItems, collectionItems, banners, dbQuickIcons, recentMagazines] = await Promise.all([
    getHomeProductsByTab(categoryTabs?.itemsPerTab ?? 8),
    getRankingProducts(),
    getCollectionItems(),
    prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.quickIcon.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    // 최근 발행된 매거진 3개 조회
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        category: true,
        publishedAt: true,
      },
    }),
  ]);

  // 섹션별 데이터 준비
  const heroSection = homeSections.find((s): s is Extract<HomeSection, { type: "hero" }> => s.type === "hero" && s.isVisible);
  const quickIconsSection = homeSections.find((s): s is Extract<HomeSection, { type: "quickIcons" }> => s.type === "quickIcons" && s.isVisible);
  const rankingSection = homeSections.find((s): s is Extract<HomeSection, { type: "ranking" }> => s.type === "ranking" && s.isVisible);
  const collectionSection = homeSections.find((s): s is Extract<HomeSection, { type: "collection" }> => s.type === "collection" && s.isVisible);
  const categoryTabsSection = homeSections.find((s): s is Extract<HomeSection, { type: "categoryTabs" }> => s.type === "categoryTabs" && s.isVisible);

  const quickIconItems = dbQuickIcons.length > 0
    ? dbQuickIcons.map(q => ({ label: q.label, iconName: q.iconName, linkUrl: q.linkUrl }))
    : quickIconsSection?.items || [];

  const rankItems = rankingItems.length > 0 ? rankingItems : rankingSection?.items || [];
  const collItems = collectionItems.length > 0 ? collectionItems : collectionSection?.items || [];

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />

      <main className="flex flex-col w-full">
        {/* 1. 히어로 배너 */}
        {heroSection && (
          <HeroSection {...heroSection} banners={banners} />
        )}

        {/* 2. 퀵 아이콘 (국가 바로가기) */}
        {quickIconsSection && (
          <QuickIconsSection {...quickIconsSection} items={quickIconItems} />
        )}

        {/* 3. MD추천 및 베스트상품 */}
        {rankingSection && (
          <RankingSection {...rankingSection} items={rankItems} />
        )}

        {/* 4. 국가별 추천 골프여행 (가로 스크롤 카드) */}
        {collectionSection && (
          <CollectionSection {...collectionSection} items={collItems} />
        )}

        {/* 5. 국가별 개별 섹션: 일본 → 베트남 → 태국 → 대만 */}
        {COUNTRY_SECTIONS.map((country) => (
          <CountrySection
            key={country.key}
            title={country.title}
            subtitle={country.subtitle}
            tabKey={country.key}
            products={productsByTab[country.key] || []}
            bgColor={country.bg}
          />
        ))}

        {/* 6. 전체 국가별 탭 (나머지 국가 포함) */}
        {categoryTabsSection && (
          <CategoryTabsSection
            title={categoryTabsSection.title}
            tabs={categoryTabsSection.tabs}
            productsByTab={productsByTab}
          />
        )}

        {/* 7. 이용 프로세스 */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-2">How it works</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">간편한 예약 프로세스</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { num: "1", title: "상품 탐색", desc: "다양한 골프투어 상품을 비교하세요" },
                { num: "2", title: "상담 문의", desc: "전화 또는 온라인으로 문의하세요" },
                { num: "3", title: "예약 확정", desc: "일정과 인원을 확인 후 확정합니다" },
                { num: "4", title: "출발", desc: "준비된 일정대로 출발합니다" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-[40px] md:text-[48px] font-extralight text-[color:var(--border)] mb-3 leading-none">
                    {item.num}
                  </div>
                  <h3 className="text-[15px] font-semibold text-[color:var(--fg)] mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-[color:var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. 매거진 프리뷰 */}
        {recentMagazines.length > 0 && (
          <section className="py-8 md:py-10 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-2">Magazine</p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">골프여행 매거진</h2>
                </div>
                <Link href="/magazine" className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors">
                  더보기
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recentMagazines.map((post) => (
                  <Link key={post.id} href={`/magazine/${post.slug}`} className="group">
                    <div className="aspect-[3/2] rounded-xl overflow-hidden bg-[color:var(--surface)] mb-3">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)]">
                          <span>매거진</span>
                        </div>
                      )}
                    </div>
                    {post.category && (
                      <span className="text-[11px] font-medium text-[color:var(--muted)] uppercase tracking-wider mb-1 block">{post.category}</span>
                    )}
                    <h3 className="text-[15px] font-medium text-[color:var(--fg)] line-clamp-2 leading-snug group-hover:text-[color:var(--brand)] transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
