"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { TabNavigation } from "./TabNavigation";
import { OverviewSection } from "./OverviewSection";
import { HighlightCards } from "./HighlightCards";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { InclusionsSection } from "./InclusionsSection";
import { ImageGallery } from "./ImageGallery";
import { ImageLightbox } from "./ImageLightbox";
import { ReviewSection } from "./ReviewSection";
import { ScheduleDates } from "./ScheduleDates";
import { StickyBookingBar } from "./StickyBookingBar";
import { BookingModal } from "@/components/booking/BookingModal";

interface ProductDetailPageProps {
  product: any;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* 풀스크린 히어로 */}
      <HeroSection product={product} onBooking={() => setBookingOpen(true)} />

      {/* 스티키 탭 네비게이션 */}
      <TabNavigation />

      {/* 본문 영역 */}
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-16">
            {/* 개요 */}
            <section id="overview">
              <HighlightCards product={product} />
              <OverviewSection product={product} />
            </section>

            {/* 이미지 갤러리 */}
            {product.images && product.images.length > 0 && (
              <ImageGallery
                images={product.images}
                onImageClick={openLightbox}
              />
            )}

            {/* 일정 */}
            {product.itineraries && product.itineraries.length > 0 && (
              <section id="itinerary">
                <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">
                  여행 일정
                </h2>
                <ItineraryTimeline itineraries={product.itineraries} />
              </section>
            )}

            {/* 출발 일정 */}
            {product.scheduleDates && (
              <ScheduleDates dates={product.scheduleDates} />
            )}

            {/* 포함/불포함 */}
            <section id="inclusions">
              <InclusionsSection
                inclusions={product.inclusions}
                exclusions={product.exclusions}
              />
            </section>

            {/* 리뷰 */}
            {product.reviews && product.reviews.length > 0 && (
              <section id="reviews">
                <ReviewSection reviews={product.reviews} />
              </section>
            )}
          </div>

          {/* 우측 스티키 예약바 (데스크톱) */}
          <div className="hidden lg:block">
            <StickyBookingBar
              product={product}
              onBooking={() => setBookingOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* 모바일 하단 예약바 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[color:var(--bg)] border-t border-[color:var(--border)] shadow-lg z-40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            {product.basePrice ? (
              <div>
                <span className="text-xl font-bold text-[color:var(--brand)]">
                  {product.basePrice.toLocaleString()}원
                </span>
                <span className="text-sm text-[color:var(--muted)] ml-1">~</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[color:var(--fg)]">가격 문의</span>
            )}
          </div>
          <button
            onClick={() => setBookingOpen(true)}
            className="px-8 py-3 bg-[color:var(--brand)] text-white rounded-full font-semibold hover:opacity-90 transition"
          >
            예약하기
          </button>
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      {lightboxOpen && (
        <ImageLightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* 예약 모달 */}
      {bookingOpen && (
        <BookingModal
          product={product}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
