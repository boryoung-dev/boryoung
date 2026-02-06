"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { BookingProductSummary } from "./BookingProductSummary";
import { BookingDatePicker } from "./BookingDatePicker";
import { BookingPeopleCount } from "./BookingPeopleCount";
import { BookingOptions } from "./BookingOptions";
import { BookingContactForm } from "./BookingContactForm";
import { BookingPriceCalculator } from "./BookingPriceCalculator";
import { BookingConfirmation } from "./BookingConfirmation";

interface BookingModalProps {
  product: any;
  onClose: () => void;
}

export interface SelectedOption {
  optionId: string;
  name: string;
  price: number;
  quantity: number;
}

export function BookingModal({ product, onClose }: BookingModalProps) {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [bookingNumber, setBookingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [selectedDate, setSelectedDate] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
    requests: "",
  });

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // 총 가격 계산
  const baseTotal = (product.basePrice || 0) * peopleCount;
  const optionsTotal = selectedOptions.reduce(
    (sum, opt) => sum + opt.price * opt.quantity,
    0
  );
  const totalPrice = baseTotal + optionsTotal;

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.phone) {
      alert("이름과 연락처를 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourProductId: product.id,
          name: contactInfo.name,
          phone: contactInfo.phone,
          email: contactInfo.email || undefined,
          peopleCount,
          desiredDate: selectedDate || undefined,
          selectedOptions,
          totalPrice: totalPrice > 0 ? totalPrice : undefined,
          requests: contactInfo.requests || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingNumber(data.bookingNumber);
        setStep("confirmed");
      } else {
        alert(data.error || "예약 처리에 실패했습니다");
      }
    } catch {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* 모달 - 데스크톱: 중앙 모달, 모바일: 바텀시트 */}
      <div className="relative bg-white w-full sm:w-[520px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {step === "confirmed" ? "예약 완료" : "예약 문의"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto">
          {step === "confirmed" ? (
            <BookingConfirmation
              bookingNumber={bookingNumber}
              productTitle={product.title}
              onClose={onClose}
            />
          ) : (
            <div className="p-6 space-y-6">
              {/* 상품 요약 */}
              <BookingProductSummary product={product} />

              {/* 날짜 선택 */}
              <BookingDatePicker
                scheduleDates={product.scheduleDates}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />

              {/* 인원 선택 */}
              <BookingPeopleCount
                count={peopleCount}
                onChange={setPeopleCount}
                min={product.minPeople || 1}
                max={product.maxPeople || 20}
              />

              {/* 가격 옵션 */}
              {product.priceOptions && product.priceOptions.length > 0 && (
                <BookingOptions
                  options={product.priceOptions}
                  selectedOptions={selectedOptions}
                  onChange={setSelectedOptions}
                />
              )}

              {/* 연락처 */}
              <BookingContactForm
                contactInfo={contactInfo}
                onChange={setContactInfo}
              />

              {/* 가격 계산 */}
              <BookingPriceCalculator
                basePrice={product.basePrice}
                peopleCount={peopleCount}
                selectedOptions={selectedOptions}
                totalPrice={totalPrice}
              />
            </div>
          )}
        </div>

        {/* 하단 버튼 (예약 폼일 때만) */}
        {step === "form" && (
          <div className="px-6 py-4 border-t flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "접수 중..." : "예약 문의하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
