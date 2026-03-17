import type { Metadata } from "next";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
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
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        {/* 히어로 - 텍스트 중심, 그라디언트 없음 */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-4">About us</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--fg)] mb-6 leading-[1.1]">
              2004년부터,<br />골프여행만 해왔습니다
            </h1>
            <p className="text-lg text-[color:var(--muted)] leading-relaxed max-w-xl mx-auto">
              (주)보령항공여행사는 22년간 오직 골프여행 하나에 집중해 온 전문 여행사입니다.
            </p>
          </div>
        </section>

        {/* 숫자 실적 - 미니멀 */}
        <section className="py-16 border-y border-[color:var(--border)]">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "22", unit: "년", label: "업력" },
                { value: "50", unit: "+", label: "제휴 골프장" },
                { value: "10,000", unit: "+", label: "누적 고객" },
                { value: "95", unit: "%", label: "재방문율" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-[color:var(--fg)]">
                    <span className="text-4xl md:text-5xl font-light tracking-tight">{stat.value}</span>
                    <span className="text-2xl font-light text-[color:var(--muted)]">{stat.unit}</span>
                  </div>
                  <p className="text-[13px] text-[color:var(--muted)] mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 스토리 */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="space-y-6 text-base text-[color:var(--muted)] leading-[1.8]">
              <p>
                일본, 동남아, 대만, 국내 등 다양한 지역의 명문 골프장과 직접 제휴를 맺고 있으며,
                22년간 쌓아온 현지 네트워크와 노하우로 최적의 골프 여행을 설계합니다.
              </p>
              <p>
                단순한 패키지 여행이 아닌, 골퍼의 실력과 취향에 맞춘 맞춤형 일정을 제안합니다.
                명문 코스 라운딩부터 현지 맛집, 온천, 관광까지 — 평생 기억에 남을 경험을 만들어 드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* 핵심 가치 - 심플 그리드 */}
        <section className="py-16 md:py-20 bg-[color:var(--surface)]">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">왜 보령항공여행인가</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--border)]">
              {[
                { title: "직접 제휴 네트워크", desc: "중개 없이 현지 골프장·호텔과 직접 계약하여 최상의 조건을 제공합니다." },
                { title: "골프 전문 컨설턴트", desc: "골프를 직접 치는 전문가들이 코스 난이도와 컨디션까지 세밀하게 안내합니다." },
                { title: "22년 운영 노하우", desc: "2004년 설립 이후 축적된 경험으로 돌발 상황에도 빠르게 대응합니다." },
                { title: "95% 재방문율", desc: "한번 경험한 고객이 다시 찾는 서비스, 검증된 만족도가 증명합니다." },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8">
                  <h3 className="text-[15px] font-semibold text-[color:var(--fg)] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[color:var(--muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 회사 정보 */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-lg font-semibold mb-8">회사 정보</h2>
            <dl className="divide-y divide-[color:var(--border)]">
              {[
                ["회사명", "(주)보령항공여행사"],
                ["대표자", "이종양"],
                ["사업자등록번호", "117-81-52746"],
                ["통신판매번호", "제2013-경기김포-0560호"],
                ["여행업등록번호", "국외 2013-000008 | 국내 2013-000005"],
                ["설립연도", "2004년"],
                ["주소", "경기도 김포시 태장로 795번길 23, 537호(장기동)"],
                ["대표전화", "1588-0320"],
              ].map(([label, value]) => (
                <div key={label} className="flex py-4 text-sm">
                  <dt className="w-36 text-[color:var(--muted)] flex-shrink-0">{label}</dt>
                  <dd className="text-[color:var(--fg)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
