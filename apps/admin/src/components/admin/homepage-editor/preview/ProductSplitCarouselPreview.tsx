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

/** 상품 좌우 + 캐러셀 미리보기 */
export function ProductSplitCarouselPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const ctaLabel = curation.displayConfig?.ctaLabel || "전체 보기";
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      <div className="grid grid-cols-3 gap-3 items-start">
        <div className="col-span-1">
          {curation.subtitle && (
            <p className={`text-[10px] uppercase ${theme.muted} mb-1`}>{curation.subtitle}</p>
          )}
          <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} leading-tight`}>
            {renderLines(curation.title)}
          </h2>
          <p className={`text-[10px] mt-2 ${theme.title} font-medium`}>{ctaLabel} →</p>
        </div>
        <div className="col-span-2 flex gap-2 overflow-hidden">
          {products.length === 0 ? (
            <div className={`w-full flex items-center justify-center py-8 rounded-lg bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
              <ImageIcon className="w-6 h-6 opacity-40" />
            </div>
          ) : (
            products.slice(0, 3).map((p, i) => (
              <div key={p.id || i} className="flex-shrink-0 w-1/3">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <p className={`text-[10px] ${theme.title} font-semibold truncate mt-1`}>{p.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </PreviewShell>
  );
}
