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
  const [productsByTab, rankingItems, collectionItems, banners, dbQuickIcons] = await Promise.all([
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
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
