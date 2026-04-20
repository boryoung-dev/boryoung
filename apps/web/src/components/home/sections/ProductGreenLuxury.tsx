import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductGreenLuxuryConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 골프 그린 럭셔리 — 딥 그린 배경 + 골드 포인트 + 얇은 세리프 */
export function ProductGreenLuxury({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductGreenLuxuryConfig;
  const style = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

  // 딥 그린 배경 기본값
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? {
          background:
            "linear-gradient(to bottom right, #0a3d2a, #052218 60%, #0a3d2a)",
        }
      : undefined;

  return (
    <SectionContainer style={{ textTheme: "light", ...style }} sectionStyle={sectionStyle}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group block relative bg-black/40 backdrop-blur-sm border border-[#c9a961] hover:border-[#e8ce7a] transition-all hover:shadow-[0_0_30px_rgba(201,169,97,0.35)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {/* 상단 골드 얇은 라인 */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a961] to-transparent" />
              {/* 우상단 라벨 */}
              {p.destination && (
                <div className="absolute top-4 right-4 text-[10px] tracking-[0.3em] uppercase text-[#c9a961] bg-black/50 backdrop-blur-sm border border-[#c9a961]/40 px-3 py-1">
                  {p.destination}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#c9a961]/40">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#c9a961]/80 mb-2">
                Premium Golf Tour
              </p>
              <h3
                className="text-xl md:text-2xl font-light text-white leading-snug line-clamp-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {p.title}
              </h3>
              {p.duration && (
                <p className="mt-3 text-xs text-white/60 tracking-wider">
                  {p.duration}
                </p>
              )}
              <div className="mt-5 pt-5 border-t border-[#c9a961]/20 flex items-end justify-between">
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">
                  from
                </span>
                {p.basePrice ? (
                  <span
                    className="text-2xl font-light text-[#c9a961]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    ₩{p.basePrice.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-sm text-[#c9a961]/70">Contact</span>
                )}
              </div>
            </div>
            {/* 하단 골드 라인 강조 */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a961] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
