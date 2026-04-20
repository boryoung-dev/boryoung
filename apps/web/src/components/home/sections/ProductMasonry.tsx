import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductMasonryConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:columns-2",
  3: "md:columns-2 lg:columns-3",
  4: "md:columns-2 lg:columns-4",
};

/** 메이슨리 그리드 — CSS columns 기반 자연스러운 흐름 */
export function ProductMasonry({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductMasonryConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const products = curation.products;

  if (products.length === 0) return null;

  // 메이슨리 효과를 위해 카드별로 다른 aspect ratio 부여
  const aspectRatios = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[5/4]"];

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
      <div className={`columns-1 ${COL_MAP[columns]} gap-4`}>
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="block mb-4 break-inside-avoid group"
          >
            <div
              className={`relative ${aspectRatios[i % aspectRatios.length]} rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]`}
            >
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
              <h3
                className={`text-sm font-semibold line-clamp-1 ${
                  style.textTheme === "light" ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                }`}
              >
                {p.title}
              </h3>
              <div
                className={`text-xs mt-1 ${
                  style.textTheme === "light" ? "text-white/70" : "text-[color:var(--muted,#86868b)]"
                }`}
              >
                {p.destination}
              </div>
              <p
                className={`text-sm font-bold mt-1 ${
                  style.textTheme === "light" ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                }`}
              >
                {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
