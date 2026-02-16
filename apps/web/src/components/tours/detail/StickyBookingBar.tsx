"use client";

import { Phone, MessageCircle } from "lucide-react";

interface StickyBookingBarProps {
  product: any;
  onBooking: () => void;
}

export function StickyBookingBar({ product, onBooking }: StickyBookingBarProps) {
  return (
    <div className="sticky top-24 space-y-5">
      {/* 예약 카드 */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-6">
          <div className="text-sm text-[#71717A] mb-2">1인 기준 가격</div>
          {product.basePrice ? (
            <div>
              <div className="text-[32px] font-bold text-[#18181B]">
                {product.basePrice.toLocaleString()}원
              </div>
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <div className="text-base text-[#71717A] line-through mt-1">
                  {product.originalPrice.toLocaleString()}원
                </div>
              )}
            </div>
          ) : (
            <div className="text-2xl font-bold text-[#18181B]">가격 문의</div>
          )}
        </div>

        <button
          onClick={onBooking}
          className="w-full h-14 bg-[#8B5CF6] text-white rounded-[28px] font-semibold text-base hover:opacity-90 transition"
        >
          예약 신청하기
        </button>
      </div>

      {/* 문의 카드 */}
      <div className="bg-[rgba(139,92,246,0.125)] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#8B5CF6] mb-4">
          도움이 필요하신가요?
        </h3>
        <div className="space-y-3">
          <a
            href="tel:02-1234-5678"
            className="flex items-center gap-2 text-sm text-[#18181B]"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <span>02-1234-5678</span>
          </a>
          <button className="flex items-center gap-2 text-sm text-[#18181B]">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <span>실시간 채팅 상담</span>
          </button>
        </div>
      </div>

      {/* 투어 정보 카드 */}
      <div className="bg-[#F9FAFB] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#18181B] mb-4">
          투어 정보
        </h3>
        <div className="space-y-3">
          {product.durationText && (
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">기간</span>
              <span className="text-[#18181B] font-medium">{product.durationText}</span>
            </div>
          )}
          {product.destination && (
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">장소</span>
              <span className="text-[#18181B] font-medium">{product.destination}</span>
            </div>
          )}
          {product.difficulty && (
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">난이도</span>
              <span className="text-[#18181B] font-medium">
                {product.difficulty === "BEGINNER" ? "초급" :
                 product.difficulty === "INTERMEDIATE" ? "중급" :
                 product.difficulty === "ADVANCED" ? "상급" : "전체"}
              </span>
            </div>
          )}
          {(product.minPeople || product.maxPeople) && (
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">인원</span>
              <span className="text-[#18181B] font-medium">
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
