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

/** 비교 테이블 미리보기 */
export function ComparisonTablePreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const headers = (cfg.headers || []) as string[];
  const rows = (cfg.rows || []) as Array<{ label: string; values: string[] }>;
  const highlightCol =
    typeof cfg.highlightCol === "number" ? cfg.highlightCol : -1;
  const theme = themeColors(style.textTheme);
  const borderCls =
    style.textTheme === "light"
      ? "border-white/15"
      : "border-[var(--border,#d2d2d7)]";
  const highlightBg =
    style.textTheme === "light" ? "bg-white/10" : "bg-blue-50";

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
      {headers.length > 0 && rows.length > 0 ? (
        <div className="overflow-hidden">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className={`border-b ${borderCls}`}>
                {headers.slice(0, 4).map((h, i) => (
                  <th
                    key={i}
                    className={`py-1.5 px-1.5 text-left font-semibold ${theme.title} ${
                      i === highlightCol ? highlightBg : ""
                    }`}
                  >
                    {h || (i === 0 ? "" : "헤더")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 4).map((row, ri) => (
                <tr key={ri} className={`border-b ${borderCls}`}>
                  <td className={`py-1.5 px-1.5 ${theme.muted} truncate`}>
                    {row.label}
                  </td>
                  {row.values.slice(0, 3).map((v, ci) => {
                    const colIdx = ci + 1;
                    return (
                      <td
                        key={ci}
                        className={`py-1.5 px-1.5 truncate ${theme.title} ${
                          colIdx === highlightCol ? `${highlightBg} font-semibold` : ""
                        }`}
                      >
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>헤더와 행을 추가하세요</p>
      )}
    </PreviewShell>
  );
}
