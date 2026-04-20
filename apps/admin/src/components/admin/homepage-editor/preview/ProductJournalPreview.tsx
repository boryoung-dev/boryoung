"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { renderLines, themeColors, titleSizeClass } from "./_shared/styleHelpers";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  destination?: string;
  basePrice?: number;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  displayConfig?: any;
  products?: Product[];
}

const COL_CLS: Record<2 | 3, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
};

/** 여행 일지 미리보기 */
export function ProductJournalPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3;
  const startDay = typeof curation.displayConfig?.startDay === "number" ? curation.displayConfig.startDay : 1;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg
    ? undefined
    : {
        background:
          "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px), #f0e4d0",
        backgroundSize: "14px 14px, 14px 14px, auto",
      };

  return (
    <PreviewShell style={style}>
      <div style={bg} className="p-3 -m-3 rounded">
        <h2
          className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-3`}
          style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
        >
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-6 bg-white/70 rounded ${theme.muted}`}>
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className={`grid ${COL_CLS[columns]} gap-3`}>
            {products.slice(0, columns * 2).map((p, i) => {
              const rotate = i % 3 === 0 ? "-1deg" : i % 3 === 1 ? "1.2deg" : "-0.5deg";
              return (
                <div
                  key={p.id || i}
                  className="relative bg-white p-1.5 pt-3 shadow-md"
                  style={{ transform: `rotate(${rotate})` }}
                >
                  {/* 노랑 테이프 */}
                  <div
                    className="absolute -top-1 left-2 w-10 h-2 bg-yellow-200/75"
                    style={{ transform: "rotate(-6deg)" }}
                  />
                  <div
                    className="inline-block px-1 py-0.5 bg-[#3d2817] text-[#fdfaf2] text-[7px] font-bold tracking-widest mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    DAY {String(startDay + i).padStart(2, "0")}
                  </div>
                  <div className="aspect-[4/3] overflow-hidden bg-[#f5e6d3]">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        style={{ filter: "sepia(0.18)" }}
                      />
                    ) : null}
                  </div>
                  <p
                    className="text-[9px] italic text-[#8b5e3c] truncate mt-1"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    📍 {p.destination || "—"}
                  </p>
                  <p
                    className="text-[10px] font-semibold text-[#3d2817] truncate"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    {p.title}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
