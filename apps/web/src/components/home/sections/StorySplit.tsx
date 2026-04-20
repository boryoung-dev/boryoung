import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { StorySplitConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 좌우 50:50 스토리 섹션 */
export function StorySplit({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as StorySplitConfig;
  const style = cfg.style || {};
  const imagePosition = cfg.imagePosition || "left";
  const imageUrl = cfg.imageUrl || curation.imageUrl || "";
  const ctaLabel = cfg.ctaLabel;
  const ctaUrl = cfg.ctaUrl || curation.linkUrl || "";

  if (!curation.title && !imageUrl) return null;

  const imageBlock = (
    <div
      className="relative aspect-[4/3] md:aspect-[5/4] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={curation.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-[color:var(--muted,#86868b)] opacity-40" />
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center">
      <SectionHeading
        eyebrow={curation.subtitle}
        title={curation.title}
        description={curation.description}
        style={style}
      />
      {ctaLabel && (
        <div
          className={`mt-6 ${
            style.textAlign === "center"
              ? "text-center"
              : style.textAlign === "right"
                ? "text-right"
                : "text-left"
          }`}
        >
          <Link
            href={ctaUrl || "#"}
            className={`inline-flex items-center justify-center h-11 px-7 rounded-full text-sm font-medium transition-all ${
              style.textTheme === "light"
                ? "bg-white text-black hover:bg-white/90"
                : "bg-[color:var(--fg,#1d1d1f)] text-white hover:opacity-90"
            }`}
          >
            {ctaLabel} →
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <SectionContainer style={style}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
        {imagePosition === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </SectionContainer>
  );
}
