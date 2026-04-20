import { getActiveCurations, getFallbackDealProducts, getFallbackNewProducts, getFallbackFeaturedProducts } from "@/lib/home/curations";
import { getRankingProducts } from "@/lib/home/seed";
import { getGlobeDestinations } from "@/lib/home/globe";
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

// 공용 섹션 시스템 (배경/풀와이드/패딩/폰트/정렬/엣지페이드)
import { SectionContainer } from "./sections/_shared/SectionContainer";
import { SectionHeading } from "./sections/_shared/SectionHeading";
import type { SectionStyleConfig } from "./sections/_shared/types";

// 신규 섹션 컴포넌트
import { FullBleedHero } from "./sections/FullBleedHero";
import { GradientBanner } from "./sections/GradientBanner";
import { StorySplit } from "./sections/StorySplit";
import { StatHighlights } from "./sections/StatHighlights";
import { FeatureCards } from "./sections/FeatureCards";
import { TestimonialSlider } from "./sections/TestimonialSlider";
import { ProcessSteps } from "./sections/ProcessSteps";
import { CtaCentered } from "./sections/CtaCentered";
import { ImageGallery } from "./sections/ImageGallery";
import { RichText } from "./sections/RichText";
import { VideoHero } from "./sections/VideoHero";
import { LogoWall } from "./sections/LogoWall";
import { FaqAccordion } from "./sections/FaqAccordion";
import { PriceTable } from "./sections/PriceTable";
import { Timeline } from "./sections/Timeline";
import { ComparisonTable } from "./sections/ComparisonTable";
import { IconCallouts } from "./sections/IconCallouts";
import { QuoteBlock } from "./sections/QuoteBlock";
import { AwardsBadges } from "./sections/AwardsBadges";
import { FeatureAlternating } from "./sections/FeatureAlternating";

