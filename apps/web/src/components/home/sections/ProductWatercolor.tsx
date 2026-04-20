import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductWatercolorConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 수채화 소프트 — 파스텔 블롭 + 블러 배경 + 얕은 섀도우 */
export function ProductWatercolor({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductWatercolorConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const products = curation.products;

  if (products.length === 0) return null;

  // 파스텔 blob 레이어 배경
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? {
          background:
            "radial-gradient(circle at 15% 20%, rgba(186,230,253,0.6) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(167,243,208,0.5) 0%, transparent 45%), radial-gradient(circle at 50% 80%, rgba(253,224,71,0.35) 0%, transparent 40%), #fafbfc",
        }
      : undefined;

  return (
    <SectionContainer style={style} sectionStyle={sectionStyle}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10">
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
            className="group block bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/50 shadow-[0_8px_24px_rgba(148,163,184,0.15)] hover:shadow-[0_12px_32px_rgba(148,163,184,0.25)] transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  style={{
                    WebkitMaskImage:
                      "radial-gradient(ellipse 100% 100% at center, black 55%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.6) 100%)",
                    maskImage:
                      "radial-gradient(ellipse 100% 100% at center, black 55%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.6) 100%)",
                    filter: "saturate(0.85) brightness(1.02)",
                  }}
                />
              ) : null}
            </div>
            <div className="p-5">
              {p.destination && (
                <p className="text-[11px] font-light text-sky-600/80 tracking-wide mb-1">
                  {p.destination}
                </p>
              )}
              <h3 className="text-base font-light text-slate-700 leading-snug line-clamp-2">
                {p.title}
              </h3>
              {p.duration && (
                <p className="mt-1 text-xs font-light text-slate-400">
                  {p.duration}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[10px] font-light text-slate-400 uppercase tracking-widest">
                  from
                </span>
                {p.basePrice ? (
                  <span className="text-lg font-light text-slate-700">
                    {p.basePrice.toLocaleString()}원~
                  </span>
                ) : (
                  <span className="text-xs font-light text-slate-400">
                    가격 문의
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
