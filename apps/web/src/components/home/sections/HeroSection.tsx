"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { Button } from "@repo/ui";

const EXTRA_SLIDES = [
  {
    headline: "오사카 식도락 여행",
    subhead: "현지인 맛집부터 카페까지 완전 정복",
    bg: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80",
    cta: "특가 보기"
  },
  {
    headline: "겨울 삿포로 눈꽃 축제",
    subhead: "하얀 설원 위에서 즐기는 낭만",
    bg: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1600&q=80",
    cta: "일정 확인"
  },
  {
    headline: "다낭 호캉스 특가",
    subhead: "5성급 리조트 조식 포함 패키지",
    bg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
    cta: "예약 하기"
  }
];

export function HeroSection(props: {
  headline: string;
  subhead: string;
  quickChips: string[];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  backgroundImageUrl?: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  
  const slides = [
    {
      headline: props.headline,
      subhead: props.subhead,
      bg: props.backgroundImageUrl,
      cta: props.primaryCtaLabel
    },
    ...EXTRA_SLIDES
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div className="w-full bg-white pb-8">
      <div className="pt-4 px-4 md:px-6 max-w-[1200px] mx-auto">
        <div 
          className="relative w-full aspect-[4/5] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-sm group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.bg}
                alt={slide.headline}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div className="max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700">
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-2 md:mb-4 drop-shadow-sm">
                    {slide.headline}
                  </h2>
                  <p className="text-white/90 text-lg md:text-xl font-medium mb-6 drop-shadow-sm line-clamp-2">
                    {slide.subhead}
                  </p>
                  <Button 
                    variant="brand" 
                    className="rounded-full px-6 h-10 md:h-12 bg-white text-black hover:bg-white/90 border-none font-bold"
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-20 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium text-white/90 border border-white/10">
            {currentSlide + 1} / {slides.length}
          </div>

          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:flex"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
