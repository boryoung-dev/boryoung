import { SiteHeader } from "@/components/common/SiteHeader";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "문의하기 | 보령항공여행",
  description: "보령항공여행에 문의하세요",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">문의하기</h1>
          <p className="text-lg text-gray-600">
            궁금하신 사항이 있으시면 언제든지 연락주세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 연락처 정보 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">연락처</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">전화</div>
                    <a href="tel:02-1234-5678" className="text-blue-600 hover:underline text-lg">
                      02-1234-5678
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">이메일</div>
                    <a href="mailto:contact@boryoung.com" className="text-blue-600 hover:underline">
                      contact@boryoung.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">주소</div>
                    <p className="text-gray-600">
                      서울특별시 강남구 테헤란로 123<br />
                      보령빌딩 5층
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">운영 시간</div>
                    <p className="text-gray-600">
                      평일: 09:00 - 18:00<br />
                      주말/공휴일: 휴무
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 카카오톡 문의 */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.155-.103 2.48-1.708 3.48-2.392.52.076 1.054.117 1.654.117 4.97 0 9-3.185 9-7.115C21 6.185 16.97 3 12 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">카카오톡 상담</h3>
              </div>
              <p className="text-gray-700 mb-4">
                카카오톡으로 빠른 상담을 받아보세요!
              </p>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-lg transition">
                카카오톡 채널 추가
              </button>
            </div>
          </div>

          {/* 문의 폼 */}
          <div className="bg-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">문의 남기기</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="문의하실 내용을 자유롭게 작성해주세요"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                문의하기
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
