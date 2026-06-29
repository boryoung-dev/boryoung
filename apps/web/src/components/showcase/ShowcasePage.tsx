import Link from "next/link";
import type {
  ShowcaseData,
  ShowcaseDestination,
  ShowcaseProduct,
  ShowcaseQuickIcon,
} from "./types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&q=85";

function formatPrice(value: number | null) {
  if (!value) return "상담 문의";
  return `${value.toLocaleString()}원~`;
}

function discountRate(product: ShowcaseProduct) {
  if (!product.basePrice || !product.originalPrice || product.originalPrice <= product.basePrice) {
    return null;
  }
  return Math.round((1 - product.basePrice / product.originalPrice) * 100);
}

/* ----------------------------------------------------------------------------
 * 공통 프리미티브 — 프로젝트 디자인 토큰(--fg/--muted/--border/--accent) 기반
 * -------------------------------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
      {children}
    </p>
  );
}

function SectionHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-[color:var(--fg)] md:text-[44px]">
          {title}
        </h2>
        {description && (
          <p className="mt-5 text-base leading-[1.75] text-[color:var(--muted)] md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--fg)] transition-colors hover:text-[color:var(--accent)]"
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

function QuickLink({ item }: { item: ShowcaseQuickIcon }) {
  return (
    <Link
      href={item.linkUrl}
      className="rounded-full border border-[color:var(--border)] bg-white/70 px-5 py-2.5 text-sm font-medium text-[color:var(--fg)] backdrop-blur-md transition-all duration-300 hover:border-[color:var(--fg)] hover:bg-white"
    >
      {item.label}
    </Link>
  );
}

/* ----------------------------------------------------------------------------
 * 상품 카드
 * -------------------------------------------------------------------------- */

