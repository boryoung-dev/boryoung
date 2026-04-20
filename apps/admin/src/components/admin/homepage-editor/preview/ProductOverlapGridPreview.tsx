"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { renderLines, themeColors, titleSizeClass } from "./_shared/styleHelpers";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  basePrice?: number;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  displayConfig?: any;
  products?: Product[];
}

const COL_CLS: Record<3 | 4, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** 카드 오버랩 그리드 미리보기 */
export function ProductOverlapGridPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 4) as 3 | 4;
  const products = (curation.products || []).slice(0, columns);

  return (
    <PreviewShell style={style}>
      {curation.title && (
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-4`}>
          {renderLines(curation.title)}
        </h2>
      )}
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-8 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className={`grid ${COL_CLS[columns]} gap-0`}>
          {products.map((p, i) => {
            const offsetY = i % 2 === 0 ? "translate-y-0" : "translate-y-2";
            const offsetX = i === 0 || i === products.length - 1 ? "" : "-translate-x-1";
            return (
              <div
                key={p.id || i}
                className={`relative ${offsetY} ${offsetX}`}
                style={{ zIndex: products.length - i }}
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)] shadow-md ring-2 ring-white">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-[9px] font-semibold text-white truncate">{p.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PreviewShell>
  );
}
