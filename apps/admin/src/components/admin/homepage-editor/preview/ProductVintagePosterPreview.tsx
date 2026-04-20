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

/** 빈티지 포스터 미리보기 */
export function ProductVintagePosterPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3;
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold font-serif ${theme.title} mb-3`}>
        {renderLines(curation.title)}
      </h2>
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-6 rounded bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className={`grid ${COL_CLS[columns]} gap-2`}>
          {products.slice(0, columns * 2).map((p, i) => (
            <div
              key={p.id || i}
              className="bg-[#f4ecd8] border-4 border-double border-[#8b4513] p-1.5 text-center font-serif"
            >
              <p className="text-[6px] tracking-widest uppercase text-[#8b4513] mb-1">
                ★ Travel ★
              </p>
              <div className="aspect-[3/4] overflow-hidden border border-[#8b4513]">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{ filter: "sepia(0.45) contrast(1.1) saturate(0.85)" }}
                  />
                ) : null}
              </div>
              <p
                className="text-[11px] font-black text-[#8b4513] uppercase mt-1 truncate"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {p.destination || p.title}
              </p>
              {p.basePrice ? (
                <p className="text-[8px] font-black text-[#5c2e0a]">
                  ₩{p.basePrice.toLocaleString()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PreviewShell>
  );
}
