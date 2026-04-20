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

/** 엽서 미리보기 */
export function ProductPostcardPreview({ curation }: { curation: Curation }) {
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
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((p, i) => {
            const rotate = i % 2 === 0 ? "rotate-1" : "-rotate-1";
            return (
              <div
                key={p.id || i}
                className={`bg-[#fefcf6] shadow-md p-2 transform ${rotate}`}
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(120,100,70,0.05) 0px, transparent 1px, transparent 15px, rgba(120,100,70,0.05) 16px)",
                }}
              >
                <div className="flex gap-1.5">
                  <div className="flex-1 pr-1.5 border-r border-dashed border-[#a88762]/50">
                    {p.destination && (
                      <p
                        className="text-[9px] italic text-[#7a5a3a] truncate"
                        style={{
                          fontFamily: "'Brush Script MT', cursive, serif",
                        }}
                      >
                        Hi from {p.destination}!
                      </p>
                    )}
                    <p
                      className="text-[10px] italic font-semibold text-[#3d2817] line-clamp-2"
                      style={{
                        fontFamily: "'Brush Script MT', cursive, serif",
                      }}
                    >
                      {p.title}
                    </p>
                  </div>
                  <div className="w-10 h-12 border-2 border-dashed border-[#a88762] bg-[#f5e6d3] overflow-hidden flex-shrink-0">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        style={{ filter: "sepia(0.15)" }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PreviewShell>
  );
}
