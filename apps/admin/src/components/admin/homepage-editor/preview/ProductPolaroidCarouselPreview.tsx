"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { renderLines, themeColors, titleSizeClass } from "./_shared/styleHelpers";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  destination?: string;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  displayConfig?: any;
  products?: Product[];
}

/** 폴라로이드 캐러셀 미리보기 */
export function ProductPolaroidCarouselPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const products = curation.products || [];

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
        <div className="flex gap-3 overflow-hidden py-2">
          {products.slice(0, 4).map((p, i) => {
            const rotate = i % 2 === 0 ? "-2deg" : "2deg";
            return (
              <div
                key={p.id || i}
                className="flex-shrink-0 bg-white p-2 pb-3 shadow-md"
                style={{ transform: `rotate(${rotate})` }}
              >
                <div className="w-20 h-20 overflow-hidden bg-[var(--surface,#f5f5f7)]">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <p
                  className="text-[10px] italic text-gray-700 text-center mt-1.5 font-serif truncate w-20"
                  style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                >
                  {p.title}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </PreviewShell>
  );
}
