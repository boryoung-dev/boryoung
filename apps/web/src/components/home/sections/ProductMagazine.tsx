import Link from "next/link";
import { SectionContainer } from "./_shared/SectionContainer";
import { SectionHeading } from "./_shared/SectionHeading";
import type { ProductMagazineConfig, SectionStyleConfig } from "./_shared/types";
import type { CurationSection, CurationProductDTO } from "@/lib/home/curations";

/** 매거진 카드 — 좌측 큰 메인 + 우측 4개 서브 */
function MagazineCard({
  product,
  large,
  textTheme,
}: {
  product: CurationProductDTO;
  large?: boolean;
  textTheme?: "light" | "dark";
}) {
  return (
    <Link
      href={`/tours/${product.slug}`}
      className="group block relative rounded-2xl overflow-hidden bg-[color:var(--surface,#f5f5f7)]"
    >
      <div className={`relative w-full h-full ${large ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      </div>
      <div className={`absolute bottom-0 left-0 right-0 ${large ? "p-6" : "p-4"} text-white`}>
        {product.destination && (
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full mb-2">
            {product.destination}
          </span>
        )}
        <h3
          className={`font-semibold line-clamp-2 ${large ? "text-2xl md:text-3xl" : "text-sm"}`}
        >
          {product.title}
        </h3>
        {product.basePrice ? (
          <p className={`mt-1 ${large ? "text-base" : "text-xs"} text-white/80`}>
            {product.basePrice.toLocaleString()}원~
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** 매거진 레이아웃 — 좌측 큰 1개 + 우측 2x2 그리드 */
export function ProductMagazine({ curation }: { curation: CurationSection }) {
  const cfg = (curation.displayConfig || {}) as ProductMagazineConfig;
  const style: SectionStyleConfig = cfg.style || {};
  const products = curation.products;

  if (products.length === 0) return null;

  const main = products[0];
  const subs = products.slice(1, 5);

  return (
    <SectionContainer style={style}>
      {(curation.title || curation.subtitle || curation.description) && (
        <div className="mb-8">
          <SectionHeading
            eyebrow={curation.subtitle}
            title={curation.title}
            description={curation.description}
            style={style}
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 좌측 메인 */}
        <MagazineCard product={main} large textTheme={style.textTheme} />
        {/* 우측 2x2 (또는 있는 만큼) */}
        {subs.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {subs.map((p, i) => (
              <MagazineCard key={`${p.slug}-${i}`} product={p} textTheme={style.textTheme} />
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
