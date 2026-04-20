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

/** 수채화 미리보기 */
export function ProductWatercolorPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const columns = (curation.displayConfig?.columns || 3) as 2 | 3 | 4;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg
    ? undefined
    : {
        background:
          "radial-gradient(circle at 15% 20%, rgba(186,230,253,0.6) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(167,243,208,0.5) 0%, transparent 45%), radial-gradient(circle at 50% 80%, rgba(253,224,71,0.35) 0%, transparent 40%), #fafbfc",
      };

  return (
    <PreviewShell style={style}>
      <div style={bg} className="p-3 -m-3 rounded">
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-light ${theme.title} mb-3`}>
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-6 bg-white/70 rounded-2xl ${theme.muted}`}>
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className={`grid ${COL_CLS[columns]} gap-2`}>
            {products.slice(0, columns * 2).map((p, i) => (
              <div
                key={p.id || i}
                className="bg-white/70 rounded-2xl overflow-hidden border border-white/50 shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      style={{ filter: "saturate(0.85)" }}
                    />
                  ) : null}
                </div>
                <div className="p-2">
                  {p.destination && (
                    <p className="text-[7px] font-light text-sky-600/80 truncate">
                      {p.destination}
                    </p>
                  )}
                  <p className="text-[10px] font-light text-slate-700 truncate">
                    {p.title}
                  </p>
                  {p.basePrice ? (
                    <p className="text-[10px] font-light text-slate-700">
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
