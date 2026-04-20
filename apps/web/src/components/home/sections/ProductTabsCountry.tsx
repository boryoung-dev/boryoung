"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductTabsCountryConfig } from "./_shared/types";
import type { CurationSection, CurationProductDTO } from "@/lib/home/curations";

const COL_MAP: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** 국가/지역 탭 + 상품 그리드 (탭으로 destination 필터) */
export function ProductTabsCountry({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductTabsCountryConfig;
  const style = cfg.style || {};
  const tabs = cfg.tabs && cfg.tabs.length > 0 ? cfg.tabs : ["전체"];
  const columns = (cfg.columns || 3) as 2 | 3 | 4;
  const products = curation.products;
  const [activeTab, setActiveTab] = useState(0);

  const filtered = useMemo<CurationProductDTO[]>(() => {
    const t = tabs[activeTab] ?? "";
    if (!t || t === "전체") return products;
    return products.filter((p) => (p.destination || "").includes(t));
  }, [products, tabs, activeTab]);

  if (products.length === 0) return null;

  const isLight = style.textTheme === "light";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-6">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}

      {/* 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={`${tab}-${i}`}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? isLight
                    ? "bg-white text-black border-white"
                    : "bg-[color:var(--fg,#1d1d1f)] text-white border-[color:var(--fg,#1d1d1f)]"
                  : isLight
                    ? "bg-transparent text-white border-white/30 hover:bg-white/10"
                    : "bg-white text-[color:var(--fg,#1d1d1f)] border-[color:var(--border,#d2d2d7)] hover:bg-[color:var(--surface,#f5f5f7)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <p
          className={`text-center py-12 text-sm ${
            isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"
          }`}
        >
          해당 탭에 상품이 없습니다
        </p>
      ) : (
        <div className={`grid grid-cols-1 ${COL_MAP[columns]} gap-5`}>
          {filtered.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)] mb-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                ) : null}
                {p.badge && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[11px] font-bold rounded">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? "text-white/70" : "text-[color:var(--muted,#86868b)]"}`}>
                {p.destination}
                {p.duration ? ` · ${p.duration}` : ""}
              </p>
              <h3
                className={`text-base font-semibold line-clamp-2 mt-1 ${
                  isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                }`}
              >
                {p.title}
              </h3>
              <p
                className={`text-base font-bold mt-2 ${
                  isLight ? "text-white" : "text-[color:var(--fg,#1d1d1f)]"
                }`}
              >
                {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
