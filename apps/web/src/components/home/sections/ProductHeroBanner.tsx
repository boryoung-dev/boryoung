import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import type { ProductHeroBannerConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 첫 상품을 풀와이드 50:50 배너로 표시 (좌 이미지 / 우 텍스트) */
export function ProductHeroBanner({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductHeroBannerConfig;
  const style = cfg.style || {};
  const imagePosition = cfg.imagePosition || "left";
  const ctaLabel = cfg.ctaLabel || "자세히 보기";
  const product = curation.products[0];

  if (!product) return null;

  const isLight = style.textTheme === "light";

  const imageBlock = (
    <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : null}
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center">
      {curation.subtitle && (
        <p
          className={`text-xs font-medium tracking-wide uppercase mb-2 ${
            isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"
          }`}
        >
          {curation.subtitle}
        </p>
      )}
      {product.destination && (
        <span
          className={`inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
            isLight ? "bg-white/15 text-white" : "bg-[color:var(--surface,#f5f5f7)] text-[color:var(--fg,#1d1d1f)]"
          }`}
        >
          {product.destination}
        </span>
      )}
      <h2
        className={`text-2xl md:text-4xl font-semibold tracking-tight leading-[1.2] mb-3 ${
          isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
        }`}
      >
        {curation.title || product.title}
      </h2>
      {curation.description && (
        <p
          className={`text-sm md:text-base leading-relaxed mb-5 ${
            isLight ? "text-white/80" : "text-[color:var(--muted,#86868b)]"
          }`}
        >
          {curation.description}
        </p>
      )}
      <div className="flex items-baseline gap-2 mb-6">
        {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
          <span
            className={`text-sm line-through ${
              isLight ? "text-white/50" : "text-[color:var(--muted,#86868b)]"
            }`}
          >
            {product.originalPrice.toLocaleString()}원
          </span>
        )}
        {product.basePrice ? (
          <span className={`text-2xl md:text-3xl font-bold ${isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"}`}>
            {product.basePrice.toLocaleString()}원~
          </span>
        ) : (
          <span className={`text-xl ${isLight ? "text-white/80" : "text-[color:var(--muted,#86868b)]"}`}>
            가격 문의
          </span>
        )}
      </div>
      <div>
        <Link
          href={`/tours/${product.slug}`}
          className={`inline-flex items-center justify-center h-12 px-8 rounded-full text-sm font-medium transition-colors ${
            isLight
              ? "bg-white text-black hover:bg-white/90"
              : "bg-[color:var(--fg,#1d1d1f)] text-white hover:opacity-90"
          }`}
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );

  return (
    <SectionContainer style={style}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
        {imagePosition === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </SectionContainer>
  );
}
