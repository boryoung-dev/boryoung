"use client";

import { MapPin } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import {
  themeColors,
  titleSizeClass,
  type PreviewStyleConfig,
} from "./_shared/styleHelpers";

interface Curation {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  displayConfig?: any;
}

/** 여행지 원형 캐러셀 미리보기 */
export function DestinationsCarouselPreview({
  curation,
}: {
  curation: Curation;
}) {
  const destinations =
    (curation.displayConfig?.destinations as Array<{
      name: string;
      image: string;
    }>) || [];
  const style: PreviewStyleConfig = curation.displayConfig?.style || {};
  const theme = themeColors(style.textTheme);

  return (
    <PreviewShell style={style}>
      <div className="flex items-end justify-between mb-5">
        <h2
          className={`${titleSizeClass(style.fontSize?.title)} font-semibold tracking-tight ${theme.title}`}
        >
          {curation.title}
        </h2>
        <span className={`text-[11px] ${theme.muted}`}>전체 보기 →</span>
      </div>

      {destinations.length === 0 ? (
        <div
          style={{
            background: "var(--surface, #f5f5f7)",
            color: "var(--muted, #86868b)",
          }}
          className="flex flex-col items-center justify-center py-16 rounded-xl"
        >
          <MapPin className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">등록된 여행지가 없습니다</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-hidden">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className="flex-shrink-0"
              style={{ width: 120 }}
            >
              <div
                className="aspect-square rounded-2xl overflow-hidden mb-1.5"
                style={{ background: "var(--surface, #f5f5f7)" }}
              >
                {dest.image ? (
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin
                      className="w-6 h-6"
                      style={{ color: "var(--muted, #86868b)" }}
                    />
                  </div>
                )}
              </div>
              <p
                className={`text-xs font-medium text-center ${theme.title}`}
              >
                {dest.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </PreviewShell>
  );
}
