import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductSunsetConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 선셋 — 오렌지→핑크→퍼플 그라디언트 + 둥근 모서리 카드 */
export function ProductSunset({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductSunsetConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const products = curation.products;

  if (products.length === 0) return null;

  // 선셋 그라디언트 배경 기본값
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? {
          background:
            "linear-gradient(to bottom right, #fdba74, #f472b6 45%, #a855f7)",
        }
      : undefined;

  return (
    <SectionContainer
      style={{ textTheme: "light", ...style }}
      sectionStyle={sectionStyle}
    >
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={{ textTheme: "light", ...style }}
          />
        </div>
      )}
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-6`}>
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group block relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  style={{ filter: "saturate(1.1) contrast(1.02)" }}
                />
              ) : null}
              {p.destination && (
                <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[11px] font-semibold rounded-full shadow-lg">
                  {p.destination}
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
                {p.title}
              </h3>
              {p.duration && (
                <p className="mt-1.5 text-xs text-slate-500">{p.duration}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                {p.basePrice ? (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      from
                    </p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {p.basePrice.toLocaleString()}원~
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">가격 문의</span>
                )}
                <span className="inline-flex items-center justify-center h-9 px-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-semibold rounded-full shadow-md group-hover:shadow-lg group-hover:brightness-110 transition">
                  예약 →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