// 신규 상품 섹션 (21~30)
import { ProductMasonry } from "./sections/ProductMasonry";
import { ProductMagazine } from "./sections/ProductMagazine";
import { ProductSpotlight } from "./sections/ProductSpotlight";
import { ProductSplitCarousel } from "./sections/ProductSplitCarousel";
import { ProductCompactList } from "./sections/ProductCompactList";
import { ProductHeroBanner } from "./sections/ProductHeroBanner";
import { ProductTabsCountry } from "./sections/ProductTabsCountry";
import { ProductDealGrid } from "./sections/ProductDealGrid";
import { ProductPolaroidCarousel } from "./sections/ProductPolaroidCarousel";
import { ProductOverlapGrid } from "./sections/ProductOverlapGrid";

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
  const [curations, allProducts, banners, destinations] = await Promise.all([
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
    getGlobeDestinations(),
  ]);

  // 지구본 섹션 텍스트 설정 (별도 큐레이션 행 sectionType="globe_3d"로 저장)
  const globeConfig = curations.find((c) => c.sectionType === "globe_3d") ?? null;
  // 일반 렌더링 큐레이션 (globe_3d 제외)
  const renderableCurations = curations.filter((c) => c.sectionType !== "globe_3d");
  const hasCurations = renderableCurations.length > 0;

  return (
    <div className="min-h-screen bg-white font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      <main>
        {/* 1. 3D 지구본 — 국가별 투어 탐색 (항상 표시) */}
        <GlobeSection
          destinations={destinations}
          eyebrow={globeConfig?.subtitle ?? undefined}
          title={globeConfig?.title ?? undefined}
          description={globeConfig?.description ?? undefined}
        />

        {hasCurations ? (
          /* 큐레이션 기반 동적 섹션 렌더링 */
          <>
            {renderableCurations.map((curation) => (
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

    case "full_bleed_hero":
      return <FullBleedHero curation={curation} />;
    case "gradient_banner":
      return <GradientBanner curation={curation} />;
    case "story_split":
      return <StorySplit curation={curation} />;
    case "stat_highlights":
      return <StatHighlights curation={curation} />;
    case "feature_cards":
      return <FeatureCards curation={curation} />;
    case "testimonial_slider":
      return <TestimonialSlider curation={curation} />;
    case "process_steps":
      return <ProcessSteps curation={curation} />;
    case "cta_centered":
      return <CtaCentered curation={curation} />;
    case "image_gallery":
      return <ImageGallery curation={curation} />;
    case "rich_text":
      return <RichText curation={curation} />;
    case "video_hero":
      return <VideoHero curation={curation} />;
    case "logo_wall":
      return <LogoWall curation={curation} />;
    case "faq_accordion":
      return <FaqAccordion curation={curation} />;
    case "price_table":
      return <PriceTable curation={curation} />;
    case "timeline":
      return <Timeline curation={curation} />;
    case "comparison_table":
      return <ComparisonTable curation={curation} />;
    case "icon_callouts":
      return <IconCallouts curation={curation} />;
    case "quote_block":
      return <QuoteBlock curation={curation} />;
    case "awards_badges":
      return <AwardsBadges curation={curation} />;
    case "feature_alternating":
      return <FeatureAlternating curation={curation} />;

    // 신규 상품 섹션 (21~30)
    case "product_masonry":
      return <ProductMasonry curation={curation} />;
    case "product_magazine":
      return <ProductMagazine curation={curation} />;
    case "product_spotlight":
      return <ProductSpotlight curation={curation} />;
    case "product_split_carousel":
      return <ProductSplitCarousel curation={curation} />;
    case "product_compact_list":
      return <ProductCompactList curation={curation} />;
    case "product_hero_banner":
      return <ProductHeroBanner curation={curation} />;
    case "product_tabs_country":
      return <ProductTabsCountry curation={curation} />;
    case "product_deal_grid":
      return <ProductDealGrid curation={curation} />;
    case "product_polaroid_carousel":
      return <ProductPolaroidCarousel curation={curation} />;
    case "product_overlap_grid":
      return <ProductOverlapGrid curation={curation} />;

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

/** displayConfig.style 안전 추출 — 타입은 SectionStyleConfig로 좁힘 */
function getStyle(curation: { displayConfig?: any }): SectionStyleConfig {
  return (curation.displayConfig?.style ?? {}) as SectionStyleConfig;
}

/** "전체 보기 →" 링크 (테마 따라 색상 변환) */
function ViewAllLink({ href, textTheme }: { href: string; textTheme?: "light" | "dark" }) {
  const cls =
    textTheme === "light"
      ? "text-[13px] text-white/70 hover:text-white transition-colors"
      : "text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors";
  return (
    <Link href={href} className={cls}>
      전체 보기 →
    </Link>
  );
}

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

  const style = getStyle(curation);

  return (
    <SectionContainer style={style}>
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            style={style}
            action={
              curation.linkUrl !== null ? (
                <ViewAllLink href={curation.linkUrl || "/tours"} textTheme={style.textTheme} />
              ) : undefined
            }
          />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll animation="fadeUp" delay={100}>
        <FeaturedTourCarousel items={items} />
      </AnimateOnScroll>
    </SectionContainer>
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

  const style = getStyle(curation);

  return (
    <SectionContainer style={style}>
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-5">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            style={style}
            action={
              curation.linkUrl !== null ? (
                <ViewAllLink href={curation.linkUrl || "/tours"} textTheme={style.textTheme} />
              ) : undefined
            }
          />
        </div>
        <ProductShowcase
          title={curation.title}
          products={products}
          showMoreHref={curation.linkUrl || "/tours"}
          bare
          headingSlot={null}
        />
      </AnimateOnScroll>
    </SectionContainer>
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
  const style = getStyle(curation);

  return (
    <SectionContainer style={style}>
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-5">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            style={style}
            action={
              curation.linkUrl !== null ? (
                <ViewAllLink href={curation.linkUrl || "/tours"} textTheme={style.textTheme} />
              ) : undefined
            }
          />
        </div>
        <ProductShowcase
          title={curation.title}
          products={products}
          tabs={tabs}
          showMoreHref={curation.linkUrl || "/tours"}
          bare
          headingSlot={null}
        />
      </AnimateOnScroll>
    </SectionContainer>
  );
}

/** 여행지 캐러셀 섹션 (destinations_carousel) - 원형 이미지 */
function DestinationsCarouselSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  // displayConfig에서 destinations 가져오기, 없으면 기본값
  const destinations = (curation.displayConfig?.destinations as Array<{ name: string; image: string }>) || DEFAULT_PACKAGE_DESTINATIONS;
  const style = getStyle(curation);

  return (
    <SectionContainer style={style}>
      <AnimateOnScroll animation="fadeUp">
        <div className="mb-6">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            style={style}
            action={
              curation.linkUrl !== null ? (
                <ViewAllLink href={curation.linkUrl || "/tours"} textTheme={style.textTheme} />
              ) : undefined
            }
          />
        </div>
        <PopularDestinationsCarousel
          title={curation.title}
          destinations={destinations}
          href={curation.linkUrl || "/tours"}
          bare
          headingSlot={null}
        />
      </AnimateOnScroll>
    </SectionContainer>
  );
}

/** 배너 히어로 섹션 (banner_hero) */
function BannerHeroSection({ curation, banners }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number]; banners: any[] }) {
  if (banners.length === 0) return null;

  // 기본 verticalPadding을 sm으로 (기존 py-8 md:py-12)
  const rawStyle = getStyle(curation);
  const style: SectionStyleConfig = {
    verticalPadding: "sm",
    ...rawStyle,
  };

  return (
    <SectionContainer style={style}>
      <AnimateOnScroll animation="fadeUp">
        {(curation.title || curation.subtitle) && (
          <div className="mb-6">
            <SectionHeading
              eyebrow={curation.subtitle}
              title={curation.title}
              style={style}
            />
          </div>
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
    </SectionContainer>
  );
}

/** 신뢰 CTA 섹션 (trust_cta) - 텍스트 중심 */
function TrustCtaSection({ curation }: { curation: Awaited<ReturnType<typeof getActiveCurations>>[number] }) {
  // 리터럴 \n과 실제 개행 모두 줄바꿈으로 처리
  const titleLines = curation.title.replace(/\\n/g, "\n").split("\n");
  const descLines = curation.description
    ? curation.description.replace(/\\n/g, "\n").split("\n")
    : [];
  // 기본값: 중앙 정렬 + xl 패딩 (기존 py-20 md:py-28)
  const rawStyle = getStyle(curation);
  const style: SectionStyleConfig = {
    verticalPadding: "xl",
    textAlign: "center",
    ...rawStyle,
  };
  // CTA 버튼 색상 (다크/라이트 테마 대응)
  const isLight = style.textTheme === "light";
  const primaryBtnCls = isLight
    ? "inline-flex items-center justify-center h-12 px-8 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
    : "inline-flex items-center justify-center h-12 px-8 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity";
  const outlineBtnCls = isLight
    ? "inline-flex items-center justify-center h-12 px-8 border border-white/60 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors"
    : "inline-flex items-center justify-center h-12 px-8 border border-[color:var(--border)] rounded-full text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors";
  // 전화번호 (displayConfig.phone) — 없으면 기본
  const phone = (curation.displayConfig?.phone as string | undefined) || "1588-0320";

  return (
    <SectionContainer style={style}>
      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll animation="fadeUp">
          <h2
            className={`text-2xl md:text-[42px] font-semibold tracking-tight leading-[1.15] mb-6 ${
              isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
            }`}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          {curation.description && (
            <p
              className={`text-base mb-10 max-w-lg mx-auto leading-relaxed ${
                isLight ? "text-white/80" : "text-[color:var(--muted)]"
              }`}
            >
              {descLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < descLines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={curation.linkUrl || "/contact"} className={primaryBtnCls}>
              상담 문의하기
            </Link>
            <a href={`tel:${phone}`} className={outlineBtnCls}>
              {phone}
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </SectionContainer>
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
