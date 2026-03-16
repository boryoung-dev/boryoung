"use client";

import { CheckCircle, Phone } from "lucide-react";

interface BookingConfirmationProps {
  bookingNumber: string;
  productTitle: string;
  onClose: () => void;
}

export function BookingConfirmation({
  bookingNumber,
  productTitle,
  onClose,
}: BookingConfirmationProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="text-xl font-bold text-[color:var(--fg)] mb-2">
        예약 문의가 접수되었습니다
      </h3>

      <p className="text-[color:var(--muted)] mb-6">
        담당자가 빠른 시일 내에 연락드리겠습니다.
      </p>

      {/* 예약 정보 */}
      <div className="bg-[color:var(--surface)] rounded-xl p-5 mb-6 text-left">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--muted)]">예약번호</span>
            <span className="font-bold text-[color:var(--brand)]">{bookingNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--muted)]">상품</span>
            <span className="font-medium text-[color:var(--fg)] text-right max-w-[200px] truncate">
              {productTitle}
            </span>
          </div>
        </div>
      </div>

      {/* 전화 안내 */}
      <div className="flex items-center justify-center gap-2 text-sm text-[color:var(--muted)] mb-6">
        <Phone className="w-4 h-4" />
        <span>
          문의: <strong>041-930-2200</strong>
        </span>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-[color:var(--brand)] text-[color:var(--brand-foreground)] rounded-xl font-semibold hover:opacity-90 transition"
      >
        확인
      </button>
    </div>
  );
}
