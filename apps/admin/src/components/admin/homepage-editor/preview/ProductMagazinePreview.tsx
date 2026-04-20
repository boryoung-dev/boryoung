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

/** 상품 매거진 (큰 1개 + 4개 서브) 미리보기 */
export function ProductMagazinePreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const products = curation.products || [];
  const main = products[0];
  const subs = products.slice(1, 5);

  return (
    <PreviewShell style={style}>
      {curation.title && (
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-4`}>
          {renderLines(curation.title)}
        </h2>
      )}
      {!main ? (
        <div className={`flex flex-col items-center justify-center py-10 rounded-xl bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
            {main.imageUrl ? (
              <img src={main.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-1.5 left-1.5 right-1.5">
              <h3 className="text-xs font-semibold text-white line-clamp-2">{main.title}</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => {
              const p = subs[i];
              return (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
                  {p?.imageUrl ? (
                    <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PreviewShell>
  );
}
