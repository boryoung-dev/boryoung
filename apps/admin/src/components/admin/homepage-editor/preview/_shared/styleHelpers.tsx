import type { CSSProperties } from "react";

/** SectionStyleConfig (web 쪽 타입) — 미리보기용 최소 정의 */
export interface PreviewStyleConfig {
  background?: {
    type: "transparent" | "color" | "gradient" | "image";
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: "to-r" | "to-br" | "to-b" | "to-bl";
    imageUrl?: string;
    imageOverlay?: number;
  };
  fullWidth?: boolean;
  verticalPadding?: "sm" | "md" | "lg" | "xl";
  textTheme?: "light" | "dark";
  textAlign?: "left" | "center" | "right";
  edgeFade?: boolean;
  fontSize?: {
    eyebrow?: "xs" | "sm" | "base";
    title?: "sm" | "md" | "lg" | "xl" | "2xl";
    description?: "sm" | "base" | "lg";
  };
}

const GRADIENT_DIR_MAP: Record<string, string> = {
  "to-r": "to right",
  "to-br": "to bottom right",
  "to-b": "to bottom",
  "to-bl": "to bottom left",
};

export function buildBackgroundStyle(
  bg?: PreviewStyleConfig["background"]
): CSSProperties {
  if (!bg || bg.type === "transparent") return {};
  if (bg.type === "color") return { background: bg.color || "transparent" };
  if (bg.type === "gradient") {
    const dir = GRADIENT_DIR_MAP[bg.gradientDirection || "to-br"];
    return {
      background: `linear-gradient(${dir}, ${bg.gradientFrom || "#3b82f6"}, ${bg.gradientTo || "#8b5cf6"})`,
    };
  }
  if (bg.type === "image") {
    return {
      backgroundImage: `url(${bg.imageUrl || ""})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {};
}

/** 미리보기는 축소 표시 — 패딩도 비례 축소 */
export function paddingClass(p?: PreviewStyleConfig["verticalPadding"]): string {
  switch (p) {
    case "sm":
      return "py-3";
    case "md":
      return "py-5";
    case "xl":
      return "py-10";
    case "lg":
    default:
      return "py-7";
  }
}

export function alignClass(a?: PreviewStyleConfig["textAlign"]): string {
  switch (a) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

export function flexAlignClass(a?: PreviewStyleConfig["textAlign"]): string {
  switch (a) {
    case "center":
      return "justify-center";
    case "right":
      return "justify-end";
    default:
      return "justify-start";
  }
}

export function themeColors(theme?: PreviewStyleConfig["textTheme"]) {
  if (theme === "light") {
    return {
      title: "text-white",
      muted: "text-white/70",
      cardBg: "bg-white/10 backdrop-blur-sm",
      cardBorder: "border-white/20",
    };
  }
  return {
    title: "text-[var(--fg,#1d1d1f)]",
    muted: "text-[var(--muted,#86868b)]",
    cardBg: "bg-white",
    cardBorder: "border-[var(--border,#d2d2d7)]",
  };
}

/**
 * 헤딩(Title) 폰트 크기 — 미리보기는 한 단계 작게.
 * `previewTitleClass` 별칭으로도 export.
 */
export function titleSizeClass(s?: NonNullable<PreviewStyleConfig["fontSize"]>["title"]): string {
  switch (s) {
    case "sm":
      return "text-sm";
    case "lg":
      return "text-xl";
    case "xl":
      return "text-2xl";
    case "2xl":
      return "text-3xl";
    case "md":
    default:
      return "text-base";
  }
}

/** 별칭 — 작업 명세 호환 */
export const previewTitleClass = titleSizeClass;

/** Eyebrow(말머리/카테고리) 폰트 크기 */
export function eyebrowSizeClass(
  s?: NonNullable<PreviewStyleConfig["fontSize"]>["eyebrow"]
): string {
  switch (s) {
    case "sm":
      return "text-[10px]";
    case "base":
      return "text-xs";
    case "xs":
    default:
      return "text-[9px]";
  }
}

/** Description(설명) 폰트 크기 */
export function descriptionSizeClass(
  s?: NonNullable<PreviewStyleConfig["fontSize"]>["description"]
): string {
  switch (s) {
    case "sm":
      return "text-[11px]";
    case "lg":
      return "text-sm";
    case "base":
    default:
      return "text-xs";
  }
}

/** 줄바꿈 (`\n`, `\\n`) 보존 렌더 */
export function renderLines(text: string | null | undefined) {
  if (!text) return null;
  const lines = text.replace(/\\n/g, "\n").split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}
