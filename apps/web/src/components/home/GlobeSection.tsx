"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import createGlobe from "cobe";
import Link from "next/link";
import type { GlobeDestination } from "@/lib/home/globe";

interface GlobeSectionProps {
  destinations: GlobeDestination[];
}

/** 지구본 테마 프리셋 */
const GLOBE_THEMES = {
  "light-blue": {
    label: "라이트 블루",
    dark: 0,
    diffuse: 1.2,
    mapBrightness: 1.2,
    baseColor: [0.92, 0.95, 0.97] as [number, number, number],
    markerColor: [0.1, 0.4, 0.9] as [number, number, number],
    glowColor: [0.88, 0.91, 0.94] as [number, number, number],
  },
  "dark": {
    label: "다크",
    dark: 1,
    diffuse: 1.2,
    mapBrightness: 6,
    baseColor: [0.3, 0.3, 0.3] as [number, number, number],
    markerColor: [0.1, 0.8, 1] as [number, number, number],
    glowColor: [0.05, 0.05, 0.15] as [number, number, number],
  },
  "emerald": {
    label: "에메랄드",
    dark: 0,
    diffuse: 1.4,
    mapBrightness: 1.0,
    baseColor: [0.85, 0.95, 0.88] as [number, number, number],
    markerColor: [0.15, 0.6, 0.35] as [number, number, number],
    glowColor: [0.82, 0.93, 0.85] as [number, number, number],
  },
  "sunset": {
    label: "선셋",
    dark: 0.3,
    diffuse: 2,
    mapBrightness: 2,
    baseColor: [1, 0.85, 0.75] as [number, number, number],
    markerColor: [0.9, 0.3, 0.1] as [number, number, number],
    glowColor: [1, 0.9, 0.8] as [number, number, number],
  },
  "midnight": {
    label: "미드나잇",
    dark: 1,
    diffuse: 0.8,
    mapBrightness: 8,
    baseColor: [0.15, 0.15, 0.3] as [number, number, number],
    markerColor: [0.9, 0.6, 1] as [number, number, number],
    glowColor: [0.08, 0.08, 0.2] as [number, number, number],
  },
  "gold": {
    label: "골드",
    dark: 0.2,
    diffuse: 1.6,
    mapBrightness: 2.5,
    baseColor: [0.95, 0.88, 0.7] as [number, number, number],
    markerColor: [0.85, 0.65, 0.1] as [number, number, number],
    glowColor: [0.95, 0.9, 0.75] as [number, number, number],
  },
  "ocean": {
    label: "오션",
    dark: 0.5,
    diffuse: 1.5,
    mapBrightness: 4,
    baseColor: [0.1, 0.3, 0.6] as [number, number, number],
    markerColor: [0, 0.9, 0.7] as [number, number, number],
    glowColor: [0.1, 0.2, 0.4] as [number, number, number],
  },
  "monochrome": {
    label: "모노크롬",
    dark: 0,
    diffuse: 1.0,
    mapBrightness: 1.5,
    baseColor: [0.9, 0.9, 0.9] as [number, number, number],
    markerColor: [0.2, 0.2, 0.2] as [number, number, number],
    glowColor: [0.85, 0.85, 0.85] as [number, number, number],
  },
} as const;

type GlobeThemeKey = keyof typeof GLOBE_THEMES;

function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    (Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2)) % (Math.PI * 2),
    (lat * Math.PI) / 180,
  ];
}

/** 마커 클릭 감지용: 구면 좌표 → 2D 투영 */
function projectMarker(
  lat: number, lng: number, phi: number, theta: number, canvasSize: number
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const deltaLng = lngRad - (3 * Math.PI / 2 - phi);
  const x = Math.cos(latRad) * Math.sin(deltaLng);
  const y = Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(deltaLng);
  const y2 = y * Math.cos(theta) - z * Math.sin(theta);
  const z2 = y * Math.sin(theta) + z * Math.cos(theta);
  const r = canvasSize / 2;
  return { x: r + x * r, y: r - y2 * r, visible: z2 > 0 };
}

