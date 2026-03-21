"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedItem {
  id: string;
  slug?: string;
  title: string;
  imageUrl: string;
  price: string;
  badges?: string[];
}

interface FeaturedTourCarouselProps {
  items: FeaturedItem[];
}

/** 추천 골프투어 2행 3열 캐러셀 */
export function FeaturedTourCarousel({ items }: FeaturedTourCarouselProps) {
  const perPage = 6; // 2행 x 3열
  const totalPages = Math.ceil(items.length / perPage);
  const [page, setPage] = useState(0);

  const currentItems = items.slice(page * perPage, (page + 1) * perPage);

  return (
    <div>
      {/* 2행 3열 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <Link
            key={item.id}
            href={item.slug ? `/tours/${item.slug}` : "/tours"}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[color:var(--surface)] block"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {item.badges && item.badges.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {item.badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-medium px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-base md:text-lg font-semibold text-white tracking-tight mb-0.5 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--surface)] transition disabled:opacity-30"
            aria-label="이전"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === page ? "bg-[color:var(--fg)] w-5" : "bg-[color:var(--border)]"
                }`}
                aria-label={`${i + 1}페이지`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--surface)] transition disabled:opacity-30"
            aria-label="다음"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
