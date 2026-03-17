"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { HomeSection, CollectionItem } from "@/lib/home/types";

export function CollectionSection(props: Extract<HomeSection, { type: "collection" }> & { items: CollectionItem[] }) {
  if (!props.isVisible) return null;

  return <CollectionCarousel title={props.title} items={props.items} />;
}

function CollectionCarousel({ title, items }: { title: string; items: CollectionItem[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <section className="py-8 md:py-10 bg-[color:var(--surface)]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">{title}</h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pb-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="relative min-w-0 flex-[0_0_240px] sm:flex-[0_0_260px] md:flex-[0_0_280px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {item.badges.map(b => (
                        <span key={b} className="text-[10px] font-semibold px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-base font-semibold leading-tight mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-white/60 line-clamp-1">
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
