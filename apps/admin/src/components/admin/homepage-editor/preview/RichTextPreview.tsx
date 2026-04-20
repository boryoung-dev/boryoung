"use client";

import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

const MAX_W: Record<string, string> = {
  narrow: "max-w-md",
  normal: "max-w-xl",
  wide: "max-w-3xl",
};

/** 자유 리치 텍스트 미리보기 */
export function RichTextPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const body = (cfg.body || "") as string;
  const maxWidth = MAX_W[cfg.maxWidth || "normal"];
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      <div className={`${maxWidth} mx-auto ${alignClass(style.textAlign)}`}>
        {curation.subtitle && (
          <p className={`text-[10px] font-medium uppercase tracking-wide ${theme.muted}`}>
            {curation.subtitle}
          </p>
        )}
        {curation.title && (
          <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
            {renderLines(curation.title)}
          </h2>
        )}
        {curation.description && (
          <p className={`mt-1 text-xs ${theme.muted}`}>{renderLines(curation.description)}</p>
        )}
        {body && (
          <div className={`mt-3 text-xs leading-relaxed whitespace-pre-line ${theme.title}`}>
            {body}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
