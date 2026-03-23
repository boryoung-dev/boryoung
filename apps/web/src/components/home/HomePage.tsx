import { getActiveCurations, getFallbackDealProducts, getFallbackNewProducts, getFallbackFeaturedProducts } from "@/lib/home/curations";
import { getRankingProducts } from "@/lib/home/seed";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { GlobeSection } from "./GlobeSection";
import { PopularDestinationsCarousel } from "./PopularDestinationsCarousel";
import { FeaturedTourCarousel } from "./FeaturedTourCarousel";
import { ProductShowcase } from "./ProductShowcase";
import { SiteHeader } from "../common/SiteHeader";
import { KakaoFloating } from "../common/KakaoFloating";
import { SiteFooter } from "../common/SiteFooter";
import { AnimateOnScroll } from "../common/AnimateOnScroll";

// 기본 여행지 데이터 (destinations_carousel 폴백용)
const DEFAULT_PACKAGE_DESTINATIONS = [
  { name: "나트랑", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80" },
  { name: "다낭", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { name: "장가계", image: "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=800&q=80" },
  { name: "오사카", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { name: "삿포로", image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80" },
  { name: "파리", image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80" },
];

export async function HomePage() {
  // 큐레이션 기반 데이터 로드
  const [curations, allProducts, banners] = await Promise.all([
    getActiveCurations(),
    prisma.tourProduct.findMany({
      where: { isActive: true },
      include: { images: { where: { isThumbnail: true }, take: 1 }, category: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

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

  // 큐레이션이 있으면 큐레이션 기반, 없으면 기존 하드코딩 폴백
  const hasCurations = curations.length > 0;

  return (
    <div className="min-h-screen bg-white font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main>
        {/* 1. 3D 지구본 — 국가별 투어 탐색 (항상 표시) */}
        <GlobeSection productsByCountry={productsByCountry} />

        {hasCurations ? (
          /* 큐레이션 기반 동적 섹션 렌더링 */
          <>
            {curations.map((curation) => (
              <CurationSectionRenderer
                key={curation.id}
                curation={curation}
                banners={banners}
                allProducts={allProducts}
              />
            ))}
          </>
        ) : (
          /* 폴백: 큐레이션 없을 때 기존 하드코딩 섹션 */
          <FallbackSections allProducts={allProducts} />
        )}
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}

// ========================================
// 큐레이션 섹션 렌더러
// ========================================

interface CurationSectionRendererProps {
  curation: Awaited<ReturnType<typeof getActiveCurations>>[number];
  banners: any[];
  allProducts: any[];
}

async function CurationSectionRenderer({ curation, banners, allProducts }: CurationSectionRendererProps) {
  const { sectionType, title, subtitle, description, products, displayConfig, linkUrl } = curation;

  switch (sectionType) {
    case "featured_grid":
      return <FeaturedGridSection curation={curation} />;

    case "product_carousel":
      return <ProductCarouselSection curation={curation} />;

    case "product_showcase":
      return <ProductShowcaseSection curation={curation} />;

    case "destinations_carousel":
      return <DestinationsCarouselSection curation={curation} />;

    case "banner_hero":
      return <BannerHeroSection curation={curation} banners={banners} />;

    case "trust_cta":
      return <TrustCtaSection curation={curation} />;

    default:
      // sectionType이 없는 일반 큐레이션은 product_carousel로 폴백
      if (products.length > 0) {
        return <ProductCarouselSection curation={curation} />;
      }
      return null;
  }
}

// ========================================
// 각 섹션 타입별 컴포넌트
// ========================================

/** 추천 그리드 섹션 (featured_grid) - 2행 3열 카드 그리드 */
async function FeaturedGridSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  // 큐레이션에 상품이 연결되어 있으면 해당 상품, 없으면 자동 추천
  let items;
  if (curation.products.length > 0) {
    items = curation.products.map((p, i) => ({
      id: `${curation.id}-${i}`,
      slug: p.slug,
      title: p.title,
      imageUrl: p.imageUrl,
      price: p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의",
      badges: [p.destination, p.duration].filter(Boolean),
    }));
  } else {
    items = await getFallbackFeaturedProducts();
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <AnimateOnScroll animation="fadeUp">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{curation.title}</h2>
              {curation.subtitle && (
                <p className="text-sm text-[color:var(--muted)] mt-1">{curation.subtitle}</p>
              )}
            </div>
            <Link href={curation.linkUrl || "/tours"} className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors">
              전체 보기 →
            </Link>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fadeUp" delay={100}>
          <FeaturedTourCarousel items={items} />
        </AnimateOnScroll>
      </div>
    </section>
  );
}

/** 상품 캐러셀 섹션 (product_carousel) - 가로 슬라이드 */
async function ProductCarouselSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  let products = curation.products;

  // 상품이 없으면 자동 필터 (특가 또는 신규)
  if (products.length === 0) {
    const titleLower = curation.title.toLowerCase();
    if (titleLower.includes("특가") || titleLower.includes("할인")) {
      products = await getFallbackDealProducts();
    } else {
      products = await getFallbackNewProducts();
    }
  }

  if (products.length === 0) return null;

  return (
    <AnimateOnScroll animation="fadeUp">
      <ProductShowcase
        title={curation.title}
        products={products}
        showMoreHref={curation.linkUrl || "/tours"}
      />
    </AnimateOnScroll>
  );
}

/** 상품 쇼케이스 섹션 (product_showcase) - 탭 필터 포함 */
async function ProductShowcaseSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  let products = curation.products;

  // 상품이 없으면 자동 필터
  if (products.length === 0) {
    const titleLower = curation.title.toLowerCase();
    if (titleLower.includes("특가") || titleLower.includes("할인")) {
      products = await getFallbackDealProducts();
    } else {
      products = await getFallbackNewProducts();
    }
  }

  if (products.length === 0) return null;

  // displayConfig에서 tabs 가져오기
  const tabs = curation.displayConfig?.tabs as string[] | undefined;

  return (
    <AnimateOnScroll animation="fadeUp">
      <ProductShowcase
        title={curation.title}
        products={products}
        tabs={tabs}
        showMoreHref={curation.linkUrl || "/tours"}
      />
    </AnimateOnScroll>
  );
}

/** 여행지 캐러셀 섹션 (destinations_carousel) - 원형 이미지 */
function DestinationsCarouselSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  // displayConfig에서 destinations 가져오기, 없으면 기본값
  const destinations = (curation.displayConfig?.destinations as Array<{ name: string; image: string }>) || DEFAULT_PACKAGE_DESTINATIONS;

  return (
    <AnimateOnScroll animation="fadeUp">
      <PopularDestinationsCarousel
        title={curation.title}
        destinations={destinations}
        href={curation.linkUrl || "/tours"}
      />
    </AnimateOnScroll>
  );
}

/** 배너 히어로 섹션 (banner_hero) */
function BannerHeroSection({ curation, banners }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number]; banners: any[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <AnimateOnScroll animation="fadeUp">
          {curation.title && (
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{curation.title}</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.slice(0, 4).map((banner) => (
              <Link
                key={banner.id}
                href={banner.linkUrl || "/tours"}
                className="group relative aspect-[2/1] rounded-2xl overflow-hidden bg-[color:var(--surface)] block"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-white/70 text-sm">{banner.subtitle}</p>
                  )}
                  {banner.ctaText && (
                    <span className="inline-block mt-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                      {banner.ctaText}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

/** 신뢰 CTA 섹션 (trust_cta) - 텍스트 중심 */
function TrustCtaSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <AnimateOnScroll animation="fadeUp">
          <h2 className="text-2xl md:text-[42px] font-semibold tracking-tight leading-[1.15] mb-6">
            {curation.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < curation.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h2>
          {curation.description && (
            <p className="text-base text-[color:var(--muted)] mb-10 max-w-lg mx-auto leading-relaxed">
              {curation.description.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < (curation.description?.split("\n").length ?? 1) - 1 && <br />}
                </span>
              ))}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={curation.linkUrl || "/contact"}
              className="inline-flex items-center justify-center h-12 px-8 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              상담 문의하기
            </Link>
            <a
              href="tel:1588-0320"
              className="inline-flex items-center justify-center h-12 px-8 border border-[color:var(--border)] rounded-full text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors"
            >
              1588-0320
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

// ========================================
// 폴백: 큐레이션이 없을 때 기존 하드코딩
// ========================================

async function FallbackSections({ allProducts }: { allProducts: any[] }) {
  const [rankingItems, dealProducts, newProducts] = await Promise.all([
    getRankingProducts(),
    getFallbackDealProducts(),
    getFallbackNewProducts(),
  ]);

  return (
    <>
      {/* 패키지 인기 여행지 */}
      <AnimateOnScroll animation="fadeUp">
        <PopularDestinationsCarousel
          title="패키지 인기 여행지"
          destinations={DEFAULT_PACKAGE_DESTINATIONS}
          href="/tours"
        />
      </AnimateOnScroll>

      {/* 추천 골프투어 */}
      {rankingItems.length > 0 && (
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
              <FeaturedTourCarousel items={rankingItems} />
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* 이번 주 특가 골프투어 */}
      {dealProducts.length > 0 && (
        <ProductShowcase
          title="이번 주 특가 골프투어"
          products={dealProducts}
          tabs={["전체", "일본", "태국", "베트남", "대만", "제주"]}
          showMoreHref="/tours"
        />
      )}

      {/* 신규 등록 골프투어 */}
      {newProducts.length > 0 && (
        <ProductShowcase
          title="신규 등록 골프투어"
          products={newProducts}
          showMoreHref="/tours"
        />
      )}

      {/* 신뢰 + CTA */}
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
    </>
  );
}
