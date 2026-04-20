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

/** 시네마 파노라마 미리보기 */
export function ProductCinematicPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const aspectRatio = (curation.displayConfig?.aspectRatio || "21:9") as "16:9" | "21:9";
  const aspectCls = aspectRatio === "16:9" ? "aspect-[16/9]" : "aspect-[21/9]";
  const products = curation.products || [];

  const hasCustomBg = style?.background && style.background.type !== "transparent";
  const bg = hasCustomBg ? undefined : { background: "#000" };

  return (
    <PreviewShell style={{ ...style, textTheme: "light" }}>
      <div style={bg} className="p-3 -m-3 rounded">
        <h2
          className={`${titleSizeClass(style?.fontSize?.title)} font-light text-white mb-3 tracking-wide`}
          style={{ fontFamily: "Helvetica, sans-serif" }}
        >
          {renderLines(curation.title)}
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 bg-black/50 text-white/50">
            <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
            <p className="text-xs">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className="flex gap-1 overflow-hidden">
            {products.slice(0, 3).map((p, i) => (
              <div
                key={p.id || i}
                className={`relative ${aspectCls} bg-black flex-shrink-0`}
                style={{ width: "85%" }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-black z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black z-20" />
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-10" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-3">
                  {p.destination && (
                    <p
                      className="text-[6px] tracking-widest uppercase text-white/80 mb-1"
                      style={{ fontFamily: "Helvetica, sans-serif" }}
                    >
                      — {p.destination} —
                    </p>
                  )}
                  <p
                    className="text-[11px] font-light text-white tracking-widest uppercase line-clamp-2"
                    style={{ fontFamily: "Helvetica, sans-serif" }}
                  >
                    {p.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PreviewShell>
  );
}
