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
import type { TourProductDetail, ScheduleDate } from "@/lib/types";

interface ProductDetailPageProps {
  product: TourProductDetail;
}

type TabType = "intro" | "itinerary" | "inclusions" | "reviews";

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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
            onBooking={() => window.location.href = "tel:1588-0320"}
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
                  {product.scheduleDates && Array.isArray(product.scheduleDates) && (
                    <ScheduleDates dates={product.scheduleDates as unknown as ScheduleDate[]} />
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
                onBooking={() => window.location.href = "tel:1588-0320"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 바 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[color:var(--border)] shadow-lg z-40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
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
          <a
            href="https://pf.kakao.com/_xgxoBxj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#FAE100] text-[#3C1E1E] rounded-[28px] font-semibold text-sm hover:opacity-90 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
            </svg>
            카톡상담
          </a>
          <a
            href="tel:1588-0320"
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[color:var(--brand)] text-white rounded-[28px] font-semibold text-sm hover:opacity-90 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            전화상담
          </a>
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
    </div>
  );
}
