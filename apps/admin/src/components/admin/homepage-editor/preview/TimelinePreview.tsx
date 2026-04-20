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

/** 타임라인 미리보기 */
export function TimelinePreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const events = (cfg.events || []) as Array<{
    year: string;
    title: string;
    description?: string;
  }>;
  const theme = themeColors(style.textTheme);
  const lineColor =
    style.textTheme === "light"
      ? "rgba(255,255,255,0.2)"
      : cfg.lineColor || "#d2d2d7";

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
      {events.length > 0 ? (
        <ol className="relative max-w-md mx-auto">
          <div
            className="absolute left-1.5 top-1 bottom-1 w-px"
            style={{ background: lineColor }}
          />
          {events.slice(0, 5).map((event, i) => (
            <li key={i} className="relative pl-5 pb-3 last:pb-0">
              <span
                className="absolute left-0 top-0.5 w-2.5 h-2.5 rounded-full border-2 bg-white"
                style={{ borderColor: "#0071e3" }}
              />
              <div className="text-[10px] font-bold text-blue-600">
                {event.year || "연도"}
              </div>
              <p className={`text-xs font-semibold ${theme.title}`}>
                {event.title || "제목"}
              </p>
              {event.description && (
                <p className={`text-[10px] line-clamp-1 ${theme.muted}`}>
                  {event.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>이벤트를 추가하세요</p>
      )}
    </PreviewShell>
  );
}
