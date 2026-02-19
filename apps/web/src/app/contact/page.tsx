"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: "", phone: "", email: "", content: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError(data.error || "문의 접수에 실패했습니다.");
      }
    } catch (err) {
      console.error("문의 제출 오류:", err);
      setError("문의 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "대표전화",
      value: "1588-0320",
      href: "tel:1588-0320",
      sub: "직통 02-730-1220",
    },
    {
      icon: Phone,
      label: "야간/휴일",
      value: "010-5514-5831",
      href: "tel:010-5514-5831",
    },
    {
      icon: Mail,
      label: "팩스",
      value: "02-2647-2083",
    },
    {
      icon: MapPin,
      label: "주소",
      value: "경기도 김포시 태장로 795번길 23, 537호(장기동)",
    },
    {
      icon: Clock,
      label: "운영 시간",
      value: "평일 09:00 - 18:00",
      sub: "주말/공휴일 휴무",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />

      {/* 히어로 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            문의하기
          </h1>
          <p className="text-lg text-white/80">
            궁금하신 사항이 있으시면 언제든지 연락주세요
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 연락처 정보 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">연락처 안내</h2>
              <div className="space-y-5">
                {contactInfo.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{item.value}</div>
                      )}
                      {item.sub && <div className="text-xs text-gray-500 mt-0.5">{item.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 카카오톡 상담 */}
            <div className="bg-[#FEE500] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#371D1E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#371D1E]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#371D1E]">카카오톡 상담</h3>
                  <p className="text-xs text-[#371D1E]/70">빠른 상담을 원하시면 카카오톡으로!</p>
                </div>
              </div>
              <a
                href="https://pf.kakao.com/_placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#371D1E] text-[#FEE500] font-semibold py-3 rounded-xl hover:bg-[#271310] transition-colors text-sm"
              >
                카카오톡 채널 추가
              </a>
            </div>
          </div>

          {/* 문의 폼 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">문의 남기기</h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">문의가 성공적으로 접수되었습니다!</p>
                    <p className="text-green-600 text-xs mt-1">빠른 시일 내에 연락드리겠습니다.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="홍길동"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="여행 일정, 인원, 원하시는 여행지 등을 자유롭게 작성해주세요"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? (
                    "제출 중..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      문의하기
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
