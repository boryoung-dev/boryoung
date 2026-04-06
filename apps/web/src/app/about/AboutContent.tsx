"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { KakaoFloating } from "@/components/common/KakaoFloating";

/* ── 히어로 전용: mount 기반 페이드인 ── */
function HeroFade({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "none" : "translateY(20px)",
      transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {children}
    </div>
  );
}

/* ── 스크롤 애니메이션 훅 ── */
function Anim({ children, className = "", delay = 0, y = 24 }: {
  children: ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // mount 후 약간의 딜레이를 주고 observer 세팅
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        { threshold: 0.01 }
      );
      obs.observe(el);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ── 유통구조 비교 ── */
function DistributionCompare() {
  return (
    <section className="py-20 md:py-28 bg-[color:var(--surface)]">
      <div className="max-w-4xl mx-auto px-6">
        <Anim>
          <div className="text-center mb-16">
            <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Our Difference</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">같은 여행, 다른 가격의 이유</h2>
            <p className="text-[14px] text-[color:var(--muted)] mt-3">유통 단계가 줄면, 가격이 달라집니다</p>
          </div>
        </Anim>

        {/* 비용 흐름 시각화 */}
        <div className="space-y-6">
          {/* 일반 여행사 바 */}
          <Anim>
            <div className="bg-white rounded-2xl border border-[color:var(--border)] p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[14px] font-medium text-[color:var(--fg)]">일반 여행사 (90%)</p>
                <p className="text-[15px] font-bold text-red-500 tracking-tight">최종 비용 <span className="text-xl">130%</span></p>
              </div>
              {/* 세그먼트 바 */}
              <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                <div className="bg-[color:var(--surface-3)] flex-[2] flex items-center justify-center border-r border-white">
                  <span className="text-[11px] text-[color:var(--muted)]">고객</span>
                </div>
                <div className="bg-[color:var(--surface-3)] flex-[2] flex items-center justify-center border-r border-white">
                  <span className="text-[11px] text-[color:var(--muted)]">B2C 여행사</span>
                </div>
                <div className="bg-red-100 flex-[3] flex items-center justify-center border-r border-white">
                  <span className="text-[11px] text-red-600 font-medium">B2B 랜드사 (한국) +15%</span>
                </div>
                <div className="bg-red-200 flex-[3] flex items-center justify-center border-r border-white">
                  <span className="text-[11px] text-red-700 font-medium">B2B 랜드사 (현지) +15%</span>
                </div>
                <div className="bg-[color:var(--surface-3)] flex-[2] flex items-center justify-center">
                  <span className="text-[11px] text-[color:var(--muted)]">현지 여행사</span>
                </div>
              </div>
              <p className="text-[12px] text-[color:var(--muted)] text-center">5단계 유통 — 최소 한 곳 이상의 유통과정이 있어 각 단계마다 마진이 추가됩니다</p>
            </div>
          </Anim>

          {/* 보령항공여행사 바 */}
          <Anim delay={200}>
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 md:p-8 shadow-lg shadow-emerald-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold text-[color:var(--fg)]">㈜보령항공여행사 (상위 1%)</p>
                  <span className="text-[10px] font-bold text-white bg-emerald-500 px-2.5 py-0.5 rounded-full">DIRECT</span>
                </div>
                <p className="text-[15px] font-bold text-emerald-600 tracking-tight">최종 비용 <span className="text-xl">100%</span></p>
              </div>
              {/* 세그먼트 바 */}
              <div className="flex h-14 rounded-xl overflow-hidden mb-4">
                <div className="bg-emerald-50 flex-[2] flex items-center justify-center border-r border-white">
                  <span className="text-[12px] text-emerald-700">고객</span>
                </div>
                <div className="bg-emerald-500 flex-[5] flex items-center justify-center border-r border-white/10 px-3">
                  <span className="text-[12px] text-white font-semibold">㈜보령항공여행사 — 직접 수배</span>
                </div>
                <div className="bg-emerald-50 flex-[2] flex items-center justify-center">
                  <span className="text-[12px] text-emerald-700">현지 파트너</span>
                </div>
              </div>
              <p className="text-[12px] text-[color:var(--muted)] text-center">3단계 직거래 — 일본어 능통자 직접 거래, 현지 답사 후 상품 결정, 중간 마진 0%</p>
            </div>
          </Anim>
        </div>

        {/* 핵심 수치 */}
        <Anim delay={300}>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "−30%", label: "비용 절감", desc: "중간 유통 제거" },
              { val: "3단계", label: "유통 과정", desc: "5단계 → 3단계" },
              { val: "0%", label: "중간 마진", desc: "직접 거래 구조" },
              { val: "100%", label: "현지 답사", desc: "검증된 상품만" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-[color:var(--border)] p-5">
                <p className="text-xl md:text-2xl font-bold text-[color:var(--fg)]">{s.val}</p>
                <p className="text-[13px] font-medium text-[color:var(--fg)] mt-1">{s.label}</p>
                <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </Anim>
      </div>
    </section>
  );
}

/* ── 카운트업 ── */
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [val, setVal] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
        { threshold: 0.01 }
      );
      obs.observe(el);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || animated.current) return;
    animated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 2000, 1);
      const eased = 1 - Math.pow(2, -10 * p);
      setVal(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, end]);
  const fmt = val.toLocaleString("ko-KR");
  return <span ref={ref}>{fmt}{suffix}</span>;
}

