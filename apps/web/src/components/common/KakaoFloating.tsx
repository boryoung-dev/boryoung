"use client";

import { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";

const SHAPES = [
  "rounded-full",
  "rounded-2xl",
  "rounded-full rotate-45",
  "rounded-[30%]",
  "rounded-full",
  "rounded-3xl rotate-12",
];

export function KakaoFloating() {
  const [expanded, setExpanded] = useState(false);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (expanded) return;

    const interval = setInterval(() => {
      setBounce(true);
      setShapeIdx((prev) => (prev + 1) % SHAPES.length);
      setTimeout(() => setBounce(false), 600);
    }, 2500);

    return () => clearInterval(interval);
  }, [expanded]);

  return (
    <div className="fixed bottom-[20vh] right-6 z-50 flex flex-col items-end gap-3">
      {/* 펼쳐지는 버튼들 */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          expanded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* 전화 상담 */}
        <a
          href="tel:1588-0320"
          className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>전화 상담</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <Phone className="w-4 h-4" />
          </div>
        </a>

        {/* 카카오톡 상담 */}
        <a
          href="https://pf.kakao.com/_placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-[#FAE100] rounded-full shadow-lg border border-[#E5CC00] text-sm font-bold text-[#371D1E] hover:bg-[#F5D800] transition-colors"
        >
          <span>카톡 상담</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#371D1E]/10">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
            </svg>
          </div>
        </a>
      </div>

      {/* 메인 토글 버튼 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          relative flex h-14 w-14 items-center justify-center
          shadow-lg transition-all duration-500 ease-out
          hover:scale-110 active:scale-95
          ${expanded
            ? "bg-gray-800 text-white rounded-full"
            : `bg-[#FAE100] text-[#371D1E] ${SHAPES[shapeIdx]}`
          }
          ${bounce && !expanded ? "animate-floating-bounce" : ""}
        `}
        aria-label={expanded ? "상담 메뉴 닫기" : "상담하기"}
      >
        {/* 반짝이 효과 */}
        {!expanded && (
          <span className="absolute inset-0 rounded-[inherit] animate-floating-ping bg-[#FAE100]/40" />
        )}

        {expanded ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative z-10"
          >
            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
