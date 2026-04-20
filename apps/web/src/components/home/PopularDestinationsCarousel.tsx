"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

interface Destination {
  name: string;
  image: string;
}

interface PopularDestinationsCarouselProps {
  title: string;
  destinations: Destination[];
  href: string;
  /**
   * true일 경우 자체 `<section>`/max-width 래퍼 없이 콘텐츠만 렌더.
   * 외부(예: SectionContainer)에서 감쌀 때 사용.
   */
  bare?: boolean;
  /** bare=true일 때 헤딩 슬롯 대체 (없으면 기본 제목 렌더) */
  headingSlot?: React.ReactNode;
}

/** 인기 여행지 수평 캐러셀 컴포넌트 */
export function PopularDestinationsCarousel({
  title,
  destinations,
  href,
  bare = false,
  headingSlot,
}: PopularDestinationsCarouselProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const defaultHeading = (
    <div className="flex items-end justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <Link
        href={href}
        className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
      >
        전체 보기 →
      </Link>
    </div>
  );

  const content = (
    <>
      {headingSlot ?? defaultHeading}
      {/* 캐러셀 영역 */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/tours?destination=${encodeURIComponent(dest.name)}`}
              className="group flex-shrink-0 w-[140px] sm:w-[160px] md:w-[176px]"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-[color:var(--surface)] mb-2">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                />
              </div>
              <p className="text-sm font-medium text-center text-[color:var(--fg)]">
                {dest.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  if (bare) return <>{content}</>;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">{content}</div>
    </section>
  );
}
