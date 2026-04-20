"use client";

import { Video } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  flexAlignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

const HEIGHT_PX: Record<string, number> = {
  "60vh": 200,
  "80vh": 260,
  "100vh": 320,
};

/** 비디오 히어로 미리보기 (정적: 영상 대신 포스터/플레이스홀더) */
export function VideoHeroPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = { fullWidth: true, ...(cfg.style || {}) };
  const buttons = (cfg.ctaButtons || []).slice(0, 2);
  const minH = HEIGHT_PX[cfg.heightPreset || "80vh"];
  const overlay = typeof cfg.overlay === "number" ? cfg.overlay : 0.4;
  const theme = themeColors(style.textTheme);
  const align = alignClass(style.textAlign);
  const poster = cfg.posterUrl;
  const hasVideo = !!cfg.videoUrl;

  return (
    <PreviewShell style={style} minHeightPx={minH} className={`flex items-center ${align}`}>
      {/* 배경 — 포스터 또는 어두운 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: poster
            ? `url(${poster})`
            : "linear-gradient(135deg, #1f2937, #111827)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      {overlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${overlay})`, zIndex: 1 }}
        />
      )}
      <div className="relative w-full" style={{ zIndex: 2 }}>
        {!hasVideo && (
          <div className="absolute top-1 right-1 inline-flex items-center gap-1 text-[9px] text-white/70 bg-black/40 px-2 py-0.5 rounded">
            <Video className="w-3 h-3" />
            영상 URL 필요
          </div>
        )}
        {curation.subtitle && (
          <p className={`text-[10px] font-medium tracking-wide uppercase mb-2 ${theme.muted}`}>
            {curation.subtitle}
          </p>
        )}
        {curation.title && (
          <h2
            className={`${titleSizeClass(style.fontSize?.title || "xl")} font-semibold tracking-tight leading-tight ${theme.title}`}
          >
            {renderLines(curation.title)}
          </h2>
        )}
        {curation.description && (
          <p className={`mt-2 text-xs ${theme.muted}`}>
            {renderLines(curation.description)}
          </p>
        )}
        {buttons.length > 0 && (
          <div className={`mt-4 flex gap-2 ${flexAlignClass(style.textAlign)}`}>
            {buttons.map((b: any, i: number) => (
              <span
                key={i}
                className={`inline-flex items-center justify-center h-8 px-4 rounded-full text-[11px] font-medium ${
                  (b.style || "primary") === "primary"
                    ? style.textTheme === "light"
                      ? "bg-white text-black"
                      : "bg-[var(--fg,#1d1d1f)] text-white"
                    : style.textTheme === "light"
                      ? "border border-white/60 text-white"
                      : "border border-[var(--border,#d2d2d7)] text-[var(--fg,#1d1d1f)]"
                }`}
              >
                {b.label || "버튼"}
              </span>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
