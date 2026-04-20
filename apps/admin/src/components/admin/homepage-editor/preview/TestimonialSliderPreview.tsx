"use client";

import { Star, Quote } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** 후기 슬라이더 미리보기 */
export function TestimonialSliderPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const testimonials = (cfg.testimonials || []) as Array<{
    rating: number;
    quote: string;
    name: string;
    affiliation?: string;
    avatarUrl?: string;
  }>;
  const theme = themeColors(style.textTheme);
  const textLight = style.textTheme === "light";

  return (
    <PreviewShell style={style}>
      {(curation.title || curation.subtitle) && (
        <div className={`mb-3 ${alignClass(style.textAlign)}`}>
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
      {testimonials.length > 0 ? (
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-2">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-[180px] p-3 rounded-lg border ${theme.cardBg} ${theme.cardBorder}`}
              >
                <Quote className={`w-3 h-3 mb-1 opacity-40 ${theme.title}`} />
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-2.5 h-2.5 ${
                        idx < (t.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : textLight ? "text-white/20" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[10px] leading-snug mb-2 line-clamp-3 ${theme.title}`}>
                  "{t.quote}"
                </p>
                <p className={`text-[10px] font-semibold ${theme.title}`}>{t.name}</p>
                {t.affiliation && (
                  <p className={`text-[9px] ${theme.muted}`}>{t.affiliation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>후기를 추가해주세요</p>
      )}
    </PreviewShell>
  );
}
