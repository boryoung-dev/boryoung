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

  // 탭 변경 시 캐러셀 처음으로
  useEffect(() => {
    emblaApi?.scrollTo(0, true);
  }, [active, emblaApi]);

  return (
    <section className="bg-[#111113] py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {props.title}
          </h2>

          <div className="-mx-2 overflow-x-auto px-2 scrollbar-hide">
            <div className="inline-flex items-center gap-1.5">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                    active === tab.key
                      ? "bg-white text-[#111113]"
                      : "text-white/60 hover:text-white/90 hover:bg-white/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="min-w-0 flex-[0_0_72vw] sm:flex-[0_0_260px] md:flex-[0_0_280px]"
              >
                <ProductCard item={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
