"use client";

import { Globe, Pencil } from "lucide-react";

interface GlobeCountry {
  id: string;
  emoji?: string | null;
  name: string;
}

interface GlobePlaceholderProps {
  isSelected?: boolean;
  onClick?: () => void;
  countries?: GlobeCountry[];
}

/** 지구본 섹션 placeholder (3D 지구본은 미리보기 불가, 정적 표시) */
export function GlobePlaceholder({
  isSelected = false,
  onClick,
  countries = [],
}: GlobePlaceholderProps) {
  const previewEmojis = countries.slice(0, 6);
  const hasMore = countries.length > 6;

  return (
    <div
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)",
        minHeight: 320,
      }}
      className={`flex flex-col items-center justify-center gap-4 rounded-xl text-white transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-blue-400 ring-inset" : ""}`}
    >
      <Globe className="w-16 h-16 opacity-60" />
      <div className="text-center">
        <p className="text-lg font-semibold opacity-90">3D 지구본 섹션</p>
        <p className="text-sm opacity-50 mt-1">
          국가별 투어 탐색 (항상 최상단 고정)
        </p>
        {/* 국가 요약 */}
        {countries.length > 0 ? (
          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="text-xs opacity-60">현재 국가 {countries.length}개</p>
            <div className="flex items-center gap-1 text-lg">
              {previewEmojis.map((c) => (
                <span key={c.id} title={c.name}>
                  {c.emoji || "🌍"}
                </span>
              ))}
              {hasMore && (
                <span className="text-xs opacity-60 ml-1">…</span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs opacity-40">등록된 국가 없음</p>
        )}
        {/* 클릭 유도 */}
        {onClick && (
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-300 opacity-80">
            <Pencil className="w-3 h-3" />
            <span>클릭하여 국가 편집</span>
          </div>
        )}
      </div>
    </div>
  );
}
