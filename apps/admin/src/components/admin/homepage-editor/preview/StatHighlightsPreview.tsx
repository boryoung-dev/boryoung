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

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** 큰 숫자 통계 미리보기 */
export function StatHighlightsPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const stats = (cfg.stats || []) as Array<{
    value: string;
    unit?: string;
    label: string;
    description?: string;
  }>;
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      {(curation.title || curation.subtitle) && (
        <div className={`mb-5 ${alignClass(style.textAlign)}`}>
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
      {stats.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-3`}>
          {stats.map((s, i) => (
            <div key={i} className={alignClass(style.textAlign)}>
              <div className={`flex items-baseline gap-1 ${flexAlignClass(style.textAlign)}`}>
                <span className={`text-2xl font-bold ${theme.title}`}>{s.value}</span>
                {s.unit && <span className={`text-xs ${theme.muted}`}>{s.unit}</span>}
              </div>
              <p className={`text-[11px] font-medium mt-0.5 ${theme.title}`}>{s.label}</p>
              {s.description && <p className={`text-[10px] ${theme.muted}`}>{s.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>통계 항목을 추가해주세요</p>
      )}
    </PreviewShell>
  );
}