/** 메타 정보 한 줄 (일정 · 출발 · 홀수) */
function ProductMeta({ product, tone = "dark" }: { product: ShowcaseProduct; tone?: "dark" | "light" }) {
  const sep = tone === "light" ? "text-white/40" : "text-[color:var(--border)]";
  const text = tone === "light" ? "text-white/80" : "text-[color:var(--muted)]";
  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] font-medium ${text}`}>
      <span>{product.duration || "일정 문의"}</span>
      {product.departure && (
        <>
          <span className={sep}>·</span>
          <span>{product.departure} 출발</span>
        </>
      )}
      {product.totalHoles && (
        <>
          <span className={sep}>·</span>
          <span>{product.totalHoles}홀</span>
        </>
      )}
    </div>
  );
}

/** Lead — 단일 상품을 시네마틱 풀블리드 카드로 강조 (좌우 분할 대신 고정 높이 오버레이) */
function LeadCard({ product }: { product: ShowcaseProduct }) {
  const discount = discountRate(product);

  return (
    <Link
      href={`/tours/${product.slug}`}
      className="group relative block h-[440px] overflow-hidden rounded-[28px] bg-[color:var(--surface)] md:h-[560px]"
    >
      <img
        src={product.imageUrl || FALLBACK_IMAGE}
        alt={product.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

      <div className="absolute left-5 top-5 flex items-center gap-2">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-tight text-white backdrop-blur-md">
          {product.destination}
        </span>
        {discount && (
          <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold tracking-tight text-[color:var(--accent-foreground)]">
            {discount}% 특가
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-11">
        <div className="max-w-2xl">
          <ProductMeta product={product} tone="light" />
          <h3 className="mt-3 text-[28px] font-semibold leading-[1.14] tracking-[-0.02em] md:text-[42px]">
            {product.title}
          </h3>
          <p className="mt-3 hidden max-w-xl text-[15px] leading-relaxed text-white/75 md:line-clamp-2 md:text-base">
            {product.excerpt || product.subtitle || `${product.categoryName} 일정으로 구성된 해외 골프여행입니다.`}
          </p>
          <div className="mt-6 flex items-center gap-5">
            <span className="text-2xl font-semibold tracking-tight md:text-3xl">{formatPrice(product.basePrice)}</span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-transform duration-300 group-hover:translate-x-1">
              자세히 보기 <span>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: ShowcaseProduct }) {
  const discount = discountRate(product);

  return (
    <Link
      href={`/tours/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-[color:var(--border)] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface)]">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        {discount && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-[color:var(--accent)] px-2.5 py-1 text-[11px] font-semibold tracking-tight text-[color:var(--accent-foreground)]">
            {discount}% 특가
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        <p className="absolute bottom-3 left-4 text-[12px] font-medium tracking-wide text-white/90">{product.destination}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <ProductMeta product={product} />
        <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[color:var(--fg)]">
          {product.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="text-lg font-semibold tracking-tight text-[color:var(--fg)]">{formatPrice(product.basePrice)}</span>
          <span className="text-[13px] font-medium text-[color:var(--muted)] transition-colors group-hover:text-[color:var(--accent)]">
            자세히 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function DestinationCard({ destination }: { destination: ShowcaseDestination }) {
  return (
    <Link
      href={`/tours?category=${destination.slug}`}
      className="group relative block min-h-[300px] overflow-hidden rounded-[26px] bg-[color:var(--surface)]"
    >
      <img
        src={destination.leadImage || FALLBACK_IMAGE}
        alt={destination.name}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="text-[13px] font-medium text-white/75">{destination.productCount}개 일정</p>
        <h3 className="mt-1.5 text-2xl font-semibold tracking-tight">{destination.name}</h3>
        <p className="mt-1 text-sm font-medium text-white/80">
          {destination.minPrice ? `${destination.minPrice.toLocaleString()}원부터` : "맞춤 상담 가능"}
        </p>
      </div>
    </Link>
  );
}

/* ----------------------------------------------------------------------------
 * 페이지
 * -------------------------------------------------------------------------- */

export function ShowcasePage({ data }: { data: ShowcaseData }) {
  const heroBanner = data.banners[0];
  const heroImage = heroBanner?.imageUrl || data.featuredProducts[0]?.imageUrl || FALLBACK_IMAGE;
  const heroTitle = heroBanner?.title || "보령항공여행사 해외 골프투어";
  const heroSubtitle =
    heroBanner?.subtitle ||
    "항공, 숙박, 라운딩, 현지 이동까지 한 번에 정리하는 해외 골프여행 전문 데스크";
  const mainCuration = data.curations.find((curation) => curation.products.length > 0);
  const editorialProducts = mainCuration?.products.slice(0, 5) ?? data.featuredProducts.slice(0, 5);
  const leadProduct = editorialProducts[0] ?? data.featuredProducts[0];
  const secondaryProducts = [
    ...editorialProducts.slice(1),
    ...data.featuredProducts.filter(
      (product) => !editorialProducts.some((editorialProduct) => editorialProduct.id === product.id),
    ),
  ].slice(0, 4);
  const dealProducts = data.dealProducts.length > 0 ? data.dealProducts.slice(0, 4) : data.featuredProducts.slice(0, 4);
  const quickLinks =
    data.quickIcons.length > 0
      ? data.quickIcons.slice(0, 6)
      : [
          { label: "일본 골프", iconName: "flag", linkUrl: "/tours?category=japan" },
          { label: "태국 골프", iconName: "plane", linkUrl: "/tours?category=thailand" },
          { label: "특가 상품", iconName: "star", linkUrl: "/tours" },
          { label: "단체 상담", iconName: "users", linkUrl: "/contact" },
        ];

  return (
    <main className="bg-white text-[color:var(--fg)]">
      {/* 히어로 */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <img
          src={heroImage}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px] flex-col justify-end px-5 pb-14 pt-24 md:px-8 md:pb-20">
          <div className="max-w-4xl text-white">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-medium tracking-tight text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              22년 해외 골프여행 전문 상담
            </p>
            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[68px] lg:text-[76px]">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-white/80 md:text-xl">
              {heroSubtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={heroBanner?.linkUrl || "/tours"}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold tracking-tight text-[color:var(--fg)] transition-all duration-300 hover:bg-white/90"
              >
                {heroBanner?.ctaText || "대표 상품 보기"}
                <span>→</span>
              </Link>
              <a
                href="tel:1588-0320"
                className="inline-flex h-[54px] items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-base font-semibold tracking-tight text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
              >
                1588-0320
              </a>
            </div>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 divide-x divide-white/15 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-center backdrop-blur-md">
            {[
              ["상품", `${data.stats.productCount}+`],
              ["목적지", `${data.stats.destinationCount}`],
              ["리뷰", `${data.stats.reviewCount}`],
            ].map(([label, value]) => (
              <div key={label} className="px-3 py-5">
                <p className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{value}</p>
                <p className="mt-1 text-[13px] font-medium text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 퀵 링크 */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="-mt-7 flex flex-wrap gap-2.5 rounded-2xl border border-[color:var(--border)] bg-white/80 p-4 shadow-[var(--shadow-card)] backdrop-blur-xl">
          {quickLinks.map((item) => (
            <QuickLink key={`${item.label}-${item.linkUrl}`} item={item} />
          ))}
        </div>
      </section>

      {/* 에디토리얼 추천 */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <SectionHead
          eyebrow={mainCuration?.subtitle || "Selected Tours"}
          title={mainCuration?.title || "이번 시즌 바로 상담하기 좋은 골프투어"}
          description={
            mainCuration?.description ||
            "실제 출발 조건, 숙소 동선, 라운딩 구성까지 확인해 상담하기 좋은 일정만 추렸습니다."
          }
          action={
            <Link
              href={mainCuration?.linkUrl || "/tours"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--fg)] px-7 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              전체 상품 보기 <span>→</span>
            </Link>
          }
        />

        <div className="mt-12">{leadProduct && <LeadCard product={leadProduct} />}</div>
        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {secondaryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 목적지 */}
      <section className="bg-[color:var(--surface)] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            eyebrow="Destinations"
            title="목적지마다 다른 라운딩의 분위기"
            description="가까운 단기 일정부터 휴양지 라운딩까지, 등록된 상품을 기준으로 대표 목적지를 보여드립니다."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {data.destinations.slice(0, 8).map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      </section>

      {/* 특가 */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <SectionHead
          eyebrow="Good Value"
          title="가격과 일정이 편하게 비교되는 상품"
          action={<GhostLink href="/contact">맞춤 견적 상담</GhostLink>}
        />
        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 트래블 케어 (다크) */}
      <section className="bg-[color:var(--fg)] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="max-w-md">
            <Eyebrow>Travel Care</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.14] tracking-[-0.02em] md:text-[44px]">
              출발 전까지 편하게 확인하실 수 있게 정리합니다
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "항공·숙박·라운딩 동선 확인"],
              ["02", "부부·지인·단체 일정 상담"],
              ["03", "짧은 일정과 장기 체류 모두 대응"],
              ["04", "현지 이동과 포함 사항 사전 안내"],
            ].map(([num, title]) => (
              <div
                key={num}
                className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 transition-colors duration-300 hover:bg-white/10"
              >
                <p className="text-sm font-semibold tracking-tight text-[color:var(--accent)]">{num}</p>
                <p className="mt-3 text-lg font-medium leading-snug text-white/92">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 매거진 */}
      {data.posts.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
          <SectionHead
            eyebrow="Travel Notes"
            title="상담 전에 읽어두면 좋은 골프여행 이야기"
            action={<GhostLink href="/magazine">매거진 보기</GhostLink>}
          />
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {data.posts.map((post) => (
              <Link
                key={post.slug}
                href={`/magazine/${post.slug}`}
                className="group overflow-hidden rounded-[26px] border border-[color:var(--border)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                {post.thumbnail && (
                  <div className="aspect-[3/2] overflow-hidden bg-[color:var(--surface)]">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                    {post.category || "Golf Guide"}
                  </p>
                  <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug tracking-[-0.01em] text-[color:var(--fg)]">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-[color:var(--muted)]">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Eyebrow>Golf Travel Desk</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.14] tracking-[-0.02em] text-[color:var(--fg)] md:text-[44px]">
                일정, 예산, 인원만 알려주시면 맞춤 견적으로 정리합니다
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="tel:1588-0320"
                className="inline-flex h-[54px] items-center justify-center rounded-full bg-[color:var(--fg)] px-8 text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
              >
                1588-0320
              </a>
              <Link
                href="/contact"
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-8 text-base font-semibold tracking-tight text-[color:var(--fg)] transition-colors hover:border-[color:var(--fg)]"
              >
                문의 남기기 <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
