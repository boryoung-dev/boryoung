import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { AwardsBadgesConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const COL_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-3 md:grid-cols-5",
  6: "grid-cols-3 md:grid-cols-6",
};

/** 수상/인증 배지 그리드 */
export function AwardsBadges({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as AwardsBadgesConfig;
  const style = cfg.style || {};
  const badges = cfg.badges || [];
  const columns = (cfg.columns || 4) as 3 | 4 | 5 | 6;

  if (badges.length === 0) return null;

  const isLight = style.textTheme === "light";
  const nameColor = isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const yearColor = isLight
    ? "text-white/60"
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
        {badges.map((badge, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <img
              src={badge.imageUrl}
              alt={badge.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
            <p className={`mt-3 text-sm font-semibold leading-tight ${nameColor}`}>
              {badge.name}
            </p>
            {badge.year && (
              <p className={`mt-0.5 text-xs ${yearColor}`}>{badge.year}</p>
            )}
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
