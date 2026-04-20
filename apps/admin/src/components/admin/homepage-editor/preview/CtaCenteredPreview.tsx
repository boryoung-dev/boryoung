"use client";

import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** 중앙 정렬 CTA 미리보기 */
export function CtaCenteredPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = { textAlign: "center", ...(cfg.style || {}) };
  const buttons = (cfg.buttons || []).slice(0, 2);
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style} className="text-center">
      <div className="max-w-xl mx-auto">
        {curation.subtitle && (
          <p className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${theme.muted}`}>
            {curation.subtitle}
          </p>
        )}
        <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
          {renderLines(curation.title)}
        </h2>
        {curation.description && (
          <p className={`mt-1 text-xs ${theme.muted}`}>{renderLines(curation.description)}</p>
        )}
        {buttons.length > 0 && (
          <div className="mt-3 flex gap-2 justify-center">
            {buttons.map((b: any, i: number) => (
              <span
                key={i}
                className={`inline-flex items-center justify-center h-7 px-4 rounded-full text-[10px] font-medium ${
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
