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
  originalPrice?: number;
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

/** 특가 그리드 미리보기 */
export function ProductDealGridPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const deals = (curation.products || [])
    .filter((p) => p.originalPrice && p.basePrice && p.originalPrice > p.basePrice)
    .map((p) => ({
      ...p,
      _pct: Math.round((1 - (p.basePrice ?? 0) / (p.originalPrice ?? 1)) * 100),
    }))
    .sort((a, b) => b._pct - a._pct);

  return (
    <PreviewShell style={style}>
      {curation.title && (
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-3`}>
          {renderLines(curation.title)}
        </h2>
      )}
      {deals.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-8 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">원가가 설정된 상품이 없습니다</p>
        </div>
      ) : (
        <div className={`grid ${COL_CLS[columns]} gap-2`}>
          {deals.slice(0, columns).map((p, i) => (
            <div key={p.id || i}>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute top-1.5 left-1.5 bg-red-500 text-white px-2 py-1 rounded-md">
                  <span className="text-sm font-bold leading-none">{p._pct}%</span>
                </div>
              </div>
              <p className={`text-[10px] ${theme.title} font-semibold truncate mt-1`}>{p.title}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-[9px] line-through ${theme.muted}`}>
                  {p.originalPrice?.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-red-500">
                  {p.basePrice?.toLocaleString()}원
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PreviewShell>
  );
}
