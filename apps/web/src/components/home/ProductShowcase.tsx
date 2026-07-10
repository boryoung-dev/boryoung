"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface ShowcaseProduct {
  slug: string;
  title: string;
  imageUrl: string;
  destination: string;
  duration: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

interface ProductShowcaseProps {
  title: string;
  products: ShowcaseProduct[];
  tabs?: string[];
  showMoreHref?: string;
  bare?: boolean;
  headingSlot?: React.ReactNode;
}

export function ProductShowcase({
  title,
  products,
  tabs,
  showMoreHref,
  bare = false,
  headingSlot,
}: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState("전체");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const filtered =
    activeTab === "전체"
      ? products
      : products.filter((product) => product.destination.includes(activeTab));

  const defaultHeading = (
    <div className="mb-7 flex items-center justify-between gap-4">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className="shrink-0 text-base font-semibold text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)] md:text-lg"
        >
          전체 보기
        </Link>
      )}
    </div>
  );

  const content = (
    <>
      {headingSlot !== undefined ? headingSlot : defaultHeading}

      {tabs && (
        <div className="mb-7 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-5 py-2.5 text-base font-semibold transition-all md:text-lg ${
                activeTab === tab
                  ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-white"
                  : "border-[color:var(--border)] bg-white text-[color:var(--fg)] hover:border-[color:var(--fg)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="relative group/carousel">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {filtered.map((product) => {
              const discount = product.originalPrice
                ? Math.round((1 - product.basePrice / product.originalPrice) * 100)
                : 0;

              return (
                <Link
                  key={product.slug}
                  href={`/tours/${product.slug}`}
                  className="group/card w-[320px] flex-shrink-0 sm:w-[360px]"
                >
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
                      />
                    )}
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded bg-red-500 px-3 py-1.5 text-sm font-bold text-white">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="text-base text-[color:var(--muted)]">
                        {product.destination}
                      </span>
                      <span className="text-[color:var(--border)]">·</span>
                      <span className="text-base text-[color:var(--muted)]">
                        {product.duration}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-[color:var(--fg)] line-clamp-1 transition-colors group-hover/card:text-[color:var(--brand)]">
                      {product.title}
                    </h3>
                    <div className="mb-2.5 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-base font-semibold text-[color:var(--fg)]">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-base text-[color:var(--muted)]">
                        {product.reviewCount.toLocaleString()}명 평가
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      {discount > 0 && (
                        <span className="text-lg font-bold text-red-500">
                          {discount}%
                        </span>
                      )}
                      <span className="text-2xl font-bold text-[color:var(--fg)]">
                        {product.basePrice.toLocaleString()}원
                      </span>
                      {product.originalPrice && (
                        <span className="text-base text-[color:var(--muted)] line-through">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-0 top-[130px] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--muted)] opacity-0 shadow-lg transition hover:text-[color:var(--fg)] group-hover/carousel:opacity-100"
          aria-label="이전"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-0 top-[130px] flex h-12 w-12 translate-x-1/2 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--muted)] opacity-0 shadow-lg transition hover:text-[color:var(--fg)] group-hover/carousel:opacity-100"
          aria-label="다음"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </>
  );

  if (bare) return <>{content}</>;

  return (
    <section className="py-11 md:py-16">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">{content}</div>
    </section>
  );
}
