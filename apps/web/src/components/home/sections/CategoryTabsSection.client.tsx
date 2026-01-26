"use client";

import { useMemo, useRef, useState } from "react";
import type { HomeTab, HomeTabKey, ProductCardDTO } from "@/lib/home/types";
import { cn } from "@repo/ui";
import { ProductCard } from "../ProductCard";

export function CategoryTabsSection(props: {
  title: string;
  tabs: HomeTab[];
  productsByTab: Record<HomeTabKey, ProductCardDTO[]>;
}) {
  const [active, setActive] = useState<HomeTabKey>(props.tabs[0]?.key ?? "JAPAN");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const products = props.productsByTab[active] ?? [];

  const tabItems = useMemo(() => props.tabs, [props.tabs]);

  function scrollByAmount(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 440, behavior: "smooth" });
  }

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
                onClick={() => scrollByAmount(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="이전"
              >
                <span className="text-lg">‹</span>
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15"
                aria-label="다음"
              >
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="w-[80vw] min-w-[80vw] snap-start sm:w-[420px] sm:min-w-[420px]"
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
