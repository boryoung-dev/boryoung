"use client";

import { PreviewShell } from "./_shared/PreviewShell";
import {
  descriptionSizeClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

interface Curation {
  title: string;
  description?: string | null;
  linkUrl?: string | null;
  displayConfig?: any;
}

/** 신뢰 CTA 섹션 미리보기 */
export function TrustCtaPreview({ curation }: { curation: Curation }) {
  const phone = curation.displayConfig?.phone || "1588-0320";
  const style: PreviewStyleConfig = curation.displayConfig?.style || {};
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className={`${titleSizeClass(style.fontSize?.title || "lg")} font-semibold tracking-tight leading-[1.15] mb-4 ${theme.title}`}
        >
          {renderLines(curation.title)}
        </h2>
        {curation.description && (
          <p
            className={`${descriptionSizeClass(style.fontSize?.description)} mb-6 max-w-md mx-auto leading-relaxed ${theme.muted}`}
          >
            {renderLines(curation.description)}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <span
            className={`inline-flex items-center justify-center h-9 px-6 rounded-full text-xs font-medium ${
              style.textTheme === "light"
                ? "bg-white text-black"
                : "bg-[var(--fg,#1d1d1f)] text-white"
            }`}
          >
            상담 문의하기
          </span>
          <span
            className={`inline-flex items-center justify-center h-9 px-6 border rounded-full text-xs font-medium ${
              style.textTheme === "light"
                ? "border-white/60 text-white"
                : "border-[var(--border,#d2d2d7)] text-[var(--fg,#1d1d1f)]"
            }`}
          >
            {phone}
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}
