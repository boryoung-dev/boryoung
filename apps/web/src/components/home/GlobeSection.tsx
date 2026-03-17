"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import createGlobe from "cobe";
import Link from "next/link";

const DESTINATIONS = [
  { name: "일본", lat: 36.2, lng: 138.2, emoji: "🇯🇵", desc: "규슈·오키나와·홋카이도", href: "/tours?country=japan" },
  { name: "태국", lat: 15.87, lng: 100.99, emoji: "🇹🇭", desc: "방콕·치앙마이·파타야", href: "/tours?country=thailand" },
  { name: "베트남", lat: 16.05, lng: 108.22, emoji: "🇻🇳", desc: "다낭·호치민·하노이", href: "/tours?country=vietnam" },
  { name: "대만", lat: 25.03, lng: 121.56, emoji: "🇹🇼", desc: "타이베이 근교 명문 코스", href: "/tours?country=taiwan" },
  { name: "괌·사이판", lat: 13.44, lng: 144.79, emoji: "🇬🇺", desc: "오션뷰 리조트 골프", href: "/tours?country=guam-saipan" },
  { name: "제주", lat: 33.49, lng: 126.53, emoji: "🏌️", desc: "핀크스·나인브릿지", href: "/tours?country=domestic-jeju" },
];

function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    (Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2)) % (Math.PI * 2),
    (lat * Math.PI) / 180,
  ];
}

export function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const widthRef = useRef(0);
  const focusRef = useRef<[number, number] | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDestinationClick = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
    const dest = DESTINATIONS[index];
    const [phi, theta] = locationToAngles(dest.lat, dest.lng);
    focusRef.current = [phi, theta];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 24000,
      mapBrightness: 1.2,
      baseColor: [0.92, 0.95, 0.97],
      markerColor: [0.1, 0.4, 0.9],
      glowColor: [0.88, 0.91, 0.94],
      markers: DESTINATIONS.map((d) => ({
        location: [d.lat, d.lng] as [number, number],
        size: 0.07,
      })),
      onRender: (state) => {
        if (focusRef.current && pointerInteracting.current === null) {
          const [focusPhi, focusTheta] = focusRef.current;
          phiRef.current += (focusPhi - phiRef.current) * 0.08;
          thetaRef.current += (focusTheta - thetaRef.current) * 0.08;
        } else if (pointerInteracting.current === null) {
          phiRef.current += 0.003;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    // 드래그 인터랙션
    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };
    const onPointerOut = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const dx = e.clientX - pointerInteracting.current.x;
        const dy = e.clientY - pointerInteracting.current.y;
        phiRef.current += dx * 0.003;
        thetaRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, thetaRef.current - dy * 0.003));
        pointerInteracting.current = { x: e.clientX, y: e.clientY };
        focusRef.current = null;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerout", onPointerOut);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerout", onPointerOut);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[color:var(--surface)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <p className="text-[13px] font-medium text-[color:var(--muted)] uppercase tracking-widest mb-3">
            Destinations
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            전 세계 명문 골프장으로 안내합니다
          </h2>
          <p className="text-[color:var(--muted)] max-w-lg mx-auto">
            지구본을 돌려 여행지를 탐색하세요. 국가를 선택하면 해당 골프투어를 확인할 수 있습니다.
          </p>
        </div>

        {/* 국가 태그 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {DESTINATIONS.map((dest, i) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => handleDestinationClick(i)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedIndex === i
                  ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-white shadow-md"
                  : "border-[color:var(--border)] bg-white text-[color:var(--fg)] hover:border-[color:var(--fg)] hover:shadow-sm"
              }`}
            >
              {dest.emoji} {dest.name}
            </button>
          ))}
        </div>

        {/* 지구본 + 상세 패널 */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* 3D 지구본 */}
          <div className="relative w-full max-w-[420px] lg:max-w-[480px] flex-shrink-0 aspect-square">
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab"
              style={{ contain: "layout paint size", width: "100%", height: "100%" }}
            />
          </div>

          {/* 우측 상세 패널 */}
          <div className="w-full lg:flex-1 min-h-[280px] flex items-center">
            {selectedIndex !== null ? (
              <div className="w-full rounded-2xl bg-white p-8 shadow-sm border border-[color:var(--border)]">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl">{DESTINATIONS[selectedIndex].emoji}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-[color:var(--fg)]">
                      {DESTINATIONS[selectedIndex].name} 골프투어
                    </h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      {DESTINATIONS[selectedIndex].desc}
                    </p>
                  </div>
                </div>
                <Link
                  href={DESTINATIONS[selectedIndex].href}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  투어 상품 보기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="w-full rounded-2xl border-2 border-dashed border-[color:var(--border)] p-8 text-center">
                <div className="text-5xl mb-4">🌏</div>
                <p className="text-lg font-semibold text-[color:var(--fg)]">국가를 선택해 주세요</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  지구본의 마커 또는 상단 국가 태그를 클릭하면<br />
                  해당 국가의 골프투어를 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