/* ── 메인 ── */
export function AboutContent() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        {/* ━━ 히어로 ━━ */}
        <section className="relative h-[80vh] min-h-[560px] overflow-hidden">
          <img
            src="/images/about/slide4_img7.jpg"
            alt="보령항공여행 제휴 골프장"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-3xl">
              <HeroFade delay={0}>
                <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-white/50 mb-6">
                  Since 2004
                </p>
              </HeroFade>
              <HeroFade delay={200}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-5">
                  골프여행,<br />
                  경력 <span className="text-emerald-400">23년</span>차의 여정
                </h1>
              </HeroFade>
              <HeroFade delay={400}>
                <p className="text-lg md:text-xl text-white/70 max-w-lg mx-auto leading-relaxed">
                  2004년부터 오직 골프여행 하나에 집중해 온<br className="hidden md:block" />
                  대한민국 대표 해외골프투어 전문 여행사
                </p>
              </HeroFade>
              <HeroFade delay={600}>
                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/products" className="inline-flex items-center justify-center h-12 px-8 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-400 transition-colors">
                    상품 둘러보기
                  </a>
                  <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                    상담 문의하기
                  </a>
                </div>
              </HeroFade>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full block -mb-px"><path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" /></svg>
          </div>
        </section>

        {/* ━━ 숫자 실적 ━━ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { end: 22, suffix: "년", label: "골프투어 전문 경력", color: "text-[color:var(--fg)]" },
                { end: 50, suffix: "개+", label: "직접 제휴 골프장", color: "text-[color:var(--fg)]" },
                { end: 77, suffix: "만명+", label: "누적 고객", color: "text-[color:var(--fg)]" },
                { end: 95, suffix: "%", label: "고객 재방문율", color: "text-[color:var(--fg)]" },
              ].map((s, i) => (
                <Anim key={i} delay={i * 120}>
                  <div className="text-center">
                    <div className={`text-4xl md:text-5xl font-light tracking-tight mb-2 ${s.color}`}>
                      <CountUp end={s.end} suffix={s.suffix} />
                    </div>
                    <p className="text-[13px] text-[color:var(--muted)]">{s.label}</p>
                  </div>
                </Anim>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ 회사 소개 ━━ */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <Anim>
              <div className="text-center">
                <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">About Us</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">㈜보령항공여행사</h2>
              </div>
            </Anim>
            <Anim delay={200}>
              <div className="text-[15px] text-[color:var(--fg)] leading-[2] space-y-6">
                <p>
                  우리 ㈜보령항공여행사는 2004년에 창업한 <strong>22년차 골프투어전문여행사</strong>이자
                  인센티브기업 해외단체여행 전문 여행사입니다.
                </p>
                <p>
                  우리는 한번 고객님을 보내는데 만족하지 않고, 고객님의 니즈와 특성을 반영하여 고객관리를 통해 <strong>맞춤형으로 고객님을 안내</strong>합니다.
                </p>
                <p>
                  고객과의 소통을 최우선으로 생각하며, 작은 디테일 하나에도 정성을 담아 완성도 높은 여행만족도를 선보입니다.
                </p>
                <p>
                  또한 ㈜보령항공여행사는 주말에도 비상근무를 대기중에 있어 현지와 문제점이 있을 경우 <strong>바로바로 컴플레인 해결</strong>을 약속드립니다.
                </p>
              </div>
            </Anim>
          </div>
        </section>

        {/* ━━ 회사 연혁 ━━ */}
        <section className="py-20 md:py-28 bg-[color:var(--surface)]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              <Anim>
                <div>
                  <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">History</p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">회사 연혁</h2>
                  <div className="space-y-5">
                    {[
                      { year: "2004", desc: "㈜보령항공여행사 설립" },
                      { year: "2005", desc: "일본, 태국, 베트남 등 해외시장 진출" },
                      { year: "2022", desc: "동남아 현지 파트너 네트워크 강화" },
                      { year: "2025", desc: "국내 및 해외 기준 누적 77만여명 고객 유치 달성" },
                      { year: "", desc: "일본항공, 대한항공, 해외국적기 항공사 파트너십" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-5">
                        <span className="text-sm font-semibold text-[color:var(--fg)] w-12 flex-shrink-0">{item.year}</span>
                        <span className="text-sm text-[color:var(--muted)] leading-relaxed">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Anim>
              <Anim delay={200}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden"><img src="/images/about/slide2_img1.jpg" alt="골프장" className="w-full h-full object-cover" /></div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden"><img src="/images/about/slide3_img5.jpg" alt="호텔" className="w-full h-full object-cover" /></div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden"><img src="/images/about/slide2_img2.jpg" alt="산악코스" className="w-full h-full object-cover" /></div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden"><img src="/images/about/slide3_img4.jpg" alt="온천" className="w-full h-full object-cover" /></div>
                </div>
              </Anim>
            </div>
          </div>
        </section>

        {/* ━━ 주요 경력 ━━ */}
        <section className="py-20 md:py-28 bg-[color:var(--fg)] text-white">
          <div className="max-w-3xl mx-auto px-6">
            <Anim>
              <p className="text-[13px] font-medium text-white/40 uppercase tracking-widest mb-3">Achievements</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-12">주요 경력</h2>
            </Anim>
            <div className="space-y-0">
              {[
                "22년 경력의 여행사 창립 1세기 여행사",
                "기업 해외 골프투어 및 인센티브 단체여행 77만여명 다수 송출",
                "보험사 및 은행 등 해외단체연수 및 골프투어 다수 경험",
                "㈜트릿지 MICE 행사 경험",
                "2022년부터 학군단 해외군사문화 탐방 10건 이상 수행",
                "해외 현지와의 직접적인 거래로 비용절감 등",
                "SBS골프방송, 신문, 블로그 광고 등 고객유지를 위한 수백억대 광고비 지출",
              ].map((item, i) => (
                <Anim key={i} delay={i * 60}>
                  <div className="flex gap-4 py-4 border-b border-white/10">
                    <span className="text-[13px] text-white/30 font-medium w-6 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[15px] text-white/80 leading-relaxed">{item}</span>
                  </div>
                </Anim>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ 핵심 가치 & 서비스 ━━ */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <Anim>
              <div className="text-center mb-14">
                <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Core Values</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">핵심 가치 & 서비스</h2>
              </div>
            </Anim>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  num: "01",
                  title: "고객의 니즈 중심",
                  desc: "여행 관련하여 추천은 하되, 고객의 니즈를 중심으로 개인 맞춤형 견적 서비스를 제공합니다. 상담부터 일정 구성까지 1:1 전담 플래너가 지원합니다.",
                },
                {
                  num: "02",
                  title: "현지에 대한 전문성",
                  desc: "골프투어 및 기업 인센티브 투어 분야에서 22년 이상 쌓아온 경험과 노하우. 직접 검증하지 않은 상품은 취급하지 않습니다.",
                },
                {
                  num: "03",
                  title: "유통과정 최소화",
                  desc: "일본어 능통자가 직접 골프장과 거래를 진행, 동남아지역은 현지여행사와의 직접 거래를 통해 경쟁력 있는 가격을 제공합니다.",
                },
                {
                  num: "04",
                  title: "지속 가능한 CS 관리",
                  desc: "고객 불편이 발생할 경우, 주말을 포함한 위기대응 전담팀이 즉시 조치합니다. 문제해결을 목표로 하는 사후관리 프로세스를 운영중입니다.",
                },
              ].map((v, i) => (
                <Anim key={i} delay={i * 100}>
                  <div className="border-t border-[color:var(--border)] pt-6">
                    <span className="text-[12px] text-[color:var(--muted)] font-medium">{v.num}</span>
                    <h3 className="text-[15px] font-semibold text-[color:var(--fg)] mt-2 mb-3">{v.title}</h3>
                    <p className="text-[13px] text-[color:var(--muted)] leading-[1.8]">{v.desc}</p>
                  </div>
                </Anim>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ 유통구조 비교 (인터렉티브) ━━ */}
        <DistributionCompare />

        {/* ━━ 네트워크 인프라 ━━ */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <Anim>
              <div className="text-center mb-14">
                <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Infrastructure</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">폭넓은 네트워크 구축</h2>
              </div>
            </Anim>

            <div className="space-y-12">
              {/* 항공 */}
              <Anim>
                <div className="border-t border-[color:var(--border)] pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[color:var(--fg)]">항공사 네트워크</h3>
                      <p className="text-[13px] text-[color:var(--muted)] mt-1">글로벌 항공사 파트너십</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["대한항공", "아시아나항공", "일본항공", "타이항공", "싱가포르항공", "카타르항공", "델타항공", "에어프랑스", "KLM", "유나이티드", "에어캐나다", "중국동방항공", "필리핀항공", "진에어", "티웨이"].map((name) => (
                        <span key={name} className="text-[13px] text-[color:var(--fg)] bg-[color:var(--surface)] px-4 py-2 rounded-lg">{name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Anim>

              {/* 호텔 & 인프라 */}
              <Anim>
                <div className="border-t border-[color:var(--border)] pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[color:var(--fg)]">호텔 및 현지 인프라</h3>
                      <p className="text-[13px] text-[color:var(--muted)] mt-1">전세계 호텔 예약 및 현지 교통</p>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["호텔패스", "하얏트", "Agoda", "윈덤호텔그룹"].map((name) => (
                          <span key={name} className="text-[13px] text-[color:var(--fg)] bg-[color:var(--surface)] px-4 py-2 rounded-lg">{name}</span>
                        ))}
                      </div>
                      <ul className="text-[13px] text-[color:var(--muted)] space-y-1.5 leading-relaxed">
                        <li>· 전세계 20,000개 이상 호텔 예약 서비스</li>
                        <li>· 렌터카 체인 기업과 계약, 전세계 어느 지역이든 렌터카 서비스 제공</li>
                        <li>· 현지 여행사 및 코디네이터와 네트워크 — 공항 픽업, 수행, 의전, 현지이동 서비스</li>
                        <li>· 유럽 및 일본 등의 고속철도 좌석예매 및 발권 서비스</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Anim>

              {/* 24시간 대응 */}
              <Anim>
                <div className="border-t border-[color:var(--border)] pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[color:var(--fg)]">24시간 365일 대응</h3>
                      <p className="text-[13px] text-[color:var(--muted)] mt-1">출장자의 입장에서 생각하는 서비스</p>
                    </div>
                    <div>
                      <ul className="text-[13px] text-[color:var(--muted)] space-y-1.5 leading-relaxed">
                        <li>· 긴급상황 발생 시 전담팀 직원 법인폰 (전화/카카오톡 등 SNS) 이용</li>
                        <li>· 업무시간 외 통합 비상 네트워크 구축하여 빈틈없는 긴급서비스 제공</li>
                        <li>· 글로벌 구난구조업체 (iSOS, Travel Watch 등) 연계 서비스 제공 가능</li>
                        <li>· 24시간 365일 항공 예약, 변경과 같은 긴급한 출장 업무 발생 시 신속, 정확한 긴급서비스 지원</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Anim>
            </div>
          </div>
        </section>

        {/* ━━ 포토 갤러리 ━━ */}
        <section className="py-20 md:py-28 bg-[color:var(--surface)]">
          <div className="max-w-6xl mx-auto px-6">
            <Anim>
              <div className="text-center mb-14">
                <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">Gallery</p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">직접 답사한 명문 코스 & 숙소</h2>
              </div>
            </Anim>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { src: "/images/about/slide2_img1.jpg", span: "col-span-2 row-span-2", aspect: "aspect-square" },
                { src: "/images/about/slide2_img2.jpg", span: "", aspect: "aspect-square" },
                { src: "/images/about/slide4_img8.jpg", span: "", aspect: "aspect-square" },
                { src: "/images/about/slide3_img4.jpg", span: "", aspect: "aspect-square" },
                { src: "/images/about/slide3_img5.jpg", span: "", aspect: "aspect-square" },
                { src: "/images/about/slide4_img9.jpg", span: "col-span-2", aspect: "aspect-[2/1]" },
                { src: "/images/about/slide2_img3.jpg", span: "col-span-2", aspect: "aspect-[2/1]" },
              ].map((item, i) => (
                <Anim key={i} delay={i * 60} className={item.span}>
                  <div className={`${item.aspect} rounded-xl overflow-hidden`}>
                    <img src={item.src} alt="골프 코스" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </Anim>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ CTA ━━ */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img src="/images/about/slide4_img8.jpg" alt="골프 여행" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex items-center justify-center">
            <Anim>
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
            </Anim>
          </div>
        </section>

        {/* ━━ 회사 정보 ━━ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <Anim>
              <h2 className="text-lg font-bold mb-8">회사 정보</h2>
              <dl className="divide-y divide-gray-100">
                {[
                  ["회사명", "(주)보령항공여행사"],
                  ["대표자", "이종양"],
                  ["사업자등록번호", "117-81-52746"],
                  ["통신판매번호", "제2013-경기김포-0560호"],
                  ["여행업등록번호", "국외 2013-000008 | 국내 2013-000005"],
                  ["설립연도", "2004년"],
                  ["주소", "경기도 김포시 태장로 795번길 23, 537호(장기동)"],
                  ["대표전화", "1588-0320"],
                  ["직통전화", "010-3041-9192"],
                ].map(([label, value]) => (
                  <div key={label} className="flex py-4 text-sm">
                    <dt className="w-28 md:w-40 text-gray-400 flex-shrink-0 font-medium">{label}</dt>
                    <dd className="text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Anim>
          </div>
        </section>
      </main>
      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
