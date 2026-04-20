"use client";

import { ImageIcon } from "lucide-react";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  destination?: string;
  basePrice?: number;
  originalPrice?: number;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  displayConfig?: any;
  products?: Product[];
}

/** 상품 스포트라이트 (풀스크린 단일) 미리보기 */
export function ProductSpotlightPreview({ curation }: { curation: Curation }) {
  const overlay = curation.displayConfig?.overlay ?? 0.4;
  const ctaLabel = curation.displayConfig?.ctaLabel || "자세히 보기";
  const product = (curation.products || [])[0];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: 220,
        backgroundImage: product?.imageUrl ? `url(${product.imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        background: !product?.imageUrl ? "var(--surface, #f5f5f7)" : undefined,
      }}
    >
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
      <div className="relative px-4 py-8 flex flex-col justify-center text-white" style={{ minHeight: 220 }}>
        {!product ? (
          <div className="flex flex-col items-center justify-center text-white/80">
            <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
            <p className="text-xs">상품을 선택하세요</p>
          </div>
        ) : (
          <>
            {curation.subtitle && (
              <p className="text-[10px] tracking-widest uppercase mb-1.5 text-white/80">
                {curation.subtitle}
              </p>
            )}
            <h2 className="text-xl font-semibold leading-tight mb-2 line-clamp-2">
              {curation.title || product.title}
            </h2>
            {product.basePrice ? (
              <p className="text-base font-bold mb-3">
                {product.basePrice.toLocaleString()}원~
              </p>
            ) : null}
            <span className="inline-block self-start text-[10px] font-medium px-3 py-1.5 bg-white text-black rounded-full">
              {ctaLabel} →
            </span>
          </>
        )}
      </div>
    </section>
  );
}
