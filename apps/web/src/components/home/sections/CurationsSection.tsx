"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { PlusButton } from "@/components/common/PlusButton";

export function CurationsSection(props: {
  title: string;
  items: { id: string; title: string; description: string; imageUrl?: string; linkUrl?: string }[];
}) {
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
    <section className="bg-[color:var(--surface)] py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--fg)]">{props.title}</h2>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
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
            <Link href="/tours" className="text-[15px] font-medium text-[color:var(--brand)] cursor-pointer hover:underline transition-all">
              전체 컬렉션 보기
            </Link>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 pb-10 pt-4">
            {props.items.map((it, idx) => (
              <Link
                href={it.linkUrl || "/tours"}
                key={it.id}
                className="group relative flex h-[480px] min-w-0 flex-[0_0_320px] sm:flex-[0_0_380px] cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.01]"
              >
                {it.imageUrl ? (
                  <>
                    <img
                      src={it.imageUrl}
                      alt={it.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 transition-transform duration-700 group-hover:scale-110 opacity-30
                          ${idx === 0 ? 'bg-[radial-gradient(circle_at_top_right,#f97316_0%,transparent_60%)]' : ''}
                          ${idx === 1 ? 'bg-[radial-gradient(circle_at_top_right,#0f766e_0%,transparent_60%)]' : ''}
                          ${idx === 2 ? 'bg-[radial-gradient(circle_at_top_right,#3b82f6_0%,transparent_60%)]' : ''}
                          ${idx === 3 ? 'bg-[radial-gradient(circle_at_top_right,#ef4444_0%,transparent_60%)]' : ''}
                      `}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/90" />
                  </>
                )}

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${it.imageUrl ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                      COLLECTION 0{idx + 1}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className={`text-3xl font-bold leading-tight tracking-tight break-keep ${it.imageUrl ? 'text-white' : 'text-[color:var(--fg)]'}`}>
                      {it.title}
                    </h3>
                    <p className={`mt-4 text-[15px] font-medium line-clamp-2 leading-relaxed ${it.imageUrl ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                      {it.description}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 z-20">
                  <PlusButton label="자세히 보기" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
