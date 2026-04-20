import * as Icons from "lucide-react";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { IconCalloutsConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-3 md:grid-cols-6",
};

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 가벼운 아이콘 콜아웃 그리드 (FeatureCards 보다 작고 카드 배경 없음) */
export function IconCallouts({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as IconCalloutsConfig;
  const style = cfg.style || {};
  const items = cfg.items || [];
  const columns = (cfg.columns || 4) as 3 | 4 | 5 | 6;

  if (items.length === 0) return null;

  const isLight = style.textTheme === "light";
  const iconColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const titleColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const descColor = isLight
    ? "text-white/70"
    : "text-[color:var(--muted,#86868b)]";

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
      <div className={`grid ${COL_MAP[columns]} gap-6 md:gap-8`}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <DynamicIcon
              name={item.icon}
              className={`w-8 h-8 mb-3 ${iconColor}`}
            />
            <h3 className={`text-sm md:text-base font-semibold ${titleColor}`}>
              {item.title}
            </h3>
            {item.description && (
              <p className={`mt-1 text-xs md:text-sm leading-relaxed ${descColor}`}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
