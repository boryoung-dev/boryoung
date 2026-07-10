"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface MainBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  ctaText?: string | null;
}

const getWrappedIndex = (index: number, length: number) =>
  ((index % length) + length) % length;

export function MainBannerCarousel({ banners }: { banners: MainBanner[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const visibleBanners = useMemo(() => {
    if (banners.length === 0) return [];
    const current = getWrappedIndex(selectedIndex, banners.length);
    return [
      banners[getWrappedIndex(current - 1, banners.length)],
      banners[current],
      banners[getWrappedIndex(current + 1, banners.length)],
    ];
  }, [banners, selectedIndex]);

  const scrollPrev = useCallback(() => {
    setDirection("prev");
    setSelectedIndex((current) => getWrappedIndex(current - 1, banners.length));
  }, [banners.length]);

  const scrollNext = useCallback(() => {
    setDirection("next");
    setSelectedIndex((current) => getWrappedIndex(current + 1, banners.length));
  }, [banners.length]);

  const scrollTo = useCallback(
    (index: number) => {
      setDirection(index >= selectedIndex ? "next" : "prev");
      setSelectedIndex(index);
    },
    [selectedIndex],
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(scrollNext, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length, scrollNext]);

  if (banners.length === 0) return null;

  const activeBanner = banners[getWrappedIndex(selectedIndex, banners.length)];
  const activeHref = activeBanner.linkUrl || "/tours";

  return (
    <section className="bg-white py-4 sm:py-5 md:py-8">
      <div className="w-full px-3 sm:px-5 md:px-8">
        <div className="group relative mx-auto max-w-[1920px]">
          <div className="md:hidden">
            <Link
              key={activeBanner.id}
              href={activeHref}
              className={`main-banner-card main-banner-${direction} relative block h-[58vw] min-h-[220px] max-h-[340px] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm`}
            >
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div
                className={`main-banner-copy main-banner-copy-${direction} absolute inset-x-0 bottom-0 p-5 text-white`}
              >
                <h2 className="text-2xl font-bold leading-tight tracking-tight">
                  {activeBanner.title}
                </h2>
                {activeBanner.subtitle && (
                  <p className="mt-2 line-clamp-2 text-base leading-relaxed text-white/85">
                    {activeBanner.subtitle}
                  </p>
                )}
                {activeBanner.ctaText && (
                  <span className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-bold text-black">
                    {activeBanner.ctaText}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div
            className={`hidden h-[360px] gap-4 md:grid lg:h-[430px] lg:gap-5 xl:h-[500px] ${
              banners.length > 1 ? "grid-cols-[2fr_8fr_2fr]" : "grid-cols-1"
            }`}
          >
            {(banners.length > 1 ? visibleBanners : [activeBanner]).map(
              (banner, position) => {
                const isActive = banners.length === 1 || position === 1;
                const href = banner.linkUrl || "/tours";

                return (
                  <Link
                    key={`${banner.id}-${position}`}
                    href={href}
                    className={`main-banner-card ${
                      isActive ? `main-banner-${direction}` : "main-banner-side"
                    } relative block h-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm transition-all duration-500 ease-out ${
                      isActive
                        ? "opacity-100"
                        : "opacity-75 hover:opacity-95"
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
                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
                        <div
                          className={`main-banner-copy main-banner-copy-${direction} absolute inset-x-0 bottom-0 p-8 text-white lg:p-12`}
                        >
                          <div className="max-w-3xl">
                            <h2 className="text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
                              {banner.title}
                            </h2>
                            {banner.subtitle && (
                              <p className="mt-4 line-clamp-2 text-lg leading-relaxed text-white/85 lg:text-xl">
                                {banner.subtitle}
                              </p>
                            )}
                            {banner.ctaText && (
                              <span className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-6 text-base font-bold text-black transition-colors hover:bg-white/90">
                                {banner.ctaText}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-black/5" />
                    )}
                  </Link>
                );
              },
            )}
          </div>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="이전 배너"
                className="absolute left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md transition hover:bg-white md:flex"
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
                className="absolute right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md transition hover:bg-white md:flex"
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
                    className={`h-2.5 rounded-full transition-all ${
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
