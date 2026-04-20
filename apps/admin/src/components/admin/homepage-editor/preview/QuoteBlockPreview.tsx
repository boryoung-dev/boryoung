"use client";

import { Quote } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  renderLines,
  themeColors,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** 인용구 블록 미리보기 */
export function QuoteBlockPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const quote = (cfg.quote || "") as string;
  const theme = themeColors(style.textTheme);
  const quoteIconColor =
    style.textTheme === "light" ? "text-white/30" : "text-blue-500/30";

  return (
    <PreviewShell style={style}>
      <div className="text-center max-w-md mx-auto">
        <Quote className={`w-5 h-5 mx-auto ${quoteIconColor}`} />
        {quote ? (
          <blockquote className={`mt-2 text-sm font-semibold leading-snug ${theme.title}`}>
            {renderLines(quote)}
          </blockquote>
        ) : (
          <p className={`mt-2 text-xs ${theme.muted}`}>인용구를 입력하세요</p>
        )}
        {(cfg.author || cfg.role || cfg.avatarUrl) && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {cfg.avatarUrl && (
              <img
                src={cfg.avatarUrl}
                alt={cfg.author || ""}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <div className="text-left">
              {cfg.author && (
                <p className={`text-[10px] font-semibold ${theme.title}`}>
                  {cfg.author}
                </p>
              )}
              {cfg.role && (
                <p className={`text-[9px] ${theme.muted}`}>{cfg.role}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
