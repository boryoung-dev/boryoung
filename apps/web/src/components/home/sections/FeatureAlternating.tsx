import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { FeatureAlternatingConfig } from "./_shared/types";
import { splitLines } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 기능 좌우 교차 섹션 — 블록 N개를 좌우로 번갈아 배치 */
export function FeatureAlternating({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as FeatureAlternatingConfig;
  const style = cfg.style || {};
  const blocks = cfg.blocks || [];
  const startSide = cfg.startSide || "left";

  if (blocks.length === 0) return null;

  const isLight = style.textTheme === "light";
  const titleColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const descColor = isLight
    ? "text-white/80"
    : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-12">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="space-y-16 md:space-y-24">
        {blocks.map((block, i) => {
          const evenStartLeft = startSide === "left";
          const imageOnLeft = i % 2 === 0 ? evenStartLeft : !evenStartLeft;
          return (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
            >
              {/* 이미지 */}
              <div
                className={`order-1 ${
                  imageOnLeft ? "md:order-1" : "md:order-2"
                }`}
              >
                {block.imageUrl ? (
                  <img
                    src={block.imageUrl}
                    alt={block.title}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] rounded-2xl bg-[color:var(--surface,#f5f5f7)]" />
                )}
              </div>
              {/* 텍스트 */}
              <div
                className={`order-2 ${
                  imageOnLeft ? "md:order-2" : "md:order-1"
                }`}
              >
                <h3
                  className={`text-2xl md:text-3xl font-semibold tracking-tight leading-tight ${titleColor}`}
                >
                  {block.title}
                </h3>
                {block.description && (
                  <p
                    className={`mt-4 text-base leading-relaxed ${descColor}`}
                  >
                    {splitLines(block.description).map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )}
                {block.ctaLabel && (
                  <Link
                    href={block.ctaUrl || "#"}
                    className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-medium bg-[color:var(--fg,#1d1d1f)] text-white hover:opacity-90 transition-opacity"
                  >
                    {block.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
