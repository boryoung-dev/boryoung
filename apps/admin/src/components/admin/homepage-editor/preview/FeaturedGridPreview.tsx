"use client";

import { ImageIcon } from "lucide-react";

interface Product {
  id?: string;
  title: string;
  imageUrl?: string;
  slug?: string;
  destination?: string;
  duration?: string;
  basePrice?: number;
}

interface Curation {
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  products?: Product[];
}

/** 추천 그리드 (2x3 카드 그리드) 미리보기 */
export function FeaturedGridPreview({ curation }: { curation: Curation }) {
  const products = curation.products || [];

  return (
    <section className="py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2
              style={{ color: "var(--fg, #1d1d1f)" }}
              className="text-xl font-semibold tracking-tight"
            >
              {curation.title}
            </h2>
            {curation.subtitle && (
              <p
                style={{ color: "var(--muted, #86868b)" }}
                className="text-xs mt-1"
              >
                {curation.subtitle}
              </p>
            )}
          </div>
          <span
            style={{ color: "var(--muted, #86868b)" }}
            className="text-[11px]"
          >
            전체 보기 →
          </span>
        </div>

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
          <div className="grid grid-cols-3 gap-3">
            {products.slice(0, 6).map((item, i) => (
              <div
                key={item.id || i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden"
                style={{ background: "var(--surface, #f5f5f7)" }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {(item.destination || item.duration) && (
                    <div className="flex gap-1.5 mb-1">
                      {[item.destination, item.duration]
                        .filter(Boolean)
                        .map((b) => (
                          <span
                            key={b}
                            className="text-[9px] font-medium px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-white"
                          >
                            {b}
                          </span>
                        ))}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-white line-clamp-1">
                    {item.title}
                  </h3>
                  {item.basePrice && (
                    <p className="text-white/60 text-xs">
                      {item.basePrice.toLocaleString()}원~
                    </p>
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
