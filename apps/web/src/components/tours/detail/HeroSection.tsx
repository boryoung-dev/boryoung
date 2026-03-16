"use client";

import { Star, Phone } from "lucide-react";

interface HeroSectionProps {
  product: any;
  onBooking: () => void;
  onImageClick: (index: number) => void;
}

export function HeroSection({ product, onBooking, onImageClick }: HeroSectionProps) {
  const mainImage =
    product.images?.find((img: any) => img.isThumbnail)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  const thumbnails = product.images?.slice(0, 4) || [];

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="flex flex-col lg:flex-row gap-15">
      {/* 왼쪽: 이미지 섹션 */}
      <div className="w-full lg:w-[600px] flex-shrink-0">
        {/* 메인 이미지 */}
        <button
          onClick={() => onImageClick(0)}
          className="w-full h-[400px] rounded-[32px] overflow-hidden mb-4"
        >
          <img
            src={mainImage}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* 썸네일 4개 */}
        {thumbnails.length > 0 && (
          <div className="flex gap-4">
            {thumbnails.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => onImageClick(idx)}
                className="flex-1 h-[100px] rounded-[20px] overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 정보 섹션 */}
      <div className="flex-1">
        {/* 배지 컨테이너 */}
        <div className="flex items-center gap-3 mb-4">
          {product.isFeatured && (
            <span className="bg-[color:var(--brand)] text-white text-sm font-medium px-4 py-1.5 rounded-full">
              베스트셀러
            </span>
          )}
          {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
            <span className="bg-[#F472B6] text-white text-sm font-medium px-4 py-1.5 rounded-full">
              얼리버드 -{Math.round((1 - product.basePrice / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* 타이틀 */}
        <h1 className="text-[36px] font-bold text-[color:var(--fg)] leading-[1.2] mb-2">
          {product.title}
        </h1>

        {/* 서브타이틀 */}
        {product.subtitle && (
          <p className="text-lg text-[color:var(--muted)] mb-4">
            {product.subtitle}
          </p>
        )}

        {/* 리뷰 */}
        {avgRating && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(avgRating))
                      ? "fill-[#FACC15] text-[#FACC15]"
                      : "fill-[color:var(--border)] text-[color:var(--border)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-base font-semibold text-[color:var(--fg)]">{avgRating}</span>
            <span className="text-sm text-[color:var(--muted)]">({product.reviews.length}개 리뷰)</span>
          </div>
        )}

        {/* 가격 섹션 */}
        <div className="bg-white rounded-[24px] p-6 border border-[color:var(--surface)] mb-6">
          <div className="text-sm text-[color:var(--muted)] mb-2">1인 기준</div>
          <div className="flex items-end gap-2">
            {product.basePrice ? (
              <>
                <span className="text-[32px] font-bold text-[color:var(--fg)]">
                  {product.basePrice.toLocaleString()}원
                </span>
                {product.originalPrice && product.originalPrice > product.basePrice && (
                  <span className="text-lg text-[color:var(--muted)] line-through mb-1">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-[color:var(--fg)]">가격 문의</span>
            )}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="flex gap-3">
          <a
            href="tel:1588-0320"
            className="flex-1 h-14 bg-[color:var(--brand)] text-white rounded-[28px] font-semibold text-base hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            전화 상담하기
          </a>
          <a
            href="https://pf.kakao.com/_xgxoBxj"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-[#FAE100] rounded-[28px] flex items-center justify-center hover:opacity-90 transition"
            title="카카오톡 상담"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
