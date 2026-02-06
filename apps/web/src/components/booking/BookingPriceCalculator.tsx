"use client";

import type { SelectedOption } from "./BookingModal";

interface BookingPriceCalculatorProps {
  basePrice: number | null;
  peopleCount: number;
  selectedOptions: SelectedOption[];
  totalPrice: number;
}

export function BookingPriceCalculator({
  basePrice,
  peopleCount,
  selectedOptions,
  totalPrice,
}: BookingPriceCalculatorProps) {
  if (!basePrice) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <div className="text-sm font-medium text-gray-700 mb-2">가격 계산</div>

      {/* 기본가 */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          기본가 {basePrice.toLocaleString()}원 x {peopleCount}명
        </span>
        <span className="text-gray-900">
          {(basePrice * peopleCount).toLocaleString()}원
        </span>
      </div>

      {/* 옵션 */}
      {selectedOptions.map((opt) => (
        <div key={opt.optionId} className="flex justify-between text-sm">
          <span className="text-gray-600">{opt.name}</span>
          <span className="text-gray-900">
            +{(opt.price * opt.quantity).toLocaleString()}원
          </span>
        </div>
      ))}

      {/* 합계 */}
      <div className="pt-2 border-t border-gray-200 flex justify-between">
        <span className="font-semibold text-gray-900">총 예상 금액</span>
        <span className="text-xl font-bold text-blue-600">
          {totalPrice.toLocaleString()}원
        </span>
      </div>

      <p className="text-xs text-gray-400">
        * 최종 금액은 상담 후 확정됩니다
      </p>
    </div>
  );
}
