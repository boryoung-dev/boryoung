"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface MainBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  ctaText?: string | null;
}

export function MainBannerCarousel({ banners }: { banners: MainBanner[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: false,
      duration: 38,
      loop: banners.length > 1,
      slidesToScroll: 1,
    },
    banners.length > 1 ? [autoplay.current] : []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (banners.length === 0) return null;

  return (
    <section
      className="bg-white py-4 sm:py-5 md:py-8"
      aria-roledescription="carousel"
      aria-label="메인 배너"
    >
      <div className="w-full px-3 sm:px-5 md:px-8">
        <div className="group relative mx-auto max-w-[1920px]">
          <div ref={emblaRef} className="overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="flex touch-pan-y gap-3 md:gap-5">
              {banners.map((banner, index) => {
                const isActive = index === selectedIndex;
                const href = banner.linkUrl || "/tours";

                return (
                  <div
                    key={banner.id}
                    className={`min-w-0 flex-[0_0_100%] ${
                      banners.length > 1 ? "md:flex-[0_0_66.6667%]" : "md:flex-[0_0_100%]"
                    }`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} / ${banners.length}`}
                  >
                    <Link
                      href={href}
                      className={`relative block h-[58vw] min-h-[220px] max-h-[340px] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm transition-[opacity,transform] duration-700 ease-out md:h-[360px] md:max-h-none md:rounded-3xl lg:h-[430px] xl:h-[500px] ${
                        isActive
                          ? "scale-100 opacity-100"
                          : "scale-[0.965] opacity-70 hover:opacity-90"
                      }`}
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />

                      {isActive ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/20 md:to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-8 lg:p-12">
                            <div className="max-w-3xl transition-all delay-150 duration-700 ease-out">
                              <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl lg:text-6xl">
                                {banner.title}
                              </h2>
                              {banner.subtitle && (
                                <p className="mt-2 line-clamp-2 text-base leading-relaxed text-white/85 md:mt-4 md:text-lg lg:text-xl">
                                  {banner.subtitle}
                                </p>
                              )}
                              {banner.ctaText && (
                                <span className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-bold text-black transition-colors hover:bg-white/90 md:mt-7 md:h-12 md:px-6 md:text-base">
                                  {banner.ctaText}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="이전 배너"
                className="absolute left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md transition hover:scale-105 hover:bg-white md:flex"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="다음 배너"
                className="absolute right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md transition hover:scale-105 hover:bg-white md:flex"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <div className="mt-4 flex justify-center gap-2">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => scrollTo(index)}
                    aria-label={`${index + 1}번 배너로 이동`}
                    aria-current={index === selectedIndex ? "true" : undefined}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-8 bg-neutral-900"
                        : "w-2.5 bg-neutral-300 hover:bg-neutral-500"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
