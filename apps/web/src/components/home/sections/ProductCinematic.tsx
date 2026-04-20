import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductCinematicConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const ASPECT_MAP: Record<"16:9" | "21:9", string> = {
  "16:9": "aspect-[16/9]",
  "21:9": "aspect-[21/9]",
};

/** 시네마 파노라마 — 상하 letterbox 바 + 가로 스냅 스크롤 */
export function ProductCinematic({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductCinematicConfig;
  const style = cfg.style || {};
  const aspectRatio = cfg.aspectRatio || "21:9";
  const aspectCls = ASPECT_MAP[aspectRatio];
  const products = curation.products;

  if (products.length === 0) return null;

  // 검정 배경 기본값 (letterbox 느낌)
  const sectionStyle =
    !style.background || style.background.type === "transparent"
      ? { background: "#000000" }
      : undefined;

  return (
    <SectionContainer
      style={{ textTheme: "light", fullWidth: true, ...style }}
      sectionStyle={sectionStyle}
    >
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-6 px-6 md:px-10">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={{ textTheme: "light", ...style }}
          />
        </div>
      )}

      <div
        className="flex gap-0 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/tours/${p.slug}`}
            className="group relative flex-shrink-0 w-[85vw] md:w-[70vw] lg:w-[60vw] snap-center"
          >
            <div className={`relative ${aspectCls} overflow-hidden bg-black`}>
              {/* 상단 letterbox 바 */}
              <div className="absolute top-0 left-0 right-0 h-5 bg-black z-20" />
              {/* 하단 letterbox 바 */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-black z-20" />

              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  style={{ filter: "contrast(1.05) saturate(0.95)" }}
                />
              ) : null}

              {/* 좌우 어둠 그라디언트 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

              {/* 시네마 헬베티카 오버레이 */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-8">
                {p.destination && (
                  <p
                    className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-white/80 mb-3"
                    style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                  >
                    — {p.destination} —
                  </p>
                )}
                <h3
                  className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-[0.15em] uppercase leading-tight line-clamp-2 max-w-4xl"
                  style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                >
                  {p.title}
                </h3>
                {p.basePrice ? (
                  <p
                    className="mt-6 text-base md:text-lg tracking-[0.3em] text-white/90"
                    style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                  >
                    ₩ {p.basePrice.toLocaleString()}
                  </p>
                ) : null}
              </div>

              {/* 하단 번호 오버레이 (엔딩크레딧 느낌) */}
              <div className="absolute bottom-7 left-7 z-20 text-[10px] tracking-[0.3em] text-white/60">
                {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </div>
              <div className="absolute bottom-7 right-7 z-20 text-[10px] tracking-[0.3em] text-white/60 uppercase">
                Boryoung Tour
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
