"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

interface FeaturedItem {
  id: string;
  slug?: string;
  title: string;
  imageUrl: string;
  price: string;
  badges?: string[];
}

interface FeaturedTourCarouselProps {
  items: FeaturedItem[];
}

/** 추천 골프투어 4-카드 수평 캐러셀 */
export function FeaturedTourCarousel({ items }: FeaturedTourCarouselProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.slug ? `/tours/${item.slug}` : "/tours"}
            className="group relative flex-shrink-0 w-[260px] sm:w-[280px] md:w-[calc(25%-12px)] min-w-[260px] aspect-[4/3] rounded-2xl overflow-hidden bg-[color:var(--surface)] block"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {item.badges && item.badges.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {item.badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-medium px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-base md:text-lg font-semibold text-white tracking-tight mb-0.5 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
