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

/** 기능 좌우 교차 미리보기 */
export function FeatureAlternatingPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const blocks = (cfg.blocks || []) as Array<{
    title: string;
    description: string;
    imageUrl: string;
    ctaLabel?: string;
  }>;
  const startSide = (cfg.startSide || "left") as "left" | "right";
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
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.slice(0, 3).map((block, i) => {
            const evenStartLeft = startSide === "left";
            const imageOnLeft = i % 2 === 0 ? evenStartLeft : !evenStartLeft;
            return (
              <div key={i} className="grid grid-cols-2 gap-2 items-center">
                <div className={imageOnLeft ? "order-1" : "order-2"}>
                  {block.imageUrl ? (
                    <img
                      src={block.imageUrl}
                      alt={block.title}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gray-200 rounded" />
                  )}
                </div>
                <div className={imageOnLeft ? "order-2" : "order-1"}>
                  <p className={`text-xs font-semibold leading-tight ${theme.title}`}>
                    {block.title}
                  </p>
                  {block.description && (
                    <p className={`mt-1 text-[10px] line-clamp-2 ${theme.muted}`}>
                      {block.description}
                    </p>
                  )}
                  {block.ctaLabel && (
                    <span className="mt-1 inline-block text-[9px] font-semibold text-blue-600">
                      {block.ctaLabel} →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>블록을 추가하세요</p>
      )}
    </PreviewShell>
  );
}
