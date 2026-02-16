"use client";

import { MapPin, Calendar, Plane, Star } from "lucide-react";

interface HeroSectionProps {
  product: any;
  onBooking: () => void;
}

export function HeroSection({ product, onBooking }: HeroSectionProps) {
  const heroImage =
    product.images?.find((img: any) => img.isThumbnail)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  const avgRating =
    product.reviews && product.reviews.length > 0
      ? (
          product.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {/* 배경 이미지 */}
      <img
        src={heroImage}
        alt={product.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* 콘텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-[1200px]">
          {/* 카테고리 뱃지 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
              {product.category?.name}
            </span>
            {product.isFeatured && (
              <span className="inline-block bg-yellow-400/90 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                추천
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
            {product.title}
          </h1>
          {product.subtitle && (
            <p className="text-lg sm:text-xl text-white/80 mb-4">
              {product.subtitle}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6">
            {product.destination && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.destination}</span>
              </div>
            )}
            {product.durationText && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{product.durationText}</span>
              </div>
            )}
            {product.airline && (
              <div className="flex items-center gap-1.5">
                <Plane className="w-4 h-4" />
                <span className="text-sm">{product.airline}</span>
              </div>
            )}
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {avgRating} ({product.reviews.length}개 리뷰)
                </span>
              </div>
            )}
          </div>

          {/* 가격 + CTA (모바일에서는 하단바로 대체되므로 데스크톱에서만) */}
          <div className="hidden lg:flex items-end gap-6">
            <div>
              {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
                <div className="text-white/60 line-through text-lg">
                  {product.originalPrice.toLocaleString()}원
                </div>
              )}
              {product.basePrice ? (
                <div className="text-3xl font-bold text-white">
                  {product.basePrice.toLocaleString()}원
                  <span className="text-lg text-white/60 ml-1">~</span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-white">가격 문의</div>
              )}
            </div>
            <button
              onClick={onBooking}
              className="px-8 py-3 bg-[color:var(--brand)] text-white rounded-full font-semibold text-lg hover:opacity-90 transition shadow-lg"
            >
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
