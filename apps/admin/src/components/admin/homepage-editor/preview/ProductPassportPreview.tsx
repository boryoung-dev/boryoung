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

const COL_CLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** 여권 스탬프 미리보기 */
export function ProductPassportPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const sectionStyle = hasCustomBg ? undefined : { background: "#f5e6d3" };

  return (
    <PreviewShell style={style}>
      <div style={sectionStyle} className="p-3 -m-3">
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold font-serif ${theme.title} mb-3`}>
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#8b5e3c]/50 bg-[#fdf7ec] ${theme.muted}`}>
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className={`grid ${COL_CLS[columns]} gap-2`}>
            {products.slice(0, columns * 2).map((p, i) => (
              <div
                key={p.id || i}
                className="relative border-2 border-dashed border-[#8b5e3c] bg-[#fdf7ec] p-1.5 font-serif"
              >
                <div
                  className="absolute top-1 right-1 w-6 h-6 rounded-full border border-dashed border-[#8b0000]/70 flex items-center justify-center text-[5px] font-bold text-[#8b0000]/80 bg-[#fdf7ec]/60"
                  style={{ transform: "rotate(-15deg)" }}
                >
                  TOUR
                </div>
                <div className="aspect-[4/3] overflow-hidden border border-[#8b5e3c]/50">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      style={{ filter: "sepia(0.2) brightness(0.95)" }}
                    />
                  ) : null}
                </div>
                <p className="mt-1 text-[8px] tracking-widest uppercase text-[#8b5e3c] truncate">
                  {p.destination || "—"}
                </p>
                <p className="text-[10px] font-semibold text-[#3d2817] truncate">
                  {p.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
