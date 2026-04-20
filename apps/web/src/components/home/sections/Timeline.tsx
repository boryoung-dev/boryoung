import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { TimelineConfig } from "./_shared/types";
import { splitLines } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 세로 연혁 타임라인 — 좌측 라인 + 점 + 우측 컨텐츠 */
export function Timeline({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as TimelineConfig;
  const style = cfg.style || {};
  const events = cfg.events || [];
  const lineColor = cfg.lineColor || "var(--border,#d2d2d7)";

  if (events.length === 0) return null;

  const isLight = style.textTheme === "light";
  const yearColor = "text-[color:var(--brand,#0071e3)]";
  const titleColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const descColor = isLight
    ? "text-white/70"
    : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10 max-w-3xl mx-auto">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <ol className="relative">
          {/* 세로선 */}
          <div
            className="absolute left-3 top-2 bottom-2 w-px"
            style={{ background: lineColor }}
          />
          {events.map((event, i) => (
            <li key={i} className="relative pl-10 pb-8 last:pb-0">
              {/* 점 */}
              <span
                className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-white"
                style={{ borderColor: "var(--brand,#0071e3)" }}
              />
              <div className={`text-sm font-bold ${yearColor}`}>{event.year}</div>
              <h3 className={`mt-1 text-lg md:text-xl font-semibold ${titleColor}`}>
                {event.title}
              </h3>
              {event.description && (
                <p className={`mt-1 text-sm leading-relaxed ${descColor}`}>
                  {splitLines(event.description).map((line, idx, arr) => (
                    <span key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </SectionContainer>
  );
}
