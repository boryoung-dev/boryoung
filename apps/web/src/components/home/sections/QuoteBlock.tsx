import { Quote } from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import type { QuoteBlockConfig } from "./_shared/types";
import { splitLines } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 큰 인용구 블록 — 중앙 정렬 기본 */
export function QuoteBlock({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as QuoteBlockConfig;
  const style = cfg.style || {};
  const quote = cfg.quote || "";

  if (!quote && !curation.title) return null;

  const isLight = style.textTheme === "light";
  const quoteIconColor = isLight ? "text-white/30" : "text-[color:var(--brand,#0071e3)]/30";
  const quoteColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const authorColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const roleColor = isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]";

  return (
    <SectionContainer style={style}>
      <div className="max-w-3xl mx-auto text-center">
        <Quote className={`w-10 h-10 md:w-12 md:h-12 mx-auto ${quoteIconColor}`} />
        {quote && (
          <blockquote
            className={`mt-4 text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight ${quoteColor}`}
          >
            {splitLines(quote).map((line, idx, arr) => (
              <span key={idx}>
                {line}
                {idx < arr.length - 1 && <br />}
              </span>
            ))}
          </blockquote>
        )}
        {(cfg.author || cfg.role || cfg.avatarUrl) && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {cfg.avatarUrl && (
              <img
                src={cfg.avatarUrl}
                alt={cfg.author || ""}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="text-left">
              {cfg.author && (
                <p className={`text-sm font-semibold ${authorColor}`}>
                  {cfg.author}
                </p>
              )}
              {cfg.role && (
                <p className={`text-xs ${roleColor}`}>{cfg.role}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
