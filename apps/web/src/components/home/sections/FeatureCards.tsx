import Link from "next/link";
import * as Icons from "lucide-react";
import type { CSSProperties } from "react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { FeatureCardsConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

const GRADIENT_DIR_MAP: Record<string, string> = {
  "to-r": "to right",
  "to-br": "to bottom right",
  "to-b": "to bottom",
  "to-bl": "to bottom left",
};

function buildCardStyle(
  bg: FeatureCardsConfig["cardBackground"]
): CSSProperties {
  if (!bg || bg.type === "transparent") return {};
  if (bg.type === "color") return { background: bg.color || "transparent" };
  if (bg.type === "gradient") {
    const dir = GRADIENT_DIR_MAP[bg.gradientDirection || "to-br"];
    return {
      background: `linear-gradient(${dir}, ${bg.gradientFrom || "#3b82f6"}, ${bg.gradientTo || "#8b5cf6"})`,
    };
  }
  return {};
}

/** 동적으로 lucide 아이콘 렌더링 (안전하게) */
function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 아이콘 카드 그리드 섹션 */
export function FeatureCards({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as FeatureCardsConfig;
  const style = cfg.style || {};
  const cards = cfg.cards || [];
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const cardStyleObj = buildCardStyle(cfg.cardBackground);
  const hasCardBg =
    cfg.cardBackground && cfg.cardBackground.type !== "transparent";

  if (cards.length === 0 && !curation.title) return null;

  // 카드 텍스트 색상: 카드 배경이 있으면 흰색, 없으면 섹션 테마 따라감
  const cardTextLight = hasCardBg || style.textTheme === "light";
  const cardTitleColor = cardTextLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const cardDescColor = cardTextLight ? "text-white/80" : "text-[color:var(--muted,#86868b)]";

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
      {cards.length > 0 && (
        <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-5`}>
          {cards.map((card, i) => {
            const inner = (
              <>
                {card.icon && (
                  <div
                    className={`mb-4 inline-flex w-12 h-12 items-center justify-center rounded-xl ${
                      hasCardBg
                        ? "bg-white/15 text-white"
                        : "bg-[color:var(--surface,#f5f5f7)] text-[color:var(--fg,#1d1d1f)]"
                    }`}
                  >
                    <DynamicIcon name={card.icon} className="w-6 h-6" />
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${cardTitleColor}`}>
                  {card.title}
                </h3>
                {card.description && (
                  <p className={`mt-2 text-sm leading-relaxed ${cardDescColor}`}>
                    {card.description}
                  </p>
                )}
              </>
            );
            const cardCls = `block p-6 rounded-2xl ${
              hasCardBg ? "" : "border border-[color:var(--border,#d2d2d7)]"
            } transition-all hover:-translate-y-0.5`;
            return card.linkUrl ? (
              <Link
                key={i}
                href={card.linkUrl}
                className={cardCls}
                style={cardStyleObj}
              >
                {inner}
              </Link>
            ) : (
              <div key={i} className={cardCls} style={cardStyleObj}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </SectionContainer>
  );
}
