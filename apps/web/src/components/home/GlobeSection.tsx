"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import createGlobe from "cobe";
import Link from "next/link";

// 국가별 좌표 + 상품 데이터
const DESTINATIONS = [
  { name: "일본", lat: 36.2, lng: 138.2, emoji: "🇯🇵", desc: "규슈·오키나와·홋카이도", href: "/tours?country=japan", color: "#EF4444" },
  { name: "태국", lat: 15.87, lng: 100.99, emoji: "🇹🇭", desc: "방콕·치앙마이·파타야", href: "/tours?country=thailand", color: "#F59E0B" },
  { name: "베트남", lat: 16.05, lng: 108.22, emoji: "🇻🇳", desc: "다낭·호치민·하노이", href: "/tours?country=vietnam", color: "#10B981" },
  { name: "대만", lat: 25.03, lng: 121.56, emoji: "🇹🇼", desc: "타이베이 근교 명문 코스", href: "/tours?country=taiwan", color: "#3B82F6" },
  { name: "괌·사이판", lat: 13.44, lng: 144.79, emoji: "🇬🇺", desc: "오션뷰 리조트 골프", href: "/tours?country=guam-saipan", color: "#8B5CF6" },
  { name: "제주", lat: 33.49, lng: 126.53, emoji: "🏌️", desc: "핀크스·나인브릿지", href: "/tours?country=domestic-jeju", color: "#EC4899" },
];

// 위경도 → 글로브 좌표 변환
function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180,
  ];
}

export function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const [activeDestination, setActiveDestination] = useState<number | null>(null);
  const [focusedPhi, setFocusedPhi] = useState<number | null>(null);
  const [focusedTheta, setFocusedTheta] = useState<number | null>(null);
  const widthRef = useRef(0);

  const handleDestinationClick = useCallback((index: number) => {
    const dest = DESTINATIONS[index];
    const [phi, theta] = locationToAngles(dest.lat, dest.lng);
    setFocusedPhi(phi);
    setFocusedTheta(theta);
    setActiveDestination(index);
  }, []);

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        widthRef.current = width;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 36000,
      mapBrightness: 6,
      baseColor: [0.15, 0.15, 0.15],
      markerColor: [0.4, 0.7, 1],
      glowColor: [0.1, 0.1, 0.1],
      markers: DESTINATIONS.map((d) => ({
        location: [d.lat, d.lng] as [number, number],
        size: 0.08,
      })),
      onRender: (state) => {
        // 포커스된 위치로 부드럽게 이동
        if (focusedPhi !== null && focusedTheta !== null) {
          const distPhi = focusedPhi - state.phi;
          const distTheta = focusedTheta - state.theta;
          state.phi += distPhi * 0.04;
          state.theta += distTheta * 0.04;
          phiRef.current = state.phi;
        } else if (pointerInteracting.current === null) {
          // 자동 회전
          state.phi += 0.003;
          phiRef.current = state.phi;
        } else {
          state.phi = phiRef.current;
        }

        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [focusedPhi, focusedTheta]);

  return (
    <section className="py-16 md:py-24 bg-[color:var(--surface)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 왼쪽: 텍스트 + 국가 리스트 */}
          <div>
            <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">
              Destinations
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight">
              전 세계 명문 골프장으로<br />안내합니다
            </h2>
            <p className="text-[color:var(--muted)] mb-10 leading-relaxed">
              지구본을 돌려 여행지를 탐색하세요.<br className="hidden md:block" />
              클릭하면 해당 국가의 골프투어를 확인할 수 있습니다.
            </p>

            {/* 국가 리스트 */}
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((dest, i) => (
                <button
                  key={dest.name}
                  onClick={() => handleDestinationClick(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                    activeDestination === i
                      ? "bg-white shadow-md scale-[1.02]"
                      : "bg-white/50 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{dest.emoji}</span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold transition-colors ${
                      activeDestination === i ? "text-[color:var(--fg)]" : "text-[color:var(--fg)]"
                    }`}>
                      {dest.name}
                    </div>
                    <div className="text-[11px] text-[color:var(--muted)] truncate">
                      {dest.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 선택된 국가의 CTA */}
            {activeDestination !== null && (
              <Link
                href={DESTINATIONS[activeDestination].href}
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300"
              >
                {DESTINATIONS[activeDestination].emoji} {DESTINATIONS[activeDestination].name} 골프투어 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* 오른쪽: 3D 지구본 */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-[500px] aspect-square relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                  if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
                }}
                onPointerUp={() => {
                  pointerInteracting.current = null;
                  if (canvasRef.current) canvasRef.current.style.cursor = "grab";
                }}
                onPointerOut={() => {
                  pointerInteracting.current = null;
                  if (canvasRef.current) canvasRef.current.style.cursor = "grab";
                }}
                onMouseMove={(e) => {
                  if (pointerInteracting.current !== null) {
                    const delta = e.clientX - pointerInteracting.current;
                    pointerInteractionMovement.current = delta;
                    phiRef.current += delta / 200;
                    pointerInteracting.current = e.clientX;
                    setFocusedPhi(null);
                    setFocusedTheta(null);
                    setActiveDestination(null);
                  }
                }}
                onTouchMove={(e) => {
                  if (pointerInteracting.current !== null && e.touches[0]) {
                    const delta = e.touches[0].clientX - pointerInteracting.current;
                    pointerInteractionMovement.current = delta;
                    phiRef.current += delta / 200;
                    pointerInteracting.current = e.touches[0].clientX;
                    setFocusedPhi(null);
                    setFocusedTheta(null);
                    setActiveDestination(null);
                  }
                }}
              />
              {/* 지구본 아래 그림자 */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-6 bg-black/[0.03] rounded-[50%] blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
