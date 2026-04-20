import { Star, Quote } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { TestimonialSliderConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 고객 후기 가로 슬라이더 섹션 */
export function TestimonialSlider({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as TestimonialSliderConfig;
  const style = cfg.style || {};
  const testimonials = cfg.testimonials || [];

  if (testimonials.length === 0 && !curation.title) return null;

  const textLight = style.textTheme === "light";
  const cardBg = textLight ? "bg-white/10 backdrop-blur-sm" : "bg-white";
  const cardBorder = textLight ? "border-white/20" : "border-[color:var(--border,#d2d2d7)]";
  const titleColor = textLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const subColor = textLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]";

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
      {testimonials.length > 0 && (
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 md:gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-[300px] md:w-[360px] p-6 rounded-2xl border ${cardBg} ${cardBorder}`}
              >
                <Quote
                  className={`w-6 h-6 mb-3 opacity-40 ${titleColor}`}
                />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < (t.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : textLight
                            ? "text-white/20"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-5 ${titleColor}`}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        textLight ? "bg-white/20 text-white" : "bg-[color:var(--surface,#f5f5f7)] text-[color:var(--fg,#1d1d1f)]"
                      }`}
                    >
                      {(t.name || "?").charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${titleColor}`}>
                      {t.name}
                    </p>
                    {t.affiliation && (
                      <p className={`text-xs ${subColor}`}>{t.affiliation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionContainer>
  );
}
