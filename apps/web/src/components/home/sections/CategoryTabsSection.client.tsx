"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { HomeTab, HomeTabKey, ProductCardDTO } from "@/lib/home/types";
import { cn } from "@repo/ui";
import { ProductCard } from "../ProductCard";

export function CategoryTabsSection(props: {
  title: string;
  tabs: HomeTab[];
  productsByTab: Record<HomeTabKey, ProductCardDTO[]>;
}) {
  const tabItems = useMemo(
    () => props.tabs.filter((tab) => (props.productsByTab[tab.key] ?? []).length > 0),
    [props.tabs, props.productsByTab]
  );

  const [active, setActive] = useState<HomeTabKey>(() => {
    return tabItems[0]?.key ?? props.tabs[0]?.key ?? "JAPAN";
  });

  const products = props.productsByTab[active] ?? [];

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

  // 탭 변경 시 캐러셀 처음으로
  useEffect(() => {
    emblaApi?.scrollTo(0, true);
  }, [active, emblaApi]);

  return (
    <section className="bg-[#111113] py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {props.title}
            </h2>
          </div>

          <div className="-mx-2 overflow-x-auto px-2 scrollbar-hide">
            <div className="inline-flex items-center gap-2">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition",
                    active === tab.key
                      ? "bg-white text-[#111113]"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-black/30 py-10">
          <div className="mb-6 flex items-center justify-between px-6">
            <div className="text-sm font-semibold tracking-tight text-white/90">
              {tabItems.find((t) => t.key === active)?.label}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15 disabled:opacity-30"
                aria-label="이전"
              >
                <span className="text-lg">‹</span>
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15 disabled:opacity-30"
                aria-label="다음"
              >
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden px-6" ref={emblaRef}>
            <div className="flex gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="min-w-0 flex-[0_0_80vw] sm:flex-[0_0_420px]"
                >
                  <ProductCard item={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
