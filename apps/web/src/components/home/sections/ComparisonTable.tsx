import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ComparisonTableConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 비교 테이블 섹션 */
export function ComparisonTable({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ComparisonTableConfig;
  const style = cfg.style || {};
  const headers = cfg.headers || [];
  const rows = cfg.rows || [];
  const highlightCol =
    typeof cfg.highlightCol === "number" ? cfg.highlightCol : -1;

  if (headers.length === 0 || rows.length === 0) return null;

  const isLight = style.textTheme === "light";
  const borderCls = isLight
    ? "border-white/15"
    : "border-[color:var(--border,#d2d2d7)]";
  const headerColor = isLight
    ? "text-white"
    : "text-[color:var(--fg,#1d1d1f)]";
  const cellColor = isLight
    ? "text-white/85"
    : "text-[color:var(--fg,#1d1d1f)]";
  const labelColor = isLight
    ? "text-white/70"
    : "text-[color:var(--muted,#86868b)]";

  const highlightBg = isLight ? "bg-white/10" : "bg-[color:var(--surface,#f5f5f7)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-sm md:text-base`}>
          <thead>
            <tr className={`border-b-2 ${borderCls}`}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-3 px-4 text-left font-semibold ${headerColor} ${
                    i === highlightCol ? `${highlightBg} rounded-t-lg` : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`border-b ${borderCls}`}>
                <td className={`py-3 px-4 font-medium ${labelColor}`}>
                  {row.label}
                </td>
                {row.values.map((v, ci) => {
                  // 값 컬럼 인덱스 = ci + 1 (라벨 컬럼 다음)
                  const colIdx = ci + 1;
                  return (
                    <td
                      key={ci}
                      className={`py-3 px-4 ${cellColor} ${
                        colIdx === highlightCol
                          ? `${highlightBg} font-semibold`
                          : ""
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
    </SectionContainer>
  );
}
