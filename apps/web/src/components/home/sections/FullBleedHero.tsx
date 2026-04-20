import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type {
  CtaButtonItem,
  FullBleedHeroConfig,
} from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 풀스크린 히어로 섹션 */
export function FullBleedHero({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as FullBleedHeroConfig;
  const style = {
    // 풀블리드 기본 ON
    fullWidth: true,
    ...(cfg.style || {}),
  };
  const heightPreset = cfg.heightPreset || "80vh";
  const minHeightMap: Record<string, string> = {
    "60vh": "60vh",
    "80vh": "80vh",
    "100vh": "100vh",
  };
  const buttons = (cfg.ctaButtons || []).slice(0, 2);

  if (!curation.title && !curation.subtitle && !curation.description && buttons.length === 0) {
    return null;
  }

  return (
    <SectionContainer
      style={style}
      minHeight={minHeightMap[heightPreset]}
      className="flex items-center justify-center"
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        <SectionHeading
          eyebrow={curation.subtitle}
          title={curation.title}
          description={curation.description}
          style={style}
        />
        {buttons.length > 0 && (
          <div
            className={`mt-8 flex flex-wrap gap-3 ${
              style.textAlign === "center"
                ? "justify-center"
                : style.textAlign === "right"
                  ? "justify-end"
                  : "justify-start"
            }`}
          >
            {buttons.map((btn, i) => (
              <CtaButton key={i} button={btn} textTheme={style.textTheme} />
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

function CtaButton({
  button,
  textTheme,
}: {
  button: CtaButtonItem;
  textTheme?: "light" | "dark";
}) {
  const isPrimary = (button.style || "primary") === "primary";
  const baseCls =
    "inline-flex items-center justify-center h-12 px-8 rounded-full text-sm font-medium transition-all";
  const primaryCls =
    textTheme === "light"
      ? "bg-white text-black hover:bg-white/90"
      : "bg-[color:var(--fg,#1d1d1f)] text-white hover:opacity-90";
  const outlineCls =
    textTheme === "light"
      ? "border border-white/60 text-white hover:bg-white/10"
      : "border border-[color:var(--border,#d2d2d7)] text-[color:var(--fg,#1d1d1f)] hover:bg-[color:var(--surface,#f5f5f7)]";

  return (
    <Link
      href={button.url || "#"}
      className={`${baseCls} ${isPrimary ? primaryCls : outlineCls}`}
    >
      {button.label || "버튼"}
    </Link>
  );
}
