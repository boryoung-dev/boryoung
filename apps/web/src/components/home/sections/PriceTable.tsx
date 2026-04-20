import Link from "next/link";
import { Check } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { PriceTableConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 가격 플랜 카드 섹션 */
export function PriceTable({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as PriceTableConfig;
  const style = cfg.style || {};
  const plans = cfg.plans || [];
  const columns = (cfg.columns || 3) as 2 | 3 | 4;

  if (plans.length === 0) return null;

  const isLight = style.textTheme === "light";

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
      <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-5`}>
        {plans.map((plan, i) => {
          const highlighted = !!plan.highlighted;
          const cardCls = highlighted
            ? "border-2 border-[color:var(--brand,#0071e3)] md:scale-[1.03] shadow-lg"
            : isLight
              ? "border border-white/15"
              : "border border-[color:var(--border,#d2d2d7)]";
          const bgCls = isLight && !highlighted ? "bg-white/5" : "bg-white";
          const titleColor = highlighted
            ? "text-[color:var(--brand,#0071e3)]"
            : isLight
              ? "text-white"
              : "text-[color:var(--fg,#1d1d1f)]";
          const priceColor = isLight && !highlighted
            ? "text-white"
            : "text-[color:var(--fg,#1d1d1f)]";
          const descColor = isLight && !highlighted
            ? "text-white/70"
            : "text-[color:var(--muted,#86868b)]";

          return (
            <div
              key={i}
              className={`relative p-6 md:p-7 rounded-2xl flex flex-col ${cardCls} ${bgCls}`}
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 bg-[color:var(--brand,#0071e3)] text-white text-[11px] font-semibold rounded-full">
                  추천
                </span>
              )}
              <h3 className={`text-base font-semibold ${titleColor}`}>
                {plan.name}
              </h3>
              <div className={`mt-3 flex items-baseline gap-1 ${priceColor}`}>
                <span className="text-3xl md:text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.priceUnit && (
                  <span className={`text-sm ${descColor}`}>{plan.priceUnit}</span>
                )}
              </div>
              {plan.description && (
                <p className={`mt-2 text-sm ${descColor}`}>{plan.description}</p>
              )}
              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        highlighted
                          ? "text-[color:var(--brand,#0071e3)]"
                          : isLight && !highlighted
                            ? "text-white/80"
                            : "text-[color:var(--fg,#1d1d1f)]"
                      }`}
                    />
                    <span className={priceColor}>{feat}</span>
                  </li>
                ))}
              </ul>
              {plan.ctaLabel && (
                <Link
                  href={plan.ctaUrl || "#"}
                  className={`mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-medium transition-all ${
                    highlighted
                      ? "bg-[color:var(--brand,#0071e3)] text-white hover:opacity-90"
                      : "border border-[color:var(--border,#d2d2d7)] text-[color:var(--fg,#1d1d1f)] hover:bg-[color:var(--surface,#f5f5f7)]"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
