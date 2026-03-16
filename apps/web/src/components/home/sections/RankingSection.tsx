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
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">{title}</h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/tours/${item.slug}` : `/tours`}
                className="group relative flex flex-col gap-3 min-w-0 flex-[0_0_40%] sm:flex-[0_0_28%] md:flex-[0_0_22%]"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[color:var(--surface)]">
                  <span className="absolute top-0 left-0 bg-black text-white w-7 h-7 flex items-center justify-center font-bold text-sm z-10 rounded-br-lg">
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
                    <div className="flex gap-1 flex-wrap">
                      {item.badges.map(badge => (
                        <span key={badge} className="text-[10px] px-1.5 py-0.5 bg-[color:var(--surface)] text-[color:var(--muted)] rounded font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-[color:var(--fg)] line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-bold text-base text-[color:var(--brand)]">
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
