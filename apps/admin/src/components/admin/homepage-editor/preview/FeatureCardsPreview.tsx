"use client";

import * as Icons from "lucide-react";
import type { CSSProperties } from "react";
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

const GRADIENT_DIR_MAP: Record<string, string> = {
  "to-r": "to right",
  "to-br": "to bottom right",
  "to-b": "to bottom",
  "to-bl": "to bottom left",
};

function buildCardBg(cardBg: any): CSSProperties {
  if (!cardBg || cardBg.type === "transparent") return {};
  if (cardBg.type === "color") return { background: cardBg.color || "transparent" };
  if (cardBg.type === "gradient") {
    const dir = GRADIENT_DIR_MAP[cardBg.gradientDirection || "to-br"];
    return {
      background: `linear-gradient(${dir}, ${cardBg.gradientFrom || "#3b82f6"}, ${cardBg.gradientTo || "#8b5cf6"})`,
    };
  }
  return {};
}

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 아이콘 카드 그리드 미리보기 */
export function FeatureCardsPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const cards = (cfg.cards || []) as Array<{
    icon?: string;
    title: string;
    description?: string;
    linkUrl?: string;
  }>;
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const cardBgStyle = buildCardBg(cfg.cardBackground);
  const hasCardBg = cfg.cardBackground && cfg.cardBackground.type !== "transparent";
  const theme = themeColors(style.textTheme);
  const cardTextLight = hasCardBg || style.textTheme === "light";
  const cardTitle = cardTextLight ? "text-white" : "text-[var(--fg,#1d1d1f)]";
  const cardDesc = cardTextLight ? "text-white/80" : "text-[var(--muted,#86868b)]";

  return (
    <PreviewShell style={style}>
      {(curation.title || curation.subtitle) && (
        <div className={`mb-4 ${alignClass(style.textAlign)}`}>
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
      {cards.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-2`}>
          {cards.slice(0, 6).map((card, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                hasCardBg ? "" : "border border-[var(--border,#d2d2d7)]"
              }`}
              style={cardBgStyle}
            >
              {card.icon && (
                <div
                  className={`mb-2 inline-flex w-7 h-7 items-center justify-center rounded ${
                    hasCardBg ? "bg-white/15 text-white" : "bg-[var(--surface,#f5f5f7)] text-[var(--fg,#1d1d1f)]"
                  }`}
                >
                  <DynamicIcon name={card.icon} className="w-4 h-4" />
                </div>
              )}
              <p className={`text-xs font-semibold ${cardTitle}`}>{card.title}</p>
              {card.description && (
                <p className={`text-[10px] mt-0.5 line-clamp-2 ${cardDesc}`}>{card.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>카드를 추가해주세요</p>
      )}
    </PreviewShell>
  );
}
