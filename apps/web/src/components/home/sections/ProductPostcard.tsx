import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductPostcardConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 엽서 — 우표 영역 + 손글씨 + 절취선 + 살짝 회전 */
export function ProductPostcard({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductPostcardConfig;
  const style = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

  return (
    <SectionContainer style={style}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((p, i) => {
          const rotate = i % 2 === 0 ? "rotate-1" : "-rotate-1";
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className={`group relative block bg-[#fefcf6] rounded-sm shadow-xl p-5 transform ${rotate} hover:rotate-0 hover:scale-[1.02] transition-transform duration-300`}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(120,100,70,0.04) 0px, transparent 1px, transparent 22px, rgba(120,100,70,0.04) 23px)",
              }}
            >
              <div className="flex gap-4">
                {/* 좌측 — 손글씨 영역 */}
                <div
                  className="flex-1 relative pr-4 border-r border-dashed border-[#a88762]/50"
                >
                  {p.destination && (
                    <p
                      className="text-sm italic text-[#7a5a3a] mb-2"
                      style={{
                        fontFamily:
                          "'Brush Script MT', 'Lucida Handwriting', cursive",
                      }}
                    >
                      Greetings from {p.destination}!
                    </p>
                  )}
                  <h3
                    className="text-lg md:text-xl italic font-semibold text-[#3d2817] line-clamp-3 leading-snug"
                    style={{
                      fontFamily:
                        "'Brush Script MT', 'Lucida Handwriting', cursive, serif",
                    }}
                  >
                    {p.title}
                  </h3>
                  {p.duration && (
                    <p className="mt-3 text-xs italic text-[#7a5a3a]">
                      — {p.duration} —
                    </p>
                  )}
                  {/* 손글씨 서명 영역 */}
                  <div className="mt-4 pt-3 space-y-0.5">
                    <div className="h-px bg-[#a88762]/30" />
                    <div className="h-px bg-[#a88762]/30" />
                    <div className="h-px bg-[#a88762]/30 w-4/5" />
                  </div>
                  {p.basePrice ? (
                    <p
                      className="mt-3 text-base font-bold text-[#3d2817]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      ₩{p.basePrice.toLocaleString()}~
                    </p>
                  ) : null}
                </div>

                {/* 우측 — 우표 영역 */}
                <div className="flex-shrink-0 flex flex-col items-end gap-3">
                  {/* 우표: 점선 테두리 사각형 + 이미지 */}
                  <div
                    className="relative w-20 h-24 bg-white p-1"
                    style={{
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      maskImage:
                        "radial-gradient(circle at 4px 4px, transparent 2px, black 2.5px) 0 0 / 8px 8px",
                      WebkitMaskImage:
                        "radial-gradient(circle at 4px 4px, transparent 2px, black 2.5px) 0 0 / 8px 8px",
                    }}
                  >
                    <div className="w-full h-full border-2 border-dashed border-[#a88762] overflow-hidden bg-[#f5e6d3]">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          style={{ filter: "sepia(0.15)" }}
                        />
                      ) : null}
                    </div>
                  </div>
                  {/* 소인 스탬프 */}
                  <div
                    className="w-16 h-16 rounded-full border-2 border-[#8b0000]/60 flex items-center justify-center text-[#8b0000]/70 text-[9px] font-bold tracking-widest"
                    style={{ transform: "rotate(-8deg)" }}
                  >
                    <div className="text-center leading-tight">
                      <div>POSTED</div>
                      <div className="text-[7px]">✈ ✈ ✈</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionContainer>
  );
}
