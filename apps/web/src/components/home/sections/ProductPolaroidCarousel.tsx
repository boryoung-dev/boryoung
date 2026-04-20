import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductPolaroidCarouselConfig } from "./_shared/types";
import type { CurationSection } from "@/lib/home/curations";

/** 폴라로이드 스타일 가로 캐러셀 (살짝 회전) */
export function ProductPolaroidCarousel({
  curation,
}: {
  curation: CurationSection;
}) {
  const cfg = (curation.displayConfig || {}) as ProductPolaroidCarouselConfig;
  const style = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

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

      <div
        className="flex gap-6 overflow-x-auto pb-6 pt-4"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p, i) => {
          const rotate = i % 2 === 0 ? "-2deg" : "2deg";
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/tours/${p.slug}`}
              className="flex-shrink-0 group"
              style={{ transform: `rotate(${rotate})` }}
            >
              <div className="bg-white p-3 pb-5 shadow-xl rounded-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-[220px] aspect-square overflow-hidden bg-[color:var(--surface,#f5f5f7)]">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="mt-3 px-1 text-center">
                  <h3
                    className="font-serif italic text-base text-gray-800 line-clamp-1"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-serif italic">
                    {p.destination}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionContainer>
  );
}
