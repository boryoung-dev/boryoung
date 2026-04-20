import type { ReactNode, CSSProperties } from "react";
import type { SectionStyleConfig } from "./types";

interface SectionContainerProps {
  style?: SectionStyleConfig;
  children: ReactNode;
  /** 추가 컨테이너 클래스 (인너 래퍼) */
  className?: string;
  /** 섹션 자체에 추가할 스타일 */
  sectionStyle?: CSSProperties;
  /** 최소 높이 (FullBleedHero 등) */
  minHeight?: string;
}

const PADDING_MAP: Record<NonNullable<SectionStyleConfig["verticalPadding"]>, string> = {
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
  xl: "py-20 md:py-32",
};

const GRADIENT_DIR_MAP: Record<
  NonNullable<NonNullable<SectionStyleConfig["background"]>["gradientDirection"]>,
  string
> = {
  "to-r": "to right",
  "to-br": "to bottom right",
  "to-b": "to bottom",
  "to-bl": "to bottom left",
};

function buildBackgroundStyle(bg?: SectionStyleConfig["background"]): CSSProperties {
  if (!bg || bg.type === "transparent") return {};
  if (bg.type === "color") {
    return { background: bg.color || "transparent" };
  }
  if (bg.type === "gradient") {
    const dir = GRADIENT_DIR_MAP[bg.gradientDirection || "to-br"];
    const from = bg.gradientFrom || "#3b82f6";
    const to = bg.gradientTo || "#8b5cf6";
    return { background: `linear-gradient(${dir}, ${from}, ${to})` };
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

/**
 * 모든 신규 홈 섹션의 공통 래퍼.
 * - 풀블리드 vs 1200px 컨테이너
 * - 배경(투명/색/그라디언트/이미지+오버레이)
 * - 수직 패딩 프리셋
 * - 좌우 엣지 페이드 마스크
 * - 텍스트 테마 (light/dark)
 */
export function SectionContainer({
  style,
  children,
  className,
  sectionStyle,
  minHeight,
}: SectionContainerProps) {
  const bg = style?.background;
  const fullWidth = style?.fullWidth ?? false;
  const padding = PADDING_MAP[style?.verticalPadding || "lg"];
  const textTheme = style?.textTheme || "dark";
  const edgeFade = style?.edgeFade ?? false;

  const backgroundStyle = buildBackgroundStyle(bg);
  const overlayOpacity = bg?.type === "image" ? bg?.imageOverlay ?? 0 : 0;

  const innerWrapper = fullWidth
    ? "w-full px-0"
    : "max-w-[1200px] mx-auto px-4 md:px-6";

  const themeClass = textTheme === "light" ? "text-white" : "text-[color:var(--fg,#1d1d1f)]";

  const edgeFadeStyle: CSSProperties = edgeFade
    ? {
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }
    : {};

  return (
    <section
      className={`relative ${padding} ${themeClass}`}
      style={{
        ...backgroundStyle,
        ...sectionStyle,
        ...(minHeight ? { minHeight } : {}),
      }}
    >
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}
      <div
        className={`relative ${innerWrapper} ${className || ""}`}
        style={edgeFadeStyle}
      >
        {children}
      </div>
    </section>
  );
}
