"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { renderLines, themeColors, titleSizeClass } from "./_shared/styleHelpers";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  destination?: string;
  duration?: string;
  basePrice?: number;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  displayConfig?: any;
  products?: Product[];
}

/** 상품 컴팩트 리스트 미리보기 */
export function ProductCompactListPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 1) as 1 | 2;
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      {curation.title && (
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-3`}>
          {renderLines(curation.title)}
        </h2>
      )}
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-8 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <ul className={`grid ${columns === 2 ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
          {products.slice(0, 4).map((p, i) => (
            <li
              key={p.id || i}
              className="flex gap-2 p-2 rounded-lg border border-[var(--border,#d2d2d7)]"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] ${theme.muted}`}>{p.destination}</p>
                <h3 className={`text-xs font-semibold ${theme.title} truncate`}>{p.title}</h3>
                <p className={`text-[11px] font-bold ${theme.title}`}>
                  {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PreviewShell>
  );
}
