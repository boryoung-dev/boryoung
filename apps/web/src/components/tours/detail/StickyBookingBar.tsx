"use client";

import { Calendar, Users, Phone } from "lucide-react";

interface StickyBookingBarProps {
  product: any;
  onBooking: () => void;
}

export function StickyBookingBar({ product, onBooking }: StickyBookingBarProps) {
  return (
    <div className="sticky top-24">
      <div className="bg-[color:var(--bg)] border border-[color:var(--border)] rounded-2xl shadow-lg p-6 space-y-6">
        {/* 가격 */}
        <div>
          {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
            <div className="text-[color:var(--muted)] line-through text-sm">
              {product.originalPrice.toLocaleString()}원
            </div>
          )}
          {product.basePrice ? (
            <div className="text-3xl font-bold text-[color:var(--brand)]">
              {product.basePrice.toLocaleString()}원
              <span className="text-sm text-[color:var(--muted)] font-normal ml-1">~ /1인</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-[color:var(--fg)]">가격 문의</div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-3 py-4 border-y border-[color:var(--border)]">
          {product.durationText && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-[color:var(--muted)]" />
              <span className="text-[color:var(--muted)]">여행 기간</span>
              <span className="ml-auto font-medium text-[color:var(--fg)]">{product.durationText}</span>
            </div>
          )}
          {(product.minPeople || product.maxPeople) && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-[color:var(--muted)]" />
              <span className="text-[color:var(--muted)]">인원</span>
              <span className="ml-auto font-medium text-[color:var(--fg)]">
                {product.minPeople && product.maxPeople
                  ? `${product.minPeople}~${product.maxPeople}명`
                  : product.minPeople
                  ? `${product.minPeople}명 이상`
                  : `최대 ${product.maxPeople}명`}
              </span>
            </div>
          )}
          {product.departure && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[color:var(--muted)] w-4 h-4 flex items-center justify-center text-xs font-bold">출</span>
              <span className="text-[color:var(--muted)]">출발지</span>
              <span className="ml-auto font-medium text-[color:var(--fg)]">{product.departure}</span>
            </div>
          )}
        </div>

        {/* 가격 옵션 미리보기 */}
        {product.priceOptions && product.priceOptions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-[color:var(--fg)]">가격 옵션</div>
            {product.priceOptions.slice(0, 3).map((opt: any) => (
              <div key={opt.id} className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">{opt.name}</span>
                <span className="font-medium text-[color:var(--fg)]">{opt.price.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onBooking}
          className="w-full py-3.5 bg-[color:var(--brand)] text-white rounded-full font-semibold text-lg hover:opacity-90 transition"
        >
          예약하기
        </button>

        {/* 전화 문의 */}
        <a
          href="tel:041-930-2200"
          className="flex items-center justify-center gap-2 w-full py-3 border border-[color:var(--border)] rounded-full text-[color:var(--fg)] font-medium hover:bg-[color:var(--surface)] transition"
        >
          <Phone className="w-4 h-4" />
          전화 문의 041-930-2200
        </a>
      </div>
    </div>
  );
}
