"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import type { ProductCardDTO } from "@/lib/home/types";
import { ProductCard } from "../ProductCard";

interface CountrySectionProps {
  title: string;
  subtitle?: string;
  tabKey: string;
  products: ProductCardDTO[];
  bgColor?: string;
}

export function CountrySection({ title, subtitle, tabKey, products, bgColor = "bg-white" }: CountrySectionProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  if (products.length === 0) return null;

  return (
    <section className={`py-8 md:py-10 ${bgColor}`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[color:var(--fg)] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] text-[color:var(--muted)] mt-1">{subtitle}</p>
            )}
          </div>
          <Link
            href={`/tours?category=${tabKey.toLowerCase()}`}
            className="text-[13px] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors pb-0.5"
          >
            전체 보기 →
          </Link>
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
