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

/** 그린 럭셔리 미리보기 */
export function ProductGreenLuxuryPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg
    ? undefined
    : { background: "linear-gradient(135deg, #0a3d2a, #052218)" };

  return (
    <PreviewShell style={{ ...style, textTheme: "light" }}>
      <div style={bg} className="p-3 -m-3 rounded">
        <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-light text-white mb-3 font-serif`}>
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 border border-[#c9a961] bg-black/40 text-[#c9a961]">
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {products.slice(0, 6).map((p, i) => (
              <div
                key={p.id || i}
                className="bg-black/40 border border-[#c9a961]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-1.5 border-t border-[#c9a961]/40">
                  <p className="text-[7px] tracking-widest uppercase text-[#c9a961]/80">
                    Premium Golf
                  </p>
                  <p
                    className="text-[10px] font-light text-white truncate"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {p.title}
                  </p>
                  {p.basePrice ? (
                    <p className="text-[10px] font-light text-[#c9a961]">
                      ₩{p.basePrice.toLocaleString()}
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
