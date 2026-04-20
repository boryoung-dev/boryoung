"use client";

import * as Icons from "lucide-react";
import type { Curation } from "../HomepageEditor";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  alignClass,
  renderLines,
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

const COL_MAP: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as any)[name];
  if (!Icon || typeof Icon !== "function") return null;
  return <Icon className={className} />;
}

/** 아이콘 콜아웃 미리보기 */
export function IconCalloutsPreview({ curation }: { curation: Curation }) {
  const cfg = curation.displayConfig || {};
  const style: PreviewStyleConfig = cfg.style || {};
  const items = (cfg.items || []) as Array<{
    icon: string;
    title: string;
    description?: string;
  }>;
  const columns = (cfg.columns || 4) as 3 | 4 | 5 | 6;
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
          {curation.title && (
            <h2 className={`${titleSizeClass(style.fontSize?.title)} font-semibold ${theme.title}`}>
              {renderLines(curation.title)}
            </h2>
          )}
        </div>
      )}
      {items.length > 0 ? (
        <div className={`grid ${COL_MAP[columns]} gap-2`}>
          {items.slice(0, 8).map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center px-1">
              <DynamicIcon name={item.icon} className={`w-5 h-5 mb-1 ${theme.title}`} />
              <p className={`text-[10px] font-semibold leading-tight ${theme.title}`}>
                {item.title}
              </p>
              {item.description && (
                <p className={`text-[9px] line-clamp-1 ${theme.muted}`}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center ${theme.muted}`}>항목을 추가하세요</p>
      )}
    </PreviewShell>
  );
}
