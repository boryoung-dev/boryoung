"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { TabNavigation } from "./TabNavigation";
import { OverviewSection } from "./OverviewSection";
import { HighlightCards } from "./HighlightCards";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { InclusionsSection } from "./InclusionsSection";
import { ImageLightbox } from "./ImageLightbox";
import { ReviewSection } from "./ReviewSection";
import { ScheduleDates } from "./ScheduleDates";
import { StickyBookingBar } from "./StickyBookingBar";
import { BookingModal } from "@/components/booking/BookingModal";

interface ProductDetailPageProps {
  product: any;
}

type TabType = "intro" | "itinerary" | "inclusions" | "reviews";

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("intro");

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 히어로 래퍼: 이미지+정보 + 하이라이트 카드 */}
      <div className="bg-[#FAFAFA] pt-10 pb-15 px-15">
        <div className="mx-auto max-w-[1440px]">
          <HeroSection
            product={product}
            onBooking={() => setBookingOpen(true)}
            onImageClick={openLightbox}
          />

          {/* 하이라이트 카드 */}
          <div className="mt-10">
            <HighlightCards product={product} />
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 (pill 스타일) */}
      <div className="bg-[#FAFAFA] sticky top-16 z-30">
        <div className="mx-auto max-w-[1440px] px-15">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* 콘텐츠 섹션: Main + Sidebar */}
      <div className="bg-[#FAFAFA] px-6 md:px-10 lg:px-15 pt-8 pb-15">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex gap-8 lg:gap-12">
            {/* 메인 콘텐츠 */}
            <div className="flex-1">
              {activeTab === "intro" && (
                <div className="space-y-6">
                  <OverviewSection product={product} />
                  {product.scheduleDates && (
                    <ScheduleDates dates={product.scheduleDates} />
                  )}
                </div>
              )}

              {activeTab === "itinerary" && product.itineraries && product.itineraries.length > 0 && (
                <ItineraryTimeline itineraries={product.itineraries} />
              )}

              {activeTab === "inclusions" && (
                <InclusionsSection
                  inclusions={product.inclusions}
                  exclusions={product.exclusions}
                />
              )}

              {activeTab === "reviews" && product.reviews && product.reviews.length > 0 && (
                <ReviewSection reviews={product.reviews} />
              )}
            </div>

            {/* 사이드바 (데스크톱) */}
            <div className="hidden lg:block w-[400px] flex-shrink-0">
              <StickyBookingBar
                product={product}
                onBooking={() => setBookingOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 예약바 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E7] shadow-lg z-40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            {product.basePrice ? (
              <div>
                <span className="text-xl font-bold text-[#8B5CF6]">
                  {product.basePrice.toLocaleString()}원
                </span>
                <span className="text-sm text-[#71717A] ml-1">~</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#18181B]">가격 문의</span>
            )}
          </div>
          <button
            onClick={() => setBookingOpen(true)}
            className="px-8 py-3 bg-[#8B5CF6] text-white rounded-[28px] font-semibold hover:opacity-90 transition"
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
