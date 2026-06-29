"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { HomeSection, RankingItem } from "@/lib/home/types";

export function RankingSection(props: Extract<HomeSection, { type: "ranking" }> & { items: RankingItem[] }) {
  if (!props.isVisible) return null;

  return <RankingCarousel title={props.title} items={props.items} />;
}

function RankingCarousel({ title, items }: { title: string; items: RankingItem[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-7">{title}</h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="group relative flex flex-col gap-3 min-w-0 flex-[0_0_62%] sm:flex-[0_0_40%] md:flex-[0_0_28%] xl:flex-[0_0_22%]"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[color:var(--surface)]">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[color:var(--fg)] w-6 h-6 flex items-center justify-center font-semibold text-xs z-10 rounded-full shadow-sm">
                    {item.rank}
                  </span>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {item.badges.map(badge => (
                        <span key={badge} className="text-xs px-2 py-1 bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--muted)] rounded font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-base md:text-lg font-medium text-[color:var(--fg)] line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-lg font-semibold text-[color:var(--fg)]">
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
