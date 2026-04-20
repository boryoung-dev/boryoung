"use client";

import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface ShowcaseProduct {
  slug: string;
  title: string;
  imageUrl: string;
  destination: string;
  duration: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

interface ProductShowcaseProps {
  title: string;
  products: ShowcaseProduct[];
  tabs?: string[];
  showMoreHref?: string;
  /**
   * true일 경우 자체 `<section>`/max-width 래퍼 없이 콘텐츠만 렌더.
   * 외부(예: SectionContainer)에서 감쌀 때 사용.
   */
  bare?: boolean;
  /** bare=true일 때 헤딩 슬롯 대체 (없으면 기본 제목/더보기 렌더) */
  headingSlot?: React.ReactNode;
}

/** 상품 카드 캐러셀 섹션 (4카드 + 좌우 화살표) */
export function ProductShowcase({ title, products, tabs, showMoreHref, bare = false, headingSlot }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState("전체");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // 탭 필터링
  const filtered = activeTab === "전체"
    ? products
    : products.filter((p) => p.destination.includes(activeTab));

  const defaultHeading = (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className="text-[13px] text-[color:var(--brand)] hover:underline font-medium"
        >
          더보기
        </Link>
      )}
    </div>
  );

  const content = (
    <>
      {/* 헤더 */}
      {headingSlot ?? defaultHeading}

      {/* 탭 */}
      {tabs && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === tab
                  ? "bg-[color:var(--fg)] text-white border-[color:var(--fg)]"
                  : "bg-white text-[color:var(--fg)] border-[color:var(--border)] hover:border-[color:var(--fg)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* 캐러셀 */}
      <div className="relative group/carousel">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {filtered.map((product) => {
                const discount = product.originalPrice
                  ? Math.round((1 - product.basePrice / product.originalPrice) * 100)
                  : 0;

                return (
                  <Link
                    key={product.slug}
                    href={`/tours/${product.slug}`}
                    className="flex-shrink-0 w-[260px] sm:w-[280px] group/card"
                  >
                    {/* 이미지 */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
                        />
                      )}
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* 정보 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[12px] text-[color:var(--muted)]">
                          {product.destination}
                        </span>
                        <span className="text-[color:var(--border)]">·</span>
                        <span className="text-[12px] text-[color:var(--muted)]">
                          {product.duration}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-[color:var(--fg)] line-clamp-1 mb-1.5 group-hover/card:text-[color:var(--brand)] transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[13px] font-semibold text-[color:var(--fg)]">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-[12px] text-[color:var(--muted)]">
                          {product.reviewCount.toLocaleString()}명 평가
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        {discount > 0 && (
                          <span className="text-[13px] font-bold text-red-500">{discount}%</span>
                        )}
                        <span className="text-[17px] font-bold text-[color:var(--fg)]">
                          {product.basePrice.toLocaleString()}원
                        </span>
                        {product.originalPrice && (
                          <span className="text-[13px] text-[color:var(--muted)] line-through">
                            {product.originalPrice.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 좌우 화살표 */}
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-[120px] -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-[color:var(--border)] flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--fg)] transition opacity-0 group-hover/carousel:opacity-100"
            aria-label="이전"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-[120px] translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-[color:var(--border)] flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--fg)] transition opacity-0 group-hover/carousel:opacity-100"
            aria-label="다음"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </>
  );

  if (bare) return <>{content}</>;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">{content}</div>
    </section>
  );
}
