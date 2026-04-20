import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductJournalConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

/** 여행 일지 — 크래프트 페이퍼 + 테이프 + DAY 라벨 + 손글씨 */
export function ProductJournal({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductJournalConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 3) as 2 | 3;
  const startDay = typeof cfg.startDay === "number" ? cfg.startDay : 1;
  const products = curation.products;

  if (products.length === 0) return null;

  // 크래프트 페이퍼 + 모눈 배경 기본값
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? {
          background:
            "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px), #f0e4d0",
          backgroundSize: "22px 22px, 22px 22px, auto",
        }
      : undefined;

  return (
    <SectionContainer style={style} sectionStyle={sectionStyle}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div
          className="mb-10"
          style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive, serif" }}
        >
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-8`}>
        {products.map((p, i) => {
          const rotate = i % 3 === 0 ? "-1deg" : i % 3 === 1 ? "1.2deg" : "-0.5deg";
          const dayNum = startDay + i;
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className="group relative block bg-white p-4 pt-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all"
              style={{ transform: `rotate(${rotate})` }}
            >
              {/* 좌상단 노랑 테이프 */}
              <div
                className="absolute -top-2 left-4 w-20 h-5 bg-yellow-200/75 shadow-sm"
                style={{
                  transform: "rotate(-6deg)",
                  backgroundImage:
                    "linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.03) 1px, transparent 2px)",
                  backgroundSize: "8px 100%",
                }}
              />
              {/* 우상단 파랑 테이프 */}
              <div
                className="absolute -top-2 right-6 w-14 h-4 bg-sky-200/70 shadow-sm"
                style={{ transform: "rotate(8deg)" }}
              />

              {/* DAY 라벨 */}
              <div
                className="inline-block px-2 py-0.5 bg-[#3d2817] text-[#fdfaf2] text-[11px] font-bold tracking-[0.3em] mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                DAY {String(dayNum).padStart(2, "0")}
              </div>

              <div className="relative aspect-[4/3] overflow-hidden bg-[#f5e6d3]">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{ filter: "sepia(0.18) contrast(0.98)" }}
                  />
                ) : null}
              </div>

              <div className="mt-4">
                {p.destination && (
                  <p
                    className="text-sm italic text-[#8b5e3c]"
                    style={{
                      fontFamily:
                        "'Caveat', 'Brush Script MT', cursive, serif",
                    }}
                  >
                    📍 {p.destination}
                  </p>
                )}
                <h3
                  className="mt-1 text-lg font-semibold text-[#3d2817] line-clamp-2 leading-snug"
                  style={{
                    fontFamily:
                      "'Caveat', 'Brush Script MT', cursive, Georgia, serif",
                  }}
                >
                  {p.title}
                </h3>
                {p.duration && (
                  <p
                    className="mt-1 text-xs italic text-[#7a5a3a]"
                    style={{
                      fontFamily:
                        "'Caveat', 'Brush Script MT', cursive, serif",
                    }}
                  >
                    {p.duration}
                  </p>
                )}

                {/* 손글씨 노트 라인 */}
                <div className="mt-3 space-y-1 border-t border-dashed border-[#8b5e3c]/30 pt-3">
                  <div className="h-px bg-[#8b5e3c]/20" />
                  <div className="h-px bg-[#8b5e3c]/20 w-4/5" />
                </div>

                {p.basePrice ? (
                  <p
                    className="mt-3 text-right text-base font-bold text-[#3d2817]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    ₩{p.basePrice.toLocaleString()}~
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </SectionContainer>
  );
}
