import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { RichTextConfig } from "./_shared/types";
import { splitLines } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

const MAX_WIDTH_MAP: Record<NonNullable<RichTextConfig["maxWidth"]>, string> = {
  narrow: "max-w-[640px]",
  normal: "max-w-[800px]",
  wide: "max-w-[1100px]",
};

/** 자유 리치 텍스트 섹션 */
export function RichText({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as RichTextConfig;
  const style = cfg.style || {};
  const body = cfg.body || "";
  const maxWidth = MAX_WIDTH_MAP[cfg.maxWidth || "normal"];

  if (!curation.title && !curation.description && !body) return null;

  const bodyColor =
    style.textTheme === "light"
      ? "text-white/85"
      : "text-[color:var(--fg,#1d1d1f)]";

  const align = style.textAlign || "left";
  const alignCls =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <SectionContainer style={style}>
      <div className={`${maxWidth} mx-auto`}>
        <SectionHeading
          eyebrow={curation.subtitle}
          title={curation.title}
          description={curation.description}
          style={style}
        />
        {body && (
          <div className={`mt-6 text-base leading-[1.8] whitespace-pre-line ${bodyColor} ${alignCls}`}>
            {splitLines(body).map((line, i) => (
              <span key={i}>
                {line}
                {i < splitLines(body).length - 1 && "\n"}
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
