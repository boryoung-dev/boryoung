"use client";

import { Phone } from "lucide-react";
import type { TourProductDetail } from "@/lib/types";

interface StickyBookingBarProps {
  product: TourProductDetail;
  onBooking: () => void;
}

export function StickyBookingBar({ product }: StickyBookingBarProps) {
  return (
    <div className="sticky top-24 space-y-5">
      {/* 가격 + 전화 상담 카드 */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-6">
          <div className="text-sm text-[color:var(--muted)] mb-2">1인 기준 가격</div>
          {product.basePrice ? (
            <div>
              <div className="text-[32px] font-bold text-[color:var(--fg)]">
                {product.basePrice.toLocaleString()}원
              </div>
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <div className="text-base text-[color:var(--muted)] line-through mt-1">
                  {product.originalPrice.toLocaleString()}원
                </div>
              )}
            </div>
          ) : (
            <div className="text-2xl font-bold text-[color:var(--fg)]">가격 문의</div>
          )}
        </div>

        <a
          href="tel:1588-0320"
          className="flex items-center justify-center gap-2 w-full h-14 bg-[color:var(--brand)] text-white rounded-[28px] font-semibold text-base hover:opacity-90 transition"
        >
          <Phone className="w-5 h-5" />
          전화 상담하기
        </a>

        <a
          href="https://pf.kakao.com/_xgxoBxj"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-12 mt-3 bg-[#FAE100] text-[#3C1E1E] rounded-[28px] font-semibold text-sm hover:opacity-90 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
          </svg>
          카카오톡 상담
        </a>
      </div>

      {/* 전화번호 안내 카드 */}
      <div className="bg-[color:var(--brand)]/10 rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[color:var(--brand)] mb-4">
          전화 문의
        </h3>
        <div className="space-y-3">
          <a
            href="tel:1588-0320"
            className="flex items-center gap-2 text-sm text-[color:var(--fg)]"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-[color:var(--brand)]" />
            </div>
            <div>
              <div className="font-semibold">1588-0320</div>
              <div className="text-xs text-[color:var(--muted)]">대표전화</div>
            </div>
          </a>
          <a
            href="tel:02-730-1220"
            className="flex items-center gap-2 text-sm text-[color:var(--fg)]"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-[color:var(--brand)]" />
            </div>
            <div>
              <div className="font-semibold">02-730-1220</div>
              <div className="text-xs text-[color:var(--muted)]">직통</div>
            </div>
          </a>
          <a
            href="tel:010-5514-5831"
            className="flex items-center gap-2 text-sm text-[color:var(--fg)]"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-[color:var(--brand)]" />
            </div>
            <div>
              <div className="font-semibold">010-5514-5831</div>
              <div className="text-xs text-[color:var(--muted)]">야간/휴일</div>
            </div>
          </a>
        </div>
      </div>

      {/* 투어 정보 카드 */}
      <div className="bg-[color:var(--surface)] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[color:var(--fg)] mb-4">
          투어 정보
        </h3>
        <div className="space-y-3">
          {product.durationText && (
            <div className="flex justify-between text-sm">
              <span className="text-[color:var(--muted)]">기간</span>
              <span className="text-[color:var(--fg)] font-medium">{product.durationText}</span>
            </div>
          )}
          {product.destination && (
            <div className="flex justify-between text-sm">
              <span className="text-[color:var(--muted)]">장소</span>
              <span className="text-[color:var(--fg)] font-medium">{product.destination}</span>
            </div>
          )}
          {product.difficulty && (
            <div className="flex justify-between text-sm">
              <span className="text-[color:var(--muted)]">난이도</span>
              <span className="text-[color:var(--fg)] font-medium">
                {product.difficulty === "BEGINNER" ? "초급" :
                 product.difficulty === "INTERMEDIATE" ? "중급" :
                 product.difficulty === "ADVANCED" ? "상급" : "전체"}
              </span>
            </div>
          )}
          {(product.minPeople || product.maxPeople) && (
            <div className="flex justify-between text-sm">
              <span className="text-[color:var(--muted)]">인원</span>
              <span className="text-[color:var(--fg)] font-medium">
                {product.minPeople && product.maxPeople
                  ? `${product.minPeople}~${product.maxPeople}명`
                  : product.minPeople
                  ? `${product.minPeople}명 이상`
                  : `최대 ${product.maxPeople}명`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
