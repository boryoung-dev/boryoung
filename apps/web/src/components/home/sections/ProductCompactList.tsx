import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductCompactListConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<1 | 2, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
};

/** 한 행 한 상품 컴팩트 리스트 — 좌측 정사각 이미지 + 우측 정보 */
export function ProductCompactList({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductCompactListConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 1) as 1 | 2;
  const products = curation.products;

  if (products.length === 0) return null;

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
      <ul className={`grid ${COL_MAP[columns]} gap-3`}>
        {products.map((p, i) => (
          <li key={`${p.slug}-${i}`}>
            <Link
              href={`/tours/${p.slug}`}
              className={`flex gap-4 p-3 rounded-2xl border transition-colors ${
                isLight
                  ? "border-white/15 hover:bg-white/5"
                  : "border-[color:var(--border,#d2d2d7)] hover:bg-[color:var(--surface,#f5f5f7)]"
              }`}
            >
              <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {p.destination && (
                  <p className={`text-xs ${isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"}`}>
                    {p.destination}
                    {p.duration ? ` · ${p.duration}` : ""}
                  </p>
                )}
                <h3
                  className={`text-sm md:text-base font-semibold line-clamp-2 mt-1 ${
                    isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                  }`}
                >
                  {p.title}
                </h3>
                <p
                  className={`text-sm md:text-base font-bold mt-1 ${
                    isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                  }`}
                >
                  {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
