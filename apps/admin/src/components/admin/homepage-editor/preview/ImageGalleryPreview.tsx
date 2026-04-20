"use client";

import { ImageIcon } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** 이미지 갤러리 미리보기 */
export function ImageGalleryPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const images = (cfg.images || []) as Array<{ url: string; caption?: string }>;
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
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
          <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
            {renderLines(curation.title)}
          </h2>
        </div>
      )}
      {images.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-1.5`}>
          {images.slice(0, 8).map((img, i) => (
            <figure key={i}>
              <div className="relative aspect-[4/3] rounded overflow-hidden bg-[var(--surface,#f5f5f7)]">
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.caption || ""}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-[var(--muted,#86868b)] opacity-40" />
                  </div>
                )}
              </div>
              {img.caption && (
                <figcaption className={`text-[9px] mt-0.5 truncate ${theme.muted}`}>
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>이미지를 추가해주세요</p>
      )}
    </PreviewShell>
  );
}
