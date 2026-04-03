"use client";

import { Globe } from "lucide-react";

/** 지구본 섹션 placeholder (3D 지구본은 미리보기 불가, 정적 표시) */
export function GlobePlaceholder() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)",
        minHeight: 320,
      }}
      className="flex flex-col items-center justify-center gap-4 rounded-xl text-white"
    >
      <Globe className="w-16 h-16 opacity-60" />
      <div className="text-center">
        <p className="text-lg font-semibold opacity-90">3D 지구본 섹션</p>
        <p className="text-sm opacity-50 mt-1">
          국가별 투어 탐색 (항상 최상단 고정, 편집 불가)
        </p>
      </div>
    </div>
  );
}
