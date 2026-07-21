"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TourHeroBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
}

interface TourHeroCarouselProps {
  banners: TourHeroBanner[];
  children: ReactNode;
}

export function TourHeroCarousel({
  banners,
  children,
}: TourHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === 0 ? banners.length - 1 : current - 1,
    );
  }, [banners.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = window.setInterval(showNext, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length, isPaused, showNext]);

  if (banners.length === 0) return null;

  const activeBanner = banners[activeIndex] ?? banners[0];

  return (
    <section
      aria-label="여행상품 배너"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden pb-20 pt-24 md:pb-24 md:pt-32"
    >
      <div className="absolute inset-0 z-0 bg-neutral-900">
        {banners.map((banner, index) => (
          <img
            key={banner.id}
            src={banner.imageUrl}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center text-white md:px-16">
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight drop-shadow md:text-5xl">
            {activeBanner.title}
          </h1>
          {activeBanner.subtitle && (
            <p className="text-sm text-white/90 drop-shadow md:text-lg">
              {activeBanner.subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="이전 여행상품 배너"
            className="absolute left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="다음 여행상품 배너"
            className="absolute right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${index + 1}번 여행상품 배너로 이동`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
