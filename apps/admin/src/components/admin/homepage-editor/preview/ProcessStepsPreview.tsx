"use client";

import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 프로세스 단계 미리보기 */
export function ProcessStepsPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const steps = (cfg.steps || []) as Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      {(curation.title || curation.subtitle) && (
        <div className={`mb-3 ${alignClass(style.textAlign)}`}>
          {curation.subtitle && (
            <p className={`text-[10px] font-medium uppercase tracking-wide ${theme.muted}`}>
              {curation.subtitle}
            </p>
          )}
          <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
            {renderLines(curation.title)}
          </h2>
        </div>
      )}
      {steps.length > 0 ? (
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-1 items-center gap-1">
              <div className={`flex-1 p-2 rounded-lg border ${theme.cardBorder}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-base font-bold ${theme.muted}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.icon && (
                    <DynamicIcon
                      name={s.icon}
                      className={`w-3 h-3 ${theme.title} opacity-70`}
                    />
                  )}
                </div>
                <p className={`text-[10px] font-semibold ${theme.title}`}>{s.title}</p>
                {s.description && (
                  <p className={`text-[9px] mt-0.5 line-clamp-2 ${theme.muted}`}>
                    {s.description}
                  </p>
                )}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className={`w-3 h-3 flex-shrink-0 ${theme.muted}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>단계를 추가해주세요</p>
      )}
    </PreviewShell>
  );
}
