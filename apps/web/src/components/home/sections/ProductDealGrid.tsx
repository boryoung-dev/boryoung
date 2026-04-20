import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductDealGridConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 특가 그리드 — 할인율 높은 순 정렬, 큰 할인율 배지 */
export function ProductDealGrid({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductDealGridConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3 | 4;

  // 원가가 있고 할인된 상품만, 할인율 높은 순 정렬
  const deals = curation.products
    .filter(
      (p) => p.originalPrice && p.basePrice && p.originalPrice > p.basePrice
    )
    .map((p) => ({
      ...p,
      _discount: 1 - (p.basePrice ?? 0) / (p.originalPrice ?? 1),
    }))
    .sort((a, b) => b._discount - a._discount);

  if (deals.length === 0) return null;

  const isLight = style.textTheme === "light";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-5`}>
        {deals.map((p, i) => {
          const pct = Math.round(p._discount * 100);
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)] mb-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                ) : null}
                {/* 할인율 배지 */}
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white px-3 py-2 rounded-xl shadow-lg">
                    <span className="text-2xl font-bold leading-none">{pct}%</span>
                    <span className="text-[10px] block leading-none mt-0.5 text-white/90">
                      OFF
                    </span>
                  </div>
                </div>
              </div>
              <p className={`text-xs ${isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"}`}>
                {p.destination}
                {p.duration ? ` · ${p.duration}` : ""}
              </p>
              <h3
                className={`text-sm md:text-base font-semibold line-clamp-2 mt-1 ${
                  isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                }`}
              >
                {p.title}
              </h3>
              <div className="mt-2">
                <span
                  className={`text-xs line-through ${
                    isLight ? "text-white/50" : "text-[color:var(--muted,#86868b)]"
                  }`}
                >
                  {p.originalPrice?.toLocaleString()}원
                </span>
                <p className="text-lg font-bold text-red-500 mt-0.5">
                  {p.basePrice?.toLocaleString()}원~
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionContainer>
  );
}
