"use client";

import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

/** 그라디언트 풀와이드 배너 미리보기 */
export function GradientBannerPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = {
    fullWidth: true,
    textTheme: "light",
    textAlign: "center",
    background: {
      type: "gradient",
      gradientFrom: "#3b82f6",
      gradientTo: "#1e40af",
      gradientDirection: "to-br",
    },
    fontSize: { title: "xl" },
    ...(cfg.style || {}),
  };
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style} className="text-center">
      {curation.subtitle && (
        <p className={`text-[10px] font-medium tracking-wide uppercase mb-2 ${theme.muted}`}>
          {curation.subtitle}
        </p>
      )}
      <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold tracking-tight ${theme.title}`}>
        {renderLines(curation.title)}
      </h2>
      {curation.description && (
        <p className={`mt-2 text-xs ${theme.muted}`}>{renderLines(curation.description)}</p>
      )}
    </PreviewShell>
  );
}
