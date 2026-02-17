import { homeSections } from "@/content/homeSections";
import { getHomeProductsByTab, getRankingProducts, getCollectionItems } from "@/lib/home/seed";
import type { HomeSection } from "@/lib/home/types";
import { prisma } from "@/lib/prisma";

import { CurationsSection } from "./sections/CurationsSection";
import { CategoryTabsSection } from "./sections/CategoryTabsSection.client";
import { QuickIconsSection } from "./sections/QuickIconsSection";
import { HeroSection } from "./sections/HeroSection";
import { RankingSection } from "./sections/RankingSection";
import { CollectionSection } from "./sections/CollectionSection";
import { MagazineSection } from "./sections/MagazineSection";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";
import { SiteFooter } from "../common/SiteFooter";

export async function HomePage() {
  const categoryTabs = homeSections.find(
    (s): s is Extract<HomeSection, { type: "categoryTabs" }> => s.type === "categoryTabs"
  );

  // DB에서 데이터 가져오기
  const now = new Date();
  const [productsByTab, rankingItems, collectionItems, banners, blogPosts, dbCurations, dbQuickIcons] = await Promise.all([
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
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.curation.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.quickIcon.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--fg)] antialiased selection:bg-[color:var(--brand)] selection:text-white">
      <SiteHeader />
      
      <main className="flex flex-col w-full">
        {homeSections
          .filter((s) => s.isVisible)
          .map((section, idx) => {
            const key = `${section.type}_${idx}`;
            
            if (section.type === "hero") {
              return <HeroSection key={key} {...section} banners={banners} />;
            }

            if (section.type === "quickIcons") {
              const items = dbQuickIcons.length > 0
                ? dbQuickIcons.map(q => ({ label: q.label, iconName: q.iconName, linkUrl: q.linkUrl }))
                : section.items;
              return <QuickIconsSection key={key} {...section} items={items} />;
            }

            if (section.type === "ranking") {
              // DB 데이터가 있으면 사용, 없으면 하드코딩 데이터
              const items = rankingItems.length > 0 ? rankingItems : section.items;
              return <RankingSection key={key} {...section} items={items} />;
            }

            if (section.type === "collection") {
              // DB 데이터가 있으면 사용, 없으면 하드코딩 데이터
              const items = collectionItems.length > 0 ? collectionItems : section.items;
              return <CollectionSection key={key} {...section} items={items} />;
            }

            if (section.type === "categoryTabs") {
              return (
                <CategoryTabsSection
                  key={key}
                  title={section.title}
                  tabs={section.tabs}
                  productsByTab={productsByTab}
                />
              );
            }

            if (section.type === "curations") {
              const items = dbCurations.length > 0
                ? dbCurations.map(c => ({ id: c.id, title: c.title, description: c.description || '', imageUrl: c.imageUrl || undefined, linkUrl: c.linkUrl || undefined }))
                : section.items;
              return <CurationsSection key={key} title={section.title} items={items} />;
            }

            if (section.type === "magazine") {
              const items = blogPosts.length > 0
                ? blogPosts.map(p => ({ id: p.id, slug: p.slug, category: p.category || '팁', title: p.title, description: p.excerpt || '', imageUrl: p.thumbnail || '' }))
                : section.items;
              return <MagazineSection key={key} {...section} items={items} />;
            }

            return null;
          })}
      </main>

      <SiteFooter />

      <KakaoFloating />
    </div>
  );
}
