"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { renderLines, titleSizeClass } from "./_shared/styleHelpers";

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

/** 선셋 미리보기 */
export function ProductSunsetPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg
    ? undefined
    : {
        background: "linear-gradient(135deg, #fdba74, #f472b6 45%, #a855f7)",
      };

  return (
    <PreviewShell style={{ ...style, textTheme: "light" }}>
      <div style={bg} className="p-3 -m-3 rounded">
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold text-white mb-3`}>
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 bg-white/70 rounded-2xl text-slate-500">
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className={`grid ${COL_CLS[columns]} gap-2`}>
            {products.slice(0, columns * 2).map((p, i) => (
              <div
                key={p.id || i}
                className="bg-white/90 rounded-2xl overflow-hidden shadow-lg shadow-pink-500/20"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {p.destination && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[7px] font-semibold rounded-full">
                      {p.destination}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-slate-900 truncate">
                    {p.title}
                  </p>
                  {p.basePrice ? (
                    <p className="text-[10px] font-extrabold text-slate-900">
                      {p.basePrice.toLocaleString()}원~
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
