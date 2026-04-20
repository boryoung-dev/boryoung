import type { ReactNode } from "react";
import type { SectionStyleConfig } from "./types";
import { splitLines } from "./types";

interface SectionHeadingProps {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  style?: SectionStyleConfig;
  className?: string;
  /** 우측 슬롯 (예: "전체 보기 →" 링크). textAlign이 left일 때 우측에 배치 */
  action?: ReactNode;
}

const TITLE_SIZE: Record<
  NonNullable<NonNullable<SectionStyleConfig["fontSize"]>["title"]>,
  string
> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-4xl md:text-5xl",
  "2xl": "text-5xl md:text-6xl",
};

const EYEBROW_SIZE: Record<
  NonNullable<NonNullable<SectionStyleConfig["fontSize"]>["eyebrow"]>,
  string
> = {
  xs: "text-[11px]",
  sm: "text-xs",
  base: "text-sm",
};

const DESC_SIZE: Record<
  NonNullable<NonNullable<SectionStyleConfig["fontSize"]>["description"]>,
  string
> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const ALIGN_MAP: Record<
  NonNullable<SectionStyleConfig["textAlign"]>,
  string
> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * 공용 섹션 헤딩 (eyebrow + title + description).
 * - 폰트 크기 / 정렬 / 텍스트 테마(light/dark) 지원
 * - 줄바꿈(`\n`, `\\n`) 보존
 * - `action` 슬롯 (우측 — "전체 보기 →" 같은 링크용, textAlign=left일 때만 우측 정렬)
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  style,
  className,
  action,
}: SectionHeadingProps) {
  if (!eyebrow && !title && !description && !action) return null;

  const textTheme = style?.textTheme || "dark";
  const align = ALIGN_MAP[style?.textAlign || "left"];
  const titleClass = TITLE_SIZE[style?.fontSize?.title || "md"];
  const eyebrowClass = EYEBROW_SIZE[style?.fontSize?.eyebrow || "xs"];
  const descClass = DESC_SIZE[style?.fontSize?.description || "base"];

  const eyebrowColor =
    textTheme === "light" ? "text-white/70" : "text-[color:var(--muted,#86868b)]";
  const titleColor = textTheme === "light" ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";
  const descColor =
    textTheme === "light" ? "text-white/80" : "text-[color:var(--muted,#86868b)]";

  const renderMultiline = (text: string) => {
    const lines = splitLines(text);
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  const headingBlock = (
    <div className={align}>
      {eyebrow && (
        <p
          className={`${eyebrowClass} ${eyebrowColor} font-medium tracking-wide uppercase mb-2`}
        >
          {eyebrow}
        </p>
      )}
      {title && (
        <h2
          className={`${titleClass} ${titleColor} font-semibold tracking-tight leading-[1.2]`}
        >
          {renderMultiline(title)}
        </h2>
      )}
      {description && (
        <p className={`${descClass} ${descColor} mt-3 leading-relaxed`}>
          {renderMultiline(description)}
        </p>
      )}
    </div>
  );

  // action이 있고 textAlign이 left(기본)면 좌우 분할 레이아웃
  const isLeftAlign = (style?.textAlign || "left") === "left";
  if (action && isLeftAlign) {
    return (
      <div className={`flex items-end justify-between gap-4 ${className || ""}`}>
        {headingBlock}
        <div className="flex-shrink-0">{action}</div>
      </div>
    );
  }

  // action이 있는데 center/right인 경우 헤딩 아래 액션
  if (action) {
    return (
      <div className={className || ""}>
        {headingBlock}
        <div className={`mt-4 ${align}`}>{action}</div>
      </div>
    );
  }

  return <div className={className || ""}>{headingBlock}</div>;
}
