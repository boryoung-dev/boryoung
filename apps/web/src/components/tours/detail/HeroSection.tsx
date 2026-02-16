"use client";

import { Star, Heart } from "lucide-react";

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
            <span className="bg-[#8B5CF6] text-white text-sm font-medium px-4 py-1.5 rounded-full">
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
        <h1 className="text-[36px] font-bold text-[#18181B] leading-[1.2] mb-2">
          {product.title}
        </h1>

        {/* 서브타이틀 */}
        {product.subtitle && (
          <p className="text-lg text-[#71717A] mb-4">
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
                      : "fill-[#E4E4E7] text-[#E4E4E7]"
                  }`}
                />
              ))}
            </div>
            <span className="text-base font-semibold text-[#18181B]">{avgRating}</span>
            <span className="text-sm text-[#71717A]">({product.reviews.length}개 리뷰)</span>
          </div>
        )}

        {/* 가격 섹션 */}
        <div className="bg-white rounded-[24px] p-6 border border-[#F4F4F5] mb-6">
          <div className="text-sm text-[#71717A] mb-2">1인 기준</div>
          <div className="flex items-end gap-2">
            {product.basePrice ? (
              <>
                <span className="text-[32px] font-bold text-[#18181B]">
                  {product.basePrice.toLocaleString()}원
                </span>
                {product.originalPrice && product.originalPrice > product.basePrice && (
                  <span className="text-lg text-[#71717A] line-through mb-1">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-[#18181B]">가격 문의</span>
            )}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onBooking}
            className="flex-1 h-14 bg-[#8B5CF6] text-white rounded-[28px] font-semibold text-base hover:opacity-90 transition"
          >
            예약하기
          </button>
          <button
            className="w-14 h-14 border border-[#E4E4E7] rounded-[28px] flex items-center justify-center hover:bg-[#F4F4F5] transition"
          >
            <Heart className="w-5 h-5 text-[#71717A]" />
          </button>
        </div>
      </div>
    </div>
  );
}
