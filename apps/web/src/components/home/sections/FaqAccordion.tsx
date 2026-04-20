"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { FaqAccordionConfig } from "./_shared/types";
import { splitLines } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** FAQ 아코디언 섹션 — 클릭 시 펼침/접힘 */
export function FaqAccordion({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as FaqAccordionConfig;
  const style = cfg.style || {};
  const items = cfg.items || [];
  const defaultOpen =
    typeof cfg.defaultOpenIndex === "number" ? cfg.defaultOpenIndex : -1;
  const [openIndex, setOpenIndex] = useState<number>(defaultOpen);

  if (items.length === 0) return null;

  const isLight = style.textTheme === "light";
  const borderCls = isLight
    ? "border-white/15"
    : "border-[color:var(--border,#d2d2d7)]";
  const qColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const aColor = isLight
    ? "text-white/80"
    : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8 max-w-3xl mx-auto">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {items.map((item, i) => {
          const open = i === openIndex;
          return (
            <div key={i} className={`border-b ${borderCls}`}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
              >
                <span className={`text-base md:text-lg font-medium ${qColor}`}>
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${qColor} ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open && (
                <div className={`pb-5 text-sm md:text-base leading-relaxed ${aColor}`}>
                  {splitLines(item.answer).map((line, idx, arr) => (
                    <span key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
