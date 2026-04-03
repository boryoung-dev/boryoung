"use client";

import { ImageIcon, Star } from "lucide-react";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  slug?: string;
  destination?: string;
  duration?: string;
  basePrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  displayConfig?: any;
  products?: Product[];
}

/** 상품 쇼케이스 (탭 필터 + 캐러셀) 미리보기 */
export function ProductShowcasePreview({ curation }: { curation: Curation }) {
  const products = curation.products || [];
  const tabs = (curation.displayConfig?.tabs as string[]) || [];

  return (
    <section className="py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            style={{ color: "var(--fg, #1d1d1f)" }}
            className="text-lg font-bold tracking-tight"
          >
            {curation.title}
          </h2>
          <span
            style={{ color: "var(--brand, #0071e3)" }}
            className="text-[11px] font-medium"
          >
            더보기
          </span>
        </div>

        {/* 탭 */}
        {tabs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tabs.map((tab, i) => (
              <span
                key={tab}
                className="px-3 py-1 rounded-full text-[11px] font-medium border"
                style={
                  i === 0
                    ? {
                        background: "var(--fg, #1d1d1f)",
                        color: "#fff",
                        borderColor: "var(--fg, #1d1d1f)",
                      }
                    : {
                        background: "#fff",
                        color: "var(--fg, #1d1d1f)",
                        borderColor: "var(--border, #d2d2d7)",
                      }
                }
              >
                {tab}
              </span>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div
            style={{
              background: "var(--surface, #f5f5f7)",
              color: "var(--muted, #86868b)",
            }}
            className="flex flex-col items-center justify-center py-16 rounded-xl"
          >
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">연결된 상품이 없습니다</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-hidden">
            {products.slice(0, 4).map((product, i) => (
              <div
                key={product.id || i}
                className="flex-shrink-0"
                style={{ width: "calc(25% - 9px)" }}
              >
                <div
                  className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2"
                  style={{ background: "var(--surface, #f5f5f7)" }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon
                        className="w-8 h-8"
                        style={{ color: "var(--muted, #86868b)" }}
                      />
                    </div>
                  )}
                  {product.badge && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    style={{ color: "var(--muted, #86868b)" }}
                    className="text-[10px]"
                  >
                    {product.destination}
                  </span>
                  {product.duration && (
                    <>
                      <span style={{ color: "var(--border, #d2d2d7)" }}>
                        ·
                      </span>
                      <span
                        style={{ color: "var(--muted, #86868b)" }}
                        className="text-[10px]"
                      >
                        {product.duration}
                      </span>
                    </>
                  )}
                </div>
                <h3
                  style={{ color: "var(--fg, #1d1d1f)" }}
                  className="text-[12px] font-semibold line-clamp-1 mb-1"
                >
                  {product.title}
                </h3>
                {(product.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-0.5 mb-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span
                      style={{ color: "var(--fg, #1d1d1f)" }}
                      className="text-[10px] font-semibold"
                    >
                      {product.rating?.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  {product.originalPrice &&
                    product.basePrice &&
                    product.originalPrice > product.basePrice && (
                      <span className="text-[10px] font-bold text-red-500">
                        {Math.round(
                          (1 - product.basePrice / product.originalPrice) * 100
                        )}
                        %
                      </span>
                    )}
                  {product.basePrice ? (
                    <span
                      style={{ color: "var(--fg, #1d1d1f)" }}
                      className="text-[13px] font-bold"
                    >
                      {product.basePrice.toLocaleString()}원
                    </span>
                  ) : (
                    <span
                      style={{ color: "var(--muted, #86868b)" }}
                      className="text-[11px]"
                    >
                      가격 문의
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
