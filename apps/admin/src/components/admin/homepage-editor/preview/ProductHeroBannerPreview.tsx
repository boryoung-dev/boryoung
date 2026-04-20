"use client";

import { ImageIcon } from "lucide-react";
import { PreviewShell } from "./_shared/PreviewShell";
import { themeColors } from "./_shared/styleHelpers";

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

/** 상품 히어로 배너 (좌/우 50:50) 미리보기 */
export function ProductHeroBannerPreview({ curation }: { curation: Curation }) {
  const style = curation.displayConfig?.style;
  const theme = themeColors(style?.textTheme);
  const imagePosition = curation.displayConfig?.imagePosition || "left";
  const ctaLabel = curation.displayConfig?.ctaLabel || "자세히 보기";
  const product = (curation.products || [])[0];

  const imageBlock = (
    <div className="relative aspect-[5/4] rounded-lg overflow-hidden bg-[var(--surface,#f5f5f7)]">
      {product?.imageUrl ? (
        <img src={product.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-[var(--muted,#86868b)] opacity-40" />
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center">
      {curation.subtitle && (
        <p className={`text-[10px] uppercase ${theme.muted} mb-1`}>{curation.subtitle}</p>
      )}
      <h2 className={`text-base font-semibold leading-tight ${theme.title} line-clamp-2`}>
        {curation.title || product?.title}
      </h2>
      {product?.basePrice ? (
        <p className={`text-sm font-bold mt-1.5 ${theme.title}`}>
          {product.basePrice.toLocaleString()}원~
        </p>
      ) : null}
      <span className={`inline-block self-start text-[10px] font-medium px-2 py-1 rounded-full mt-2 ${
        style?.textTheme === "light" ? "bg-white text-black" : "bg-[var(--fg,#1d1d1f)] text-white"
      }`}>
        {ctaLabel} →
      </span>
    </div>
  );

  return (
    <PreviewShell style={style}>
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {imagePosition === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </PreviewShell>
  );
}
