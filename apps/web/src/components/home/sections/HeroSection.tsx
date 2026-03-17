"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

const EXTRA_SLIDES = [
  {
    headline: "오사카 식도락 여행",
    subhead: "현지인 맛집부터 카페까지 완전 정복",
    bg: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
    cta: "특가 보기",
    link: "/tours"
  },
  {
    headline: "겨울 삿포로 눈꽃 축제",
    subhead: "하얀 설원 위에서 즐기는 낭만",
    bg: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1600&q=80",
    cta: "일정 확인",
    link: "/tours"
  },
  {
    headline: "다낭 호캉스 특가",
    subhead: "5성급 리조트 조식 포함 패키지",
    bg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
    cta: "예약 하기",
    link: "/tours"
  }
];

interface BannerData {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  ctaText?: string | null;
}

export function HeroSection(props: {
  headline: string;
  subhead: string;
  quickChips: string[];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  backgroundImageUrl?: string;
  banners?: BannerData[];
}) {
  const slides = props.banners && props.banners.length > 0
    ? props.banners.map(banner => ({
        headline: banner.title,
        subhead: banner.subtitle || "",
        bg: banner.imageUrl,
        cta: banner.ctaText || "자세히 보기",
        link: banner.linkUrl || "/tours"
      }))
    : [
        {
          headline: props.headline,
          subhead: props.subhead,
          bg: props.backgroundImageUrl,
          cta: props.primaryCtaLabel,
          link: "/tours"
        },
        ...EXTRA_SLIDES
      ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full">
      <div className="relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="min-w-0 flex-[0_0_100%]"
              >
                <div className="relative w-full aspect-[16/7] sm:aspect-[2.5/1] overflow-hidden">
                  <img
                    src={slide.bg}
                    alt={slide.headline}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* 그라디언트: 왼쪽 하단에서 올라오는 방향 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                  {/* 텍스트: 왼쪽 하단 고정 */}
                  <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
                    <div className="max-w-lg">
                      <h2 className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight mb-2 md:mb-3">
                        {slide.headline}
                      </h2>
                      {slide.subhead && (
                        <p className="text-sm md:text-base text-white/70 font-normal mb-5 line-clamp-2">
                          {slide.subhead}
                        </p>
                      )}
                      <Link href={slide.link}>
                        <button className="rounded-full px-5 h-9 bg-white text-black text-sm font-medium hover:bg-white/90 border-none shadow-sm transition-colors duration-200">
                          {slide.cta}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 슬라이드 카운터 */}
        <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-20 bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-medium text-white/80 border border-white/10">
          {selectedIndex + 1} / {slides.length}
        </div>

        {/* 이전 버튼 */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex"
          aria-label="이전 슬라이드"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 다음 버튼 */}
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex"
          aria-label="다음 슬라이드"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
