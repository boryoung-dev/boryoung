import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductVintagePosterConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

/** 빈티지 여행 포스터 — 1960s 크림 + sepia + 두꺼운 세리프 */
export function ProductVintagePoster({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductVintagePosterConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3;
  const products = curation.products;

  if (products.length === 0) return null;

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10 font-serif">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-8`}>
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group block relative bg-[#f4ecd8] border-4 border-double border-[#8b4513] p-4 hover:shadow-[0_8px_30px_rgba(139,69,19,0.3)] transition-shadow"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(139,69,19,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,69,19,0.04) 0%, transparent 50%)",
            }}
          >
            {/* 포스터 상단 타이틀 */}
            <div className="text-center mb-3 pb-2 border-b-2 border-[#8b4513]/40">
              <p
                className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#8b4513]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                ★ Travel Bureau ★
              </p>
            </div>

            <div className="relative aspect-[3/4] overflow-hidden border-2 border-[#8b4513] mb-4">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  style={{ filter: "sepia(0.45) contrast(1.1) saturate(0.85)" }}
                />
              ) : null}
              {/* 빈티지 광택 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(244,236,216,0.2) 0%, transparent 40%, rgba(139,69,19,0.1) 100%)",
                }}
              />
            </div>

            {/* 포스터 대형 헤드라인 */}
            <h3
              className="text-3xl md:text-4xl font-black text-[#8b4513] leading-none text-center uppercase tracking-tight line-clamp-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {p.destination || p.title}
            </h3>
            <p className="mt-2 text-center text-xs tracking-[0.3em] uppercase text-[#8b4513]/80 font-serif italic">
              — {p.duration || "A Grand Journey"} —
            </p>

            {/* 하단 VISIT 캡션 + 가격 */}
            <div className="mt-4 pt-3 border-t-2 border-[#8b4513]/40 text-center">
              <p
                className="text-sm font-bold tracking-[0.3em] uppercase text-[#8b4513]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Visit {p.destination || "The World"}
              </p>
              {p.basePrice ? (
                <p className="mt-1 text-xl font-black text-[#5c2e0a] font-serif">
                  from ₩{p.basePrice.toLocaleString()}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
