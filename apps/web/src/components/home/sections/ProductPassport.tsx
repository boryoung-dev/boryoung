import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductPassportConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 여권 스탬프 — 크래프트 베이지 + 스탬프 오버레이 + 세리프 + sepia */
export function ProductPassport({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductPassportConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const products = curation.products;

  if (products.length === 0) return null;

  // 크래프트 베이지 배경이 기본 — style.background가 지정되지 않은 경우 fallback
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? { background: "#f5e6d3" }
      : undefined;

  return (
    <SectionContainer style={style} sectionStyle={sectionStyle}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8 font-serif">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-6`}>
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group relative block border-2 border-dashed border-[#8b5e3c] bg-[#fdf7ec] p-4 font-serif hover:shadow-lg transition-shadow"
          >
            {/* 여권 스탬프 오버레이 (우상단, 회전) */}
            <div
              className="absolute top-3 right-3 z-10 w-16 h-16 rounded-full border-2 border-dashed border-[#8b0000]/70 flex items-center justify-center text-[10px] font-bold tracking-[0.2em] text-[#8b0000]/80 bg-[#fdf7ec]/60"
              style={{ transform: "rotate(-15deg)" }}
            >
              <div className="text-center leading-tight">
                <div>TOUR</div>
                <div className="text-[8px] tracking-normal">★ ★ ★</div>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden border border-[#8b5e3c]/50">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  style={{ filter: "sepia(0.2) brightness(0.95)" }}
                />
              ) : null}
            </div>
            <div className="mt-4">
              {p.destination && (
                <p className="text-[11px] tracking-[0.25em] uppercase text-[#8b5e3c] mb-1">
                  {p.destination}
                </p>
              )}
              <h3 className="text-lg font-semibold text-[#3d2817] line-clamp-2 leading-snug">
                {p.title}
              </h3>
              <div className="mt-3 pt-3 border-t border-dashed border-[#8b5e3c]/40 flex items-end justify-between">
                <span className="text-xs italic text-[#8b5e3c]">{p.duration}</span>
                {p.basePrice ? (
                  <span className="text-base font-bold text-[#3d2817]">
                    {p.basePrice.toLocaleString()}원~
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
