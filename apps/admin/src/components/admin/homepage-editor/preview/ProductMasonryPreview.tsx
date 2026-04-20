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
  2: "columns-2",
  3: "columns-3",
  4: "columns-4",
};

const ASPECTS = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[5/4]"];

/** 상품 메이슨리 미리보기 */
export function ProductMasonryPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-4`}>
        {renderLines(curation.title)}
      </h2>
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-10 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className={`${COL_CLS[columns]} gap-2`}>
          {products.slice(0, 6).map((p, i) => (
            <div key={p.id || i} className="break-inside-avoid mb-2">
              <div className={`relative ${ASPECTS[i % ASPECTS.length]} rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]`}>
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
