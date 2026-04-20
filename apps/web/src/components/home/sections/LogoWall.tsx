import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { LogoWallConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-3 md:grid-cols-5",
  6: "grid-cols-3 md:grid-cols-6",
};

/** 로고월 섹션 — 파트너/협력사 로고 그리드 */
export function LogoWall({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as LogoWallConfig;
  const style = cfg.style || {};
  const logos = cfg.logos || [];
  const columns = (cfg.columns || 5) as 3 | 4 | 5 | 6;
  const grayscale = cfg.grayscale ?? false;

  if (logos.length === 0) return null;

  const grayscaleCls = grayscale
    ? "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
    : "";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className={`grid ${COL_MAP[columns]} gap-6 md:gap-8 items-center`}>
        {logos.map((logo, i) => {
          const inner = (
            <img
              src={logo.imageUrl}
              alt={logo.name}
              referrerPolicy="no-referrer"
              className={`max-h-12 md:max-h-14 w-auto mx-auto object-contain transition-all ${grayscaleCls}`}
            />
          );
          return logo.linkUrl ? (
            <Link
              key={i}
              href={logo.linkUrl}
              className="flex items-center justify-center p-2"
            >
              {inner}
            </Link>
          ) : (
            <div key={i} className="flex items-center justify-center p-2">
              {inner}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
