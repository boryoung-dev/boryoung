"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { HomeSection, CollectionItem } from "@/lib/home/types";

export function CollectionSection(props: Extract<HomeSection, { type: "collection" }> & { items: CollectionItem[] }) {
  if (!props.isVisible) return null;

  return <CollectionCarousel title={props.title} items={props.items} />;
}

function CollectionCarousel({ title, items }: { title: string; items: CollectionItem[] }) {
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
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition hover:bg-gray-300 disabled:opacity-30"
              aria-label="이전"
            >
              <span className="text-lg">‹</span>
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition hover:bg-gray-300 disabled:opacity-30"
              aria-label="다음"
            >
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 pb-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="relative min-w-0 flex-[0_0_280px] md:flex-[0_0_320px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer shadow-md"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {item.badges.map(b => (
                        <span key={b} className="text-[10px] font-bold px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/80 font-medium line-clamp-1">
                    {item.subTitle}
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
