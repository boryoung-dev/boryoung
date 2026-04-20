import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductLuxuryBlackConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 럭셔리 블랙 — 검정 배경 + 골드 라인 + 얇은 세리프 */
export function ProductLuxuryBlack({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductLuxuryBlackConfig;
  const style = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

  // 검정 배경 기본값
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? { background: "#000000" }
      : undefined;

  return (
    <SectionContainer
      style={{ textTheme: "light", verticalPadding: "xl", ...style }}
      sectionStyle={sectionStyle}
    >
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={{ textTheme: "light", textAlign: "center", ...style }}
          />
          {/* 골드 디바이더 */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#d4af37]/60" />
            <div className="text-[#d4af37] text-xs">◆</div>
            <div className="h-px w-12 bg-[#d4af37]/60" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group block relative bg-black border border-[#d4af37]/30 hover:border-[#d4af37] transition-colors"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
                />
              ) : null}
              {/* 코너 골드 장식 */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[#d4af37]" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[#d4af37]" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-[#d4af37]" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[#d4af37]" />
            </div>
            <div className="p-8 text-center">
              {p.destination && (
                <p className="text-[10px] tracking-[0.5em] uppercase text-[#d4af37] mb-4">
                  {p.destination}
                </p>
              )}
              <h3
                className="text-xl md:text-2xl font-light text-white leading-tight tracking-[0.1em] uppercase line-clamp-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {p.title}
              </h3>
              {p.duration && (
                <p className="mt-3 text-[11px] tracking-[0.3em] uppercase text-white/40">
                  {p.duration}
                </p>
              )}
              {/* 골드 라인 */}
              <div className="mx-auto my-6 h-px w-12 bg-[#d4af37]" />
              {p.basePrice ? (
                <p
                  className="text-xl font-light text-[#d4af37] tracking-wider"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  ₩{p.basePrice.toLocaleString()}
                </p>
              ) : (
                <p className="text-sm text-white/50 tracking-wider">
                  Contact for price
                </p>
              )}
              <p className="mt-4 text-[10px] tracking-[0.4em] uppercase text-[#d4af37]/80 opacity-0 group-hover:opacity-100 transition-opacity">
                Discover →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
