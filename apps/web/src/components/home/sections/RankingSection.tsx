"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { HomeSection, RankingItem } from "@/lib/home/types";

export function RankingSection(props: Extract<HomeSection, { type: "ranking" }> & { items: RankingItem[] }) {
  if (!props.isVisible) return null;

  return <RankingCarousel title={props.title} items={props.items} />;
}

function RankingCarousel({ title, items }: { title: string; items: RankingItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-30"
              aria-label="이전"
            >
              <span className="text-lg">‹</span>
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-30"
              aria-label="다음"
            >
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="group relative flex flex-col gap-3 min-w-0 flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_22%]"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                  <span className="absolute top-0 left-0 bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg z-10 rounded-br-xl">
                    {item.rank}
                  </span>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 flex-wrap">
                    {item.badges?.map(badge => (
                      <span key={badge} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-bold text-lg text-[color:var(--brand)]">
                    {item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
