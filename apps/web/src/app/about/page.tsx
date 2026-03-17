import type { Metadata } from "next";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { AnimateOnScroll } from "@/components/common/AnimateOnScroll";
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
        {/* 섹션 1: 풀블리드 히어로 이미지 + 오버레이 텍스트 */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&q=80"
            alt="골프 코스"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white px-6">
              <AnimateOnScroll animation="fadeIn">
                <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/60 mb-4">About us</p>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeUp" delay={200}>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-4">
                  2004년부터,<br />골프여행만 해왔습니다
                </h1>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeUp" delay={400}>
                <p className="text-lg text-white/70 max-w-md mx-auto">
                  22년간 오직 골프여행 하나에 집중해 온 전문 여행사
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* 섹션 2: 숫자 실적 — 가로 풀너비 다크 밴드 */}
        <section className="bg-[color:var(--fg)] text-white py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "22", unit: "년", label: "업력" },
                { value: "50", unit: "+", label: "제휴 골프장" },
                { value: "10,000", unit: "+", label: "누적 고객" },
                { value: "95", unit: "%", label: "재방문율" },
              ].map((stat, i) => (
                <AnimateOnScroll key={i} animation="fadeUp" delay={i * 100}>
                  <div>
                    <div className="mb-1">
                      <span className="text-4xl md:text-5xl font-light">{stat.value}</span>
                      <span className="text-2xl font-light text-white/50">{stat.unit}</span>
                    </div>
                    <p className="text-[13px] text-white/50">{stat.label}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* 섹션 3: 스토리 — 이미지+텍스트 교차 레이아웃 (지그재그) */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6 space-y-20 md:space-y-28">
            {/* 블록 1: 이미지 왼쪽 + 텍스트 오른쪽 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <AnimateOnScroll animation="fadeLeft">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80"
                    alt="명문 골프장"
                    className="w-full h-full object-cover"
                  />
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeRight" delay={200}>
                <div>
                  <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Our Network</p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6 leading-tight whitespace-pre-line">
                    {"일본·동남아·대만·제주\n50개+ 명문 골프장"}
                  </h2>
                  <p className="text-[color:var(--muted)] leading-[1.8]">
                    코코파 리조트, 이부스키 골프클럽(일본), 몽고메리 링크스(베트남), 양밍산 골프(대만) 등 현지 명문 코스와 직접 제휴. 중개 수수료 없이 최적의 가격과 프리미엄 티타임을 확보합니다.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>

            {/* 블록 2: 텍스트 왼쪽 + 이미지 오른쪽 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <AnimateOnScroll animation="fadeRight" className="order-2 md:order-1">
                <div>
                  <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Our Approach</p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6 leading-tight whitespace-pre-line">
                    {"54홀 라운딩부터\n현지 맛집까지"}
                  </h2>
                  <p className="text-[color:var(--muted)] leading-[1.8]">
                    골퍼의 핸디캡에 맞춘 코스 추천, 온천 료칸 숙박, 현지 맛집 예약까지. 라운딩 외의 시간도 특별하게 채워드립니다. 공항 픽업부터 귀국까지 전 일정을 전담 매니저가 케어합니다.
                  </p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fadeLeft" delay={200} className="order-1 md:order-2">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80"
                    alt="골프 라운딩"
                    className="w-full h-full object-cover"
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* 섹션 4: 핵심 가치 — 풀너비 surface 배경, 미니멀 그리드 */}
        <section className="py-20 md:py-28 bg-[color:var(--surface)]">
          <div className="max-w-5xl mx-auto px-6">
            <AnimateOnScroll animation="fadeUp">
              <div className="text-center mb-14">
                <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Why us</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">왜 보령항공여행인가</h2>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "현지 직접 제휴", desc: "일본·태국·베트남·대만 50개+ 골프장과 직접 계약. 중개 없이 최상의 조건." },
                { title: "골퍼 전문 컨설팅", desc: "핸디캡별 코스 추천, 계절별 컨디션 안내. 골프를 아는 전문가가 설계합니다." },
                { title: "95% 재방문", desc: "첫 여행 고객의 95%가 재방문. 10,000명이 검증한 서비스입니다." },
              ].map((item, i) => (
                <AnimateOnScroll key={i} animation="fadeUp" delay={i * 150}>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--fg)] text-white text-sm font-medium flex items-center justify-center mx-auto mb-5">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-[15px] font-semibold text-[color:var(--fg)] mb-2">{item.title}</h3>
                    <p className="text-[13px] text-[color:var(--muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* 섹션 5: 풀블리드 CTA 이미지 밴드 */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1592919505780-303950717480?w=1600&q=80"
            alt="골프 여행"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex items-center justify-center">
            <AnimateOnScroll animation="fadeUp">
              <div className="text-center text-white px-6">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                  당신만의 골프여행을 시작하세요
                </h2>
                <p className="text-white/60 mb-8">전문 컨설턴트가 맞춤 일정을 설계해 드립니다</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-opacity">
                    상담 문의하기
                  </a>
                  <a href="tel:1588-0320" className="inline-flex items-center justify-center h-12 px-8 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                    1588-0320
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 섹션 6: 회사 정보 — 심플 테이블 */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <AnimateOnScroll animation="fadeUp">
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
                    <dt className="w-28 md:w-36 text-[color:var(--muted)] flex-shrink-0">{label}</dt>
                    <dd className="text-[color:var(--fg)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
