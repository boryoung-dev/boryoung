import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductOverlapGridConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 카드가 일부 겹치게 배치, 호버 시 떠오름 (CSS만) */
export function ProductOverlapGrid({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductOverlapGridConfig;
  const style = cfg.style || {};
  const columns = (cfg.columns || 4) as 3 | 4;
  const products = curation.products.slice(0, 6);

  if (products.length === 0) return null;

  const isLight = style.textTheme === "light";

  // 컬럼 별 grid template 정의
  const gridCols = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-10">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}

      <div className={`grid grid-cols-2 ${gridCols} gap-0`}>
        {products.map((p, i) => {
          // 짝수 카드는 위로, 홀수 카드는 아래로 살짝 어긋남
          const offsetY = i % 2 === 0 ? "translate-y-0" : "md:translate-y-6";
          // 좌우 살짝 겹침 (첫/마지막 제외)
          const offsetX =
            i === 0
              ? "translate-x-0"
              : i === products.length - 1
                ? "-translate-x-0"
                : "md:-translate-x-2";
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className={`group relative ${offsetY} ${offsetX} hover:z-10 hover:-translate-y-2 transition-all duration-300`}
              style={{ zIndex: products.length - i }}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)] shadow-lg group-hover:shadow-2xl transition-shadow ring-2 ring-white">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  {p.destination && (
                    <p className="text-[11px] opacity-80">{p.destination}</p>
                  )}
                  <h3 className="text-sm font-semibold line-clamp-1 mt-0.5">
                    {p.title}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    {p.basePrice ? `${p.basePrice.toLocaleString()}원~` : "가격 문의"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* isLight 분기는 헤딩 측에서만 의미가 있어 카드 위는 항상 어두운 오버레이 사용 */}
      <span className="hidden">{isLight ? "" : ""}</span>
    </SectionContainer>
  );
}
