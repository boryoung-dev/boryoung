import type { Metadata } from "next";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { Globe, Users, Award, Heart } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "회사 소개",
  description: "22년 전통의 골프 여행 전문 보령항공여행입니다. 2004년부터 고객님께 최상의 골프투어 서비스를 제공해왔습니다.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "회사 소개 | 보령항공여행",
    description: "22년 전통의 골프 여행 전문 보령항공여행입니다.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[color:var(--surface)]">
      <SiteHeader />

      <main>
        {/* 히어로 */}
        <div className="bg-gradient-to-br from-[color:var(--brand)] to-blue-800 text-white py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">
              20년 전통의 골프 여행 전문가
            </h1>
            <p className="text-xl text-white/80">
              보령항공여행과 함께하는 특별한 여행
            </p>
          </div>
        </div>

        {/* 회사 소개 */}
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="bg-[color:var(--surface-2)] rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">회사 소개</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-[color:var(--fg)] leading-relaxed mb-4">
                보령항공여행은 2004년부터 골프 여행 전문으로 고객님께 최상의 서비스를
                제공해온 여행사입니다.
              </p>
              <p className="text-[color:var(--fg)] leading-relaxed mb-4">
                일본, 동남아, 대만, 국내 등 다양한 지역의 명문 골프장과 제휴를 맺고
                있으며, 20년간 쌓아온 노하우로 고객님의 완벽한 여행을 책임집니다.
              </p>
              <p className="text-[color:var(--fg)] leading-relaxed">
                단순한 여행이 아닌, 평생 기억에 남을 특별한 경험을 선사하겠습니다.
              </p>
            </div>
          </div>

          {/* 핵심 가치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[color:var(--surface-2)] rounded-xl p-6">
              <div className="w-12 h-12 bg-[color:var(--brand)]/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[color:var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">글로벌 네트워크</h3>
              <p className="text-[color:var(--muted)]">
                전 세계 명문 골프장 및 호텔과의 직접 제휴를 통한 최상의 조건
              </p>
            </div>

            <div className="bg-[color:var(--surface-2)] rounded-xl p-6">
              <div className="w-12 h-12 bg-[color:var(--brand)]/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[color:var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">전문 인력</h3>
              <p className="text-[color:var(--muted)]">
                골프와 여행에 정통한 전문가들의 세심한 케어
              </p>
            </div>

            <div className="bg-[color:var(--surface-2)] rounded-xl p-6">
              <div className="w-12 h-12 bg-[color:var(--brand)]/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[color:var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">20년 전통</h3>
              <p className="text-[color:var(--muted)]">
                2004년부터 쌓아온 신뢰와 노하우
              </p>
            </div>

            <div className="bg-[color:var(--surface-2)] rounded-xl p-6">
              <div className="w-12 h-12 bg-[color:var(--brand)]/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[color:var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">고객 만족</h3>
              <p className="text-[color:var(--muted)]">
                고객 재방문율 95% 이상의 검증된 서비스
              </p>
            </div>
          </div>

          {/* 회사 정보 */}
          <div className="bg-[color:var(--surface-2)] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">회사 정보</h2>
            <dl className="space-y-4">
              <div className="flex">
                <dt className="w-32 font-semibold text-[color:var(--fg)]">회사명</dt>
                <dd className="text-[color:var(--muted)]">보령항공여행</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-semibold text-[color:var(--fg)]">대표자</dt>
                <dd className="text-[color:var(--muted)]">심재형</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-semibold text-[color:var(--fg)]">사업자번호</dt>
                <dd className="text-[color:var(--muted)]">123-45-67890</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-semibold text-[color:var(--fg)]">설립연도</dt>
                <dd className="text-[color:var(--muted)]">2004년</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
