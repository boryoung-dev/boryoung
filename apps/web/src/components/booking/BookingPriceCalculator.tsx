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
    <div className="bg-[color:var(--surface)] rounded-xl p-4 space-y-2">
      <div className="text-sm font-medium text-[color:var(--fg)] mb-2">가격 계산</div>

      {/* 기본가 */}
      <div className="flex justify-between text-sm">
        <span className="text-[color:var(--muted)]">
          기본가 {basePrice.toLocaleString()}원 x {peopleCount}명
        </span>
        <span className="text-[color:var(--fg)]">
          {(basePrice * peopleCount).toLocaleString()}원
        </span>
      </div>

      {/* 옵션 */}
      {selectedOptions.map((opt) => (
        <div key={opt.optionId} className="flex justify-between text-sm">
          <span className="text-[color:var(--muted)]">{opt.name}</span>
          <span className="text-[color:var(--fg)]">
            +{(opt.price * opt.quantity).toLocaleString()}원
          </span>
        </div>
      ))}

      {/* 합계 */}
      <div className="pt-2 border-t border-[color:var(--border)] flex justify-between">
        <span className="font-semibold text-[color:var(--fg)]">총 예상 금액</span>
        <span className="text-xl font-bold text-[color:var(--brand)]">
          {totalPrice.toLocaleString()}원
        </span>
      </div>

      <p className="text-xs text-[color:var(--muted)]">
        * 최종 금액은 상담 후 확정됩니다
      </p>
    </div>
  );
}