export function GlobeSection({ destinations }: GlobeSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);

  const firstDest = destinations.length > 0 ? destinations[0] : null;
  const initAngles = firstDest
    ? locationToAngles(firstDest.lat, firstDest.lng)
    : locationToAngles(0, 0);

  const phiRef = useRef(initAngles[0]);
  const thetaRef = useRef(initAngles[1]);
  const widthRef = useRef(0);
  const focusRef = useRef<[number, number] | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    destinations.length > 0 ? 0 : null
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [themeKey, setThemeKey] = useState<GlobeThemeKey>("light-blue");
  const globeInstanceRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDestinationClick = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
    setSelectedCity(null);
    const dest = destinations[index];
    if (dest) {
      const [phi, theta] = locationToAngles(dest.lat, dest.lng);
      focusRef.current = [phi, theta];
    }
  }, [destinations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const theme = GLOBE_THEMES[themeKey];

    if (globeInstanceRef.current) {
      globeInstanceRef.current.destroy();
    }

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: theme.dark,
      diffuse: theme.diffuse,
      mapSamples: 24000,
      mapBrightness: theme.mapBrightness,
      baseColor: [...theme.baseColor],
      markerColor: [...theme.markerColor],
      glowColor: [...theme.glowColor],
      markers: destinations.map((d, i) => ({
        location: [d.lat, d.lng] as [number, number],
        size: selectedIndex === i ? 0.12 : 0.06,
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

    const pointerStart = { x: 0, y: 0 };
    let dragged = false;

    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = { x: e.clientX, y: e.clientY };
      pointerStart.x = e.clientX;
      pointerStart.y = e.clientY;
      dragged = false;
      canvas.style.cursor = "grabbing";
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragged) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const canvasSize = rect.width;
        let closestIdx = -1;
        let closestDist = Infinity;
        const hitThreshold = canvasSize * 0.1;
        for (let i = 0; i < destinations.length; i++) {
          const proj = projectMarker(destinations[i].lat, destinations[i].lng, phiRef.current, thetaRef.current, canvasSize);
          if (!proj.visible) continue;
          const dist = Math.sqrt((clickX - proj.x) ** 2 + (clickY - proj.y) ** 2);
          if (dist < hitThreshold && dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }
        if (closestIdx >= 0) handleDestinationClick(closestIdx);
      }
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

        const totalDx = e.clientX - pointerStart.x;
        const totalDy = e.clientY - pointerStart.y;
        if (Math.abs(totalDx) > 5 || Math.abs(totalDy) > 5) {
          dragged = true;
        }

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

    globeInstanceRef.current = globe;

    return () => {
      globe.destroy();
      globeInstanceRef.current = null;
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerout", onPointerOut);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [themeKey, selectedIndex, handleDestinationClick, destinations]);

  // selectedCity 변경 시 캐러셀 초기화
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [selectedCity]);

  // 캐러셀 자동 루프
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }

    // 이전 타이머 정리
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    const container = carouselRef.current;
    if (!container || selectedIndex === null) return;

    const CARD_WIDTH = 276; // 260px + 16px gap
    const INTERVAL = 3000;

    autoScrollRef.current = setInterval(() => {
      if (!container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const nextScroll = container.scrollLeft + CARD_WIDTH;
      if (nextScroll >= maxScroll) {
        // 끝에 도달하면 처음으로
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollTo({ left: nextScroll, behavior: "smooth" });
      }
    }, INTERVAL);

    // 사용자 터치/마우스 시 일시 정지 후 재개
    const onInteractionStart = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
    const onInteractionEnd = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        if (!container) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const nextScroll = container.scrollLeft + CARD_WIDTH;
        if (nextScroll >= maxScroll) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollTo({ left: nextScroll, behavior: "smooth" });
        }
      }, INTERVAL);
    };

    container.addEventListener("pointerdown", onInteractionStart);
    container.addEventListener("pointerup", onInteractionEnd);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      container.removeEventListener("pointerdown", onInteractionStart);
      container.removeEventListener("pointerup", onInteractionEnd);
    };
  }, [selectedIndex]);

  // 목적지가 없을 때 가드
  if (destinations.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-[color:var(--surface)] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <p className="text-[color:var(--muted)] text-sm">준비 중입니다.</p>
        </div>
      </section>
    );
  }

  const selectedDest = selectedIndex !== null ? destinations[selectedIndex] ?? null : null;
  const selectedProducts = selectedDest ? selectedDest.products : [];

  // 실제 상품이 있는 도시만 노출 (정확한 이름 매칭)
  const availableCities = selectedDest
    ? selectedDest.cities.filter((city) =>
        selectedProducts.some((p) => p.destination === city.name)
      )
    : [];

  const filteredProducts = selectedCity
    ? selectedProducts.filter((p) => p.destination === selectedCity)
    : selectedProducts;

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
            국가를 선택하면 해당 골프투어 상품을 바로 확인할 수 있습니다.
          </p>
        </div>

        {/* 국가 태그 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {destinations.map((dest, i) => {
            const count = dest.products.length;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleDestinationClick(i)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedIndex === i
                    ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-white shadow-md"
                    : "border-[color:var(--border)] bg-white text-[color:var(--fg)] hover:border-[color:var(--fg)] hover:shadow-sm"
                }`}
              >
                {dest.emoji} {dest.name}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedIndex === i ? "bg-white/20" : "bg-[color:var(--surface)]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 지구본 + 상세 패널 */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* 3D 지구본 — 컴팩트 사이즈 */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px]">
              <canvas
                ref={canvasRef}
                className="h-full w-full cursor-grab"
                style={{ contain: "layout paint size", width: "100%", height: "100%" }}
              />
            </div>

            {/* 테마 선택 (로컬 확인용) — 비활성화
            {process.env.NODE_ENV === "development" && (
              <div className="flex flex-wrap justify-center gap-1.5 max-w-[360px]">
                {(Object.keys(GLOBE_THEMES) as GlobeThemeKey[]).map((key) => {
                  const t = GLOBE_THEMES[key];
                  const bg = `rgb(${Math.round(t.baseColor[0] * 255)}, ${Math.round(t.baseColor[1] * 255)}, ${Math.round(t.baseColor[2] * 255)})`;
                  const marker = `rgb(${Math.round(t.markerColor[0] * 255)}, ${Math.round(t.markerColor[1] * 255)}, ${Math.round(t.markerColor[2] * 255)})`;
                  return (
                    <button
                      key={key}
                      onClick={() => setThemeKey(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        themeKey === key
                          ? "border-[color:var(--fg)] shadow-md scale-105"
                          : "border-[color:var(--border)] hover:border-[color:var(--fg)]/50"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10"
                        style={{ background: `linear-gradient(135deg, ${bg}, ${marker})` }}
                      />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
            */}
          </div>

          {/* 우측: 수평 캐러셀 또는 안내 */}
          <div className="w-full lg:flex-1 min-w-0">
            {selectedDest && selectedProducts.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedDest.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                        {selectedDest.name} 골프투어
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/tours?category=${selectedDest.slug}`}
                    className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
                  >
                    전체 보기 →
                  </Link>
                </div>

                {/* 도시 서브 칩 */}
                {availableCities.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCity(null)}
                      className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                        selectedCity === null
                          ? "bg-[color:var(--fg)] text-white border-[color:var(--fg)]"
                          : "bg-[color:var(--surface)] text-[color:var(--muted)] border-[color:var(--border)]"
                      }`}
                    >
                      전체
                    </button>
                    {availableCities.map((city) => (
                      <button
                        key={city.slug}
                        type="button"
                        onClick={() => setSelectedCity(city.name)}
                        className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                          selectedCity === city.name
                            ? "bg-[color:var(--fg)] text-white border-[color:var(--fg)]"
                            : "bg-[color:var(--surface)] text-[color:var(--muted)] border-[color:var(--border)]"
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* 수평 캐러셀 */}
                {filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-[color:var(--border)] p-8 text-center">
                    <p className="text-sm text-[color:var(--muted)]">
                      해당 도시의 상품이 없습니다.
                    </p>
                  </div>
                ) : (
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                >
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/tours/${product.slug}`}
                      className="group flex-shrink-0 w-[240px] sm:w-[260px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 snap-start"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <span className="text-3xl">{selectedDest.emoji}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-[color:var(--fg)] line-clamp-1 mb-1">
                          {product.title}
                        </h4>
                        <p className="text-sm font-semibold text-[color:var(--fg)]">
                          {product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                )}
              </div>
            ) : selectedDest && selectedProducts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[color:var(--border)] p-10 text-center">
                <span className="text-4xl block mb-3">{selectedDest.emoji}</span>
                <p className="text-base font-semibold text-[color:var(--fg)] mb-1">
                  {selectedDest.name} 상품 준비 중
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  곧 새로운 골프투어 상품이 업데이트됩니다.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center mt-4 px-5 py-2.5 bg-[color:var(--fg)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  문의하기
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[color:var(--border)] p-10 text-center">
                <div className="text-5xl mb-4">🌏</div>
                <p className="text-lg font-semibold text-[color:var(--fg)]">국가를 선택해 주세요</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  지구본의 마커를 클릭하거나 상단 국가 태그를 선택하면<br />
                  해당 국가의 골프투어 상품을 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
