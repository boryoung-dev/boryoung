import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import type { ProductSpotlightConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 단일 상품을 풀스크린 히어로처럼 강조 */
export function ProductSpotlight({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductSpotlightConfig;
  const style = cfg.style || {};
  const heightPreset = cfg.heightPreset || "80vh";
  const overlay = typeof cfg.overlay === "number" ? cfg.overlay : 0.4;
  const ctaLabel = cfg.ctaLabel || "자세히 보기";
  const product = curation.products[0];

  if (!product) return null;

  // 배경 이미지로 상품 이미지 사용 — SectionContainer는 인라인 style로 받지 않으므로
  // 직접 섹션 구성
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: heightPreset,
        backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `rgba(0,0,0,${overlay})` }}
      />
      <div
        className="relative max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col justify-center text-white"
        style={{ minHeight: heightPreset }}
      >
        {curation.subtitle && (
          <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3 text-white/80">
            {curation.subtitle}
          </p>
        )}
        {product.destination && (
          <span className="inline-block self-start text-xs md:text-sm font-medium px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            {product.destination}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] mb-4 max-w-3xl">
          {curation.title || product.title}
        </h2>
        {curation.description && (
          <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed mb-6">
            {curation.description}
          </p>
        )}
        <div className="flex items-baseline gap-3 mb-8">
          {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
            <span className="text-base md:text-lg line-through text-white/60">
              {product.originalPrice.toLocaleString()}원
            </span>
          )}
          {product.basePrice ? (
            <span className="text-2xl md:text-4xl font-bold">
              {product.basePrice.toLocaleString()}원~
            </span>
          ) : (
            <span className="text-xl text-white/80">가격 문의</span>
          )}
        </div>
        <div>
          <Link
            href={`/tours/${product.slug}`}
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}
