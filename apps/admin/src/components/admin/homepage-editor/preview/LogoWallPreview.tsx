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

const COL_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

/** 로고월 미리보기 */
export function LogoWallPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const logos = (cfg.logos || []) as Array<{ imageUrl: string; name: string }>;
  const columns = (cfg.columns || 5) as 3 | 4 | 5 | 6;
  const grayscale = !!cfg.grayscale;
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      {(curation.title || curation.subtitle) && (
        <div className={`mb-3 ${alignClass(style.textAlign)}`}>
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
        </div>
      )}
      {logos.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-2 items-center`}>
          {logos.slice(0, 12).map((logo, i) => (
            <div key={i} className="flex items-center justify-center p-1">
              {logo.imageUrl ? (
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  referrerPolicy="no-referrer"
                  className={`max-h-6 w-auto object-contain ${
                    grayscale ? "grayscale opacity-70" : ""
                  }`}
                />
              ) : (
                <div className="h-6 w-12 bg-gray-200 rounded" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>로고를 추가하세요</p>
      )}
    </PreviewShell>
  );
}
