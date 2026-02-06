"use client";

import { Calendar, Users, Phone } from "lucide-react";

interface StickyBookingBarProps {
  product: any;
  onBooking: () => void;
}

export function StickyBookingBar({ product, onBooking }: StickyBookingBarProps) {
  return (
    <div className="sticky top-24">
      <div className="bg-white border rounded-2xl shadow-lg p-6 space-y-6">
        {/* 가격 */}
        <div>
          {product.originalPrice && product.basePrice && product.originalPrice > product.basePrice && (
            <div className="text-gray-400 line-through text-sm">
              {product.originalPrice.toLocaleString()}원
            </div>
          )}
          {product.basePrice ? (
            <div className="text-3xl font-bold text-blue-600">
              {product.basePrice.toLocaleString()}원
              <span className="text-sm text-gray-500 font-normal ml-1">~ /1인</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-700">가격 문의</div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-3 py-4 border-y">
          {product.durationText && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">여행 기간</span>
              <span className="ml-auto font-medium">{product.durationText}</span>
            </div>
          )}
          {(product.minPeople || product.maxPeople) && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">인원</span>
              <span className="ml-auto font-medium">
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
              <span className="text-gray-400 w-4 h-4 flex items-center justify-center text-xs font-bold">출</span>
              <span className="text-gray-600">출발지</span>
              <span className="ml-auto font-medium">{product.departure}</span>
            </div>
          )}
        </div>

        {/* 가격 옵션 미리보기 */}
        {product.priceOptions && product.priceOptions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">가격 옵션</div>
            {product.priceOptions.slice(0, 3).map((opt: any) => (
              <div key={opt.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{opt.name}</span>
                <span className="font-medium">{opt.price.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onBooking}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
        >
          예약하기
        </button>

        {/* 전화 문의 */}
        <a
          href="tel:041-930-2200"
          className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <Phone className="w-4 h-4" />
          전화 문의 041-930-2200
        </a>
      </div>
    </div>
  );
}
