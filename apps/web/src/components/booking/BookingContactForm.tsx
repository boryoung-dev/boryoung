"use client";

import { useState } from "react";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  requests: string;
}

interface BookingContactFormProps {
  contactInfo: ContactInfo;
  onChange: (info: ContactInfo) => void;
}

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingContactForm({
  contactInfo,
  onChange,
}: BookingContactFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contactInfo, [field]: value });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const phoneError =
    touched.phone && contactInfo.phone && !PHONE_REGEX.test(contactInfo.phone.replace(/-/g, "").replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1$2$3"))
      ? "올바른 전화번호를 입력해주세요"
      : "";
  const emailError =
    touched.email && contactInfo.email && !EMAIL_REGEX.test(contactInfo.email)
      ? "올바른 이메일 형식을 입력해주세요"
      : "";

  const inputBase = "w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[color:var(--ring)] focus:border-transparent transition-colors";
  const inputNormal = `${inputBase} border-[color:var(--border)]`;
  const inputError = `${inputBase} border-red-400 focus:ring-red-500`;

  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--fg)] mb-3">
        예약자 정보
      </label>
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="이름 *"
            className={touched.name && !contactInfo.name ? inputError : inputNormal}
          />
          {touched.name && !contactInfo.name && (
            <p className="text-xs text-red-500 mt-1">이름을 입력해주세요</p>
          )}
        </div>
        <div>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="연락처 * (010-1234-5678)"
            className={phoneError || (touched.phone && !contactInfo.phone) ? inputError : inputNormal}
          />
          {touched.phone && !contactInfo.phone && (
            <p className="text-xs text-red-500 mt-1">연락처를 입력해주세요</p>
          )}
          {phoneError && (
            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="이메일 (선택)"
            className={emailError ? inputError : inputNormal}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <textarea
            value={contactInfo.requests}
            onChange={(e) => update("requests", e.target.value)}
            placeholder="요청사항 (선택)"
            rows={3}
            className={`${inputNormal} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
