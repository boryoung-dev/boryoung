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

/** 럭셔리 블랙 미리보기 */
export function ProductLuxuryBlackPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg ? undefined : { background: "#000000" };

  return (
    <PreviewShell style={{ ...style, textTheme: "light" }}>
      <div style={bg} className="p-3 -m-3 rounded">
        <div className="text-center mb-3">
          <h2
            className={`${titleSizeClass(style?.fontSize?.title)} font-light text-white tracking-[0.15em] uppercase`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {renderLines(curation.title)}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <div className="h-px w-6 bg-[#d4af37]/60" />
            <div className="text-[#d4af37] text-[8px]">◆</div>
            <div className="h-px w-6 bg-[#d4af37]/60" />
          </div>
        </div>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 border border-[#d4af37]/30 text-[#d4af37]">
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {products.slice(0, 6).map((p, i) => (
              <div
                key={p.id || i}
                className="bg-black border border-[#d4af37]/30"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : null}
                </div>
                <div className="p-1.5 text-center">
                  {p.destination && (
                    <p className="text-[6px] tracking-widest uppercase text-[#d4af37] truncate">
                      {p.destination}
                    </p>
                  )}
                  <p
                    className="text-[10px] font-light text-white tracking-wider uppercase truncate"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {p.title}
                  </p>
                  <div className="mx-auto my-1 h-px w-6 bg-[#d4af37]" />
                  {p.basePrice ? (
                    <p
                      className="text-[10px] font-light text-[#d4af37]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
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
