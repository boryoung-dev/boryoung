"use client";

import { ImageIcon } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** 좌우 50:50 스토리 미리보기 */
export function StorySplitPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const imagePosition = cfg.imagePosition || "left";
  const imageUrl = cfg.imageUrl || curation.imageUrl || "";
  const ctaLabel = cfg.ctaLabel;
  const theme = themeColors(style.textTheme);

  const imgEl = (
    <div className="relative aspect-[5/4] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={curation.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-[var(--muted,#86868b)] opacity-40" />
        </div>
      )}
    </div>
  );

  const textEl = (
    <div className="flex flex-col justify-center">
      {curation.subtitle && (
        <p className={`text-[10px] font-medium tracking-wide uppercase mb-1 ${theme.muted}`}>
          {curation.subtitle}
        </p>
      )}
      <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold tracking-tight ${theme.title}`}>
        {renderLines(curation.title)}
      </h2>
      {curation.description && (
        <p className={`mt-1 text-xs ${theme.muted}`}>{renderLines(curation.description)}</p>
      )}
      {ctaLabel && (
        <div className="mt-3">
          <span
            className={`inline-flex items-center h-7 px-3 rounded-full text-[10px] font-medium ${
              style.textTheme === "light"
                ? "bg-white text-black"
                : "bg-[var(--fg,#1d1d1f)] text-white"
            }`}
          >
            {ctaLabel} →
          </span>
        </div>
      )}
    </div>
  );

  return (
    <PreviewShell style={style}>
      <div className="grid grid-cols-2 gap-4 items-stretch">
        {imagePosition === "left" ? (
          <>
            {imgEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {imgEl}
          </>
        )}
      </div>
    </PreviewShell>
  );
}
