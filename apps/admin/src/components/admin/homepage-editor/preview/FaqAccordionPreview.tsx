"use client";

import { ChevronDown } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** FAQ 아코디언 미리보기 (정적) */
export function FaqAccordionPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const items = (cfg.items || []) as Array<{ question: string; answer: string }>;
  const defaultOpen =
    typeof cfg.defaultOpenIndex === "number" ? cfg.defaultOpenIndex : -1;
  const theme = themeColors(style.textTheme);
  const borderCls = style.textTheme === "light"
    ? "border-white/15"
    : "border-[var(--border,#d2d2d7)]";

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
      {items.length > 0 ? (
        <div className="max-w-md mx-auto">
          {items.slice(0, 4).map((item, i) => {
            const isOpen = i === defaultOpen;
            return (
              <div key={i} className={`border-b ${borderCls}`}>
                <div className="flex items-center justify-between gap-2 py-2">
                  <span className={`text-xs font-medium ${theme.title} truncate`}>
                    {item.question || "질문"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 flex-shrink-0 ${theme.muted} ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isOpen && item.answer && (
                  <p className={`pb-2 text-[10px] ${theme.muted} line-clamp-2`}>
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>FAQ 항목을 추가하세요</p>
      )}
    </PreviewShell>
  );
}
