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

/** 상품 국가 탭 미리보기 */
export function ProductTabsCountryPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const tabs: string[] = curation.displayConfig?.tabs?.length ? curation.displayConfig.tabs : ["전체"];
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      {curation.title && (
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-2`}>
          {renderLines(curation.title)}
        </h2>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {tabs.map((tab, i) => (
          <span
            key={`${tab}-${i}`}
            className={`px-2 py-1 rounded-full text-[10px] font-medium border ${
              i === 0
                ? "bg-[var(--fg,#1d1d1f)] text-white border-[var(--fg,#1d1d1f)]"
                : `bg-white ${theme.title} border-[var(--border,#d2d2d7)]`
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-8 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className={`grid ${COL_CLS[columns]} gap-2`}>
          {products.slice(0, columns).map((p, i) => (
            <div key={p.id || i}>
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <p className={`text-[10px] ${theme.title} font-semibold truncate mt-1`}>{p.title}</p>
            </div>
          ))}
        </div>
      )}
    </PreviewShell>
  );
}
