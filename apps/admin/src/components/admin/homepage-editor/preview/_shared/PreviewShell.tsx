"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  buildBackgroundStyle,
  paddingClass,
  themeColors,
  type PreviewStyleConfig,
} from "./styleHelpers";

interface PreviewShellProps {
  style?: PreviewStyleConfig;
  children: ReactNode;
  className?: string;
  minHeightPx?: number;
}

/**
 * 미리보기 공용 래퍼.
 * 실제 SectionContainer 로직을 미리보기 사이즈로 다운스케일한 버전.
 *
 * 시각 반영 항목:
 * - 배경(투명/색/그라디언트/이미지+오버레이)
 * - 풀와이드 vs 컨테이너 (좌우 여백 차이)
 * - 수직 패딩 (sm/md/lg/xl 비례 축소)
 * - 좌우 엣지 페이드 마스크
 * - 텍스트 테마 (light/dark)
 * - 우상단 정보 배지 (hover 시 노출)
 */
export function PreviewShell({
  style,
  children,
  className,
  minHeightPx,
}: PreviewShellProps) {
  const bg = style?.background;
  const bgStyle = buildBackgroundStyle(bg);
  const overlay = bg?.type === "image" ? (bg?.imageOverlay ?? 0) : 0;
  const theme = themeColors(style?.textTheme);
  const padding = paddingClass(style?.verticalPadding);
  const fullWidth = style?.fullWidth ?? false;
  const edgeFade = style?.edgeFade ?? false;

  const sectionStyle: CSSProperties = {
    ...bgStyle,
    ...(minHeightPx ? { minHeight: minHeightPx } : {}),
  };

  // 풀와이드면 좌우 여백 0, 아니면 미리보기용 여백
  const innerCls = fullWidth ? "w-full px-0" : "max-w-full mx-auto px-3";

  // 엣지 페이드 마스크
  const edgeFadeStyle: CSSProperties = edgeFade
    ? {
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }
    : {};

  // 정보 배지 표시 여부
  const hasBackground = !!bg && bg.type !== "transparent";
  const showBadges = fullWidth || hasBackground || edgeFade;

  return (
    <section
      className={`group relative ${padding} ${theme.title}`}
      style={sectionStyle}
    >
      {overlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${overlay})` }}
        />
      )}

      {/* 우상단 정보 배지 (hover 시에만 표시) */}
      {showBadges && (
        <div className="absolute top-1.5 right-1.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {fullWidth && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
              풀와이드
            </span>
          )}
          {hasBackground && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
              배경 적용
            </span>
          )}
          {edgeFade && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
              엣지 페이드
            </span>
          )}
        </div>
      )}

      <div
        className={`relative ${innerCls} ${className || ""}`}
        style={edgeFadeStyle}
      >
        {children}
      </div>
    </section>
  );
}
