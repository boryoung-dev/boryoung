"use client";

import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  flexAlignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

const HEIGHT_PX: Record<string, number> = {
  "60vh": 200,
  "80vh": 260,
  "100vh": 320,
};

/** 풀스크린 히어로 미리보기 */
export function FullBleedHeroPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = { fullWidth: true, ...(cfg.style || {}) };
  const buttons = (cfg.ctaButtons || []).slice(0, 2);
  const minH = HEIGHT_PX[cfg.heightPreset || "80vh"];
  const theme = themeColors(style.textTheme);
  const align = alignClass(style.textAlign);

  return (
    <PreviewShell style={style} minHeightPx={minH} className={`flex items-center ${align}`}>
      <div className="w-full">
        {curation.subtitle && (
          <p className={`text-[10px] font-medium tracking-wide uppercase mb-2 ${theme.muted}`}>
            {curation.subtitle}
          </p>
        )}
        <h2 className={`${titleSizeClass(style.fontSize?.title || "xl")} font-semibold tracking-tight leading-tight ${theme.title}`}>
          {renderLines(curation.title)}
        </h2>
        {curation.description && (
          <p className={`mt-2 text-xs ${theme.muted}`}>{renderLines(curation.description)}</p>
        )}
        {buttons.length > 0 && (
          <div className={`mt-4 flex gap-2 ${flexAlignClass(style.textAlign)}`}>
            {buttons.map((b: any, i: number) => (
              <span
                key={i}
                className={`inline-flex items-center justify-center h-8 px-4 rounded-full text-[11px] font-medium ${
                  (b.style || "primary") === "primary"
                    ? style.textTheme === "light"
                      ? "bg-white text-black"
                      : "bg-[var(--fg,#1d1d1f)] text-white"
                    : style.textTheme === "light"
                      ? "border border-white/60 text-white"
                      : "border border-[var(--border,#d2d2d7)] text-[var(--fg,#1d1d1f)]"
                }`}
              >
                {b.label || "버튼"}
              </span>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
