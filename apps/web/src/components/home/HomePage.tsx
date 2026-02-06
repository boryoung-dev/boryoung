import { homeSections } from "@/content/homeSections";
import { getHomeProductsByTab, getRankingProducts, getCollectionItems } from "@/lib/home/seed";
import type { HomeSection } from "@/lib/home/types";

import { CurationsSection } from "./sections/CurationsSection";
import { CategoryTabsSection } from "./sections/CategoryTabsSection.client";
import { QuickIconsSection } from "./sections/QuickIconsSection";
import { HeroSection } from "./sections/HeroSection";
import { RankingSection } from "./sections/RankingSection";
import { CollectionSection } from "./sections/CollectionSection";
import { MagazineSection } from "./sections/MagazineSection";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";

export async function HomePage() {
  const categoryTabs = homeSections.find(
    (s): s is Extract<HomeSection, { type: "categoryTabs" }> => s.type === "categoryTabs"
  );

  // DB에서 데이터 가져오기
  const [productsByTab, rankingItems, collectionItems] = await Promise.all([
    getHomeProductsByTab(categoryTabs?.itemsPerTab ?? 8),
    getRankingProducts(),
    getCollectionItems(),
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
              return <HeroSection key={key} {...section} />;
            }

            if (section.type === "quickIcons") {
              return <QuickIconsSection key={key} {...section} />;
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
              return (
                <CurationsSection
                  key={key}
                  title={section.title}
                  items={section.items}
                />
              );
            }

            if (section.type === "magazine") {
              return <MagazineSection key={key} {...section} />;
            }

            return null;
          })}
      </main>

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
