"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail?: string | null;
  durationText?: string | null;
  basePrice?: number | null;
  originalPrice?: number | null;
  isFeatured?: boolean;
  category?: {
    name: string;
  } | null;
  tagList?: Array<{ name: string; slug: string }>;
};

export function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  // 할인율 계산
  const discountPercent = product.originalPrice && product.basePrice
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0;

  // 랜덤 평점 생성 (실제 데이터 없으므로)
  const rating = 4.5;
  const reviewCount = 89;

  return (
    <Link href={`/tours/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden group-hover:shadow-md transition-shadow duration-500 h-full flex flex-col">
        {/* 썸네일 */}
        <div className="relative h-[240px] overflow-hidden bg-[color:var(--surface)]">
          {product.thumbnail && !imgError ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-blue-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="text-sm text-blue-400">{product.category?.name || '골프투어'}</span>
              </div>
            </div>
          )}

          {/* 배지 (좌상단) */}
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isFeatured && (
              <span className="bg-[color:var(--fg)] text-white text-[10px] font-medium px-3 py-1 rounded-full">
                베스트
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-[color:var(--fg)] text-white text-[10px] font-medium px-3 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* 카드 콘텐츠 */}
        <div className="p-6 flex-1 flex flex-col gap-3">
          {/* 타이틀 */}
          <h3 className="text-[18px] font-semibold text-[color:var(--fg)] line-clamp-2 group-hover:text-[color:var(--brand)] transition-colors">
            {product.title}
          </h3>

          {/* 설명 */}
          <p className="text-[14px] text-[color:var(--muted)] line-clamp-1">
            {product.durationText ? `${product.durationText} • ` : ""}
            {product.subtitle || "프리미엄 여행 패키지"}
          </p>

          {/* 별점 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-[color:var(--border)] text-[color:var(--border)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[14px] text-[color:var(--muted)]">
              {rating} ({reviewCount})
            </span>
          </div>

          {/* 가격 */}
          <div className="mt-auto pt-3">
            {product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-[20px] font-semibold text-[color:var(--fg)]">
                  ₩{product.basePrice.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.basePrice && (
                  <span className="text-[14px] text-[color:var(--muted)] line-through">
                    ₩{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[18px] font-semibold text-[color:var(--muted)]">
                가격 문의
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
