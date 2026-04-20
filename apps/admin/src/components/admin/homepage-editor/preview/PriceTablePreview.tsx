"use client";

import { Check } from "lucide-react";
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
  4: "grid-cols-2",
};

/** 가격 플랜 미리보기 */
export function PriceTablePreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const plans = (cfg.plans || []) as Array<any>;
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
          {curation.title && (
            <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
              {renderLines(curation.title)}
            </h2>
          )}
        </div>
      )}
      {plans.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-2`}>
          {plans.slice(0, 4).map((plan, i) => {
            const highlighted = !!plan.highlighted;
            return (
              <div
                key={i}
                className={`relative p-2 rounded ${
                  highlighted
                    ? "border-2 border-blue-500 bg-blue-50/30"
                    : "border border-[var(--border,#d2d2d7)] bg-white"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 text-[8px] font-semibold bg-blue-500 text-white rounded">
                    추천
                  </span>
                )}
                <p className="text-[10px] font-semibold text-gray-900">
                  {plan.name || "플랜"}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {plan.price || "₩0"}
                  {plan.priceUnit && (
                    <span className="text-[9px] font-normal text-gray-500 ml-0.5">
                      {plan.priceUnit}
                    </span>
                  )}
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {(plan.features || []).slice(0, 3).map((f: string, fi: number) => (
                    <li key={fi} className="flex items-start gap-1 text-[9px] text-gray-700">
                      <Check className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>플랜을 추가하세요</p>
      )}
    </PreviewShell>
  );
}
