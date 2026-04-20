"use client";

import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductSplitCarouselConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 좌측 헤딩 + 우측 가로 캐러셀 (snap-x) */
export function ProductSplitCarousel({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductSplitCarouselConfig;
  const style = cfg.style || {};
  const ctaLabel = cfg.ctaLabel || "전체 보기";
  const ctaUrl = curation.linkUrl || "/tours";
  const products = curation.products;

  if (products.length === 0) return null;

  const isLight = style.textTheme === "light";

  return (
    <SectionContainer style={style}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* 좌측 헤딩 (1/3) */}
        <div className="md:col-span-1">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
          {curation.linkUrl !== null && (
            <div className="mt-6">
              <Link
                href={ctaUrl}
                className={`inline-flex items-center text-sm font-medium ${
                  isLight ? "text-white hover:text-white/80" : "text-[color:var(--fg,#1d1d1f)] hover:opacity-70"
                }`}
              >
                {ctaLabel} →
              </Link>
            </div>
          )}
        </div>

        {/* 우측 캐러셀 (2/3) */}
        <div className="md:col-span-2 -mr-4 md:-mr-6">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pr-4 md:pr-6 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((p, i) => (
              <Link
                key={`${p.slug}-${i}`}
                href={`/tours/${p.slug}`}
                className="flex-shrink-0 w-[260px] snap-start group"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                  ) : null}
                </div>
                <div className="mt-3">
                  <p className={`text-xs ${isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"}`}>
                    {p.destination}
                  </p>
                  <h3 className={`text-sm font-semibold line-clamp-1 mt-0.5 ${isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"}`}>
                    {p.title}
                  </h3>
                  <p className={`text-sm font-bold mt-1 ${isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"}`}>
                    {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
