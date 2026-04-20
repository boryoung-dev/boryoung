import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { StatHighlightsConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

/** 큰 숫자 강조 통계 카드 섹션 */
export function StatHighlights({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as StatHighlightsConfig;
  const style = cfg.style || {};
  const stats = cfg.stats || [];
  const columns = (cfg.columns || 3) as 2 | 3 | 4;

  if (stats.length === 0 && !curation.title) return null;

  const valueColor =
    style.textTheme === "light"
      ? "text-white"
      : "text-[color:var(--fg,#1d1d1f)]";
  const labelColor =
    style.textTheme === "light"
      ? "text-white/70"
      : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      {stats.length > 0 && (
        <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-6`}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`${
                style.textAlign === "left"
                  ? "text-left"
                  : style.textAlign === "right"
                    ? "text-right"
                    : "text-center"
              }`}
            >
              <div className={`flex items-baseline gap-1 ${
                style.textAlign === "center"
                  ? "justify-center"
                  : style.textAlign === "right"
                    ? "justify-end"
                    : "justify-start"
              }`}>
                <span className={`text-4xl md:text-5xl font-bold tracking-tight ${valueColor}`}>
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className={`text-lg font-medium ${labelColor}`}>
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm font-medium ${valueColor}`}>{stat.label}</p>
              {stat.description && (
                <p className={`mt-1 text-xs ${labelColor}`}>{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
