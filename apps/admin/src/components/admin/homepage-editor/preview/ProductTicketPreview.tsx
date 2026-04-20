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

/** 항공권 티켓 미리보기 */
export function ProductTicketPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const products = curation.products || [];

  return (
    <PreviewShell style={style}>
      <h2 className={`${titleSizeClass(style?.fontSize?.title)} font-semibold ${theme.title} mb-3`}>
        {renderLines(curation.title)}
      </h2>
      {products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-6 rounded bg-[var(--surface,#f5f5f7)] ${theme.muted}`}>
          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
          <p className="text-xs">연결된 상품이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2" style={{ fontFamily: "monospace" }}>
          {products.slice(0, 4).map((p, i) => (
            <div
              key={p.id || i}
              className="flex bg-[#fdfaf2] shadow-md overflow-hidden rounded-sm"
            >
              <div className="w-12 bg-[#1a3a5c] flex-shrink-0">
                <div className="aspect-square overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : null}
                </div>
                <p className="text-[6px] text-white tracking-widest uppercase text-center py-0.5">
                  ✈ AIR
                </p>
              </div>
              <div className="border-l border-dashed border-[#1a3a5c]/30" />
              <div className="flex-1 p-1.5">
                <div className="flex items-center justify-between text-[7px] uppercase text-[#1a3a5c]/70">
                  <span>BP</span>
                  <span>{String(i + 1).padStart(3, "0")}</span>
                </div>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-xs font-bold text-[#1a3a5c]">ICN</p>
                  <span className="text-[#1a3a5c] text-xs">→</span>
                  <p className="text-xs font-bold text-[#1a3a5c]">
                    {(p.destination || "???").slice(0, 3).toUpperCase()}
                  </p>
                </div>
                <p className="text-[9px] font-bold text-[#c9302c] text-right mt-1">
                  {p.basePrice ? `₩${p.basePrice.toLocaleString()}` : "문의"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PreviewShell>
  );
}
