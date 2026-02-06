import Link from "next/link";
import type { ProductCardDTO } from "@/lib/home/types";
import { Badge } from "@repo/ui";

export function ProductCard({ item }: { item: ProductCardDTO }) {
  const href = item.slug ? `/tours/${item.slug}` : `/tours`;
  
  return (
    <Link href={href} className="block">
      <article className="group relative isolate overflow-hidden rounded-[28px] bg-[#0b0b0c] shadow-[0_20px_50px_rgba(0,0,0,0.25)] cursor-pointer">
      <div className="relative aspect-[4/5] w-full">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#111113]">
            <span className="text-sm font-medium text-white/20">Image</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />

        <div className="absolute left-5 top-5 flex items-center gap-2">
          {item.badge ? (
            <Badge
              variant={
                item.badge === "NEW" ? "new" : item.badge === "BEST" ? "best" : "neutral"
              }
              className="rounded-full px-2.5 py-1"
            >
              {item.badge}
            </Badge>
          ) : null}
          {item.duration ? (
            <span className="inline-flex items-center rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {item.duration}
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="line-clamp-2 text-[22px] font-semibold leading-tight tracking-tight text-white">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-[13px] font-medium text-white/70">
            {item.highlight1}
            {item.highlight2 ? ` · ${item.highlight2}` : ""}
          </p>
          {item.priceText ? (
            <div className="mt-4 text-[15px] font-semibold text-white">
              {item.priceText}
            </div>
          ) : null}
        </div>
      </div>
    </article>
    </Link>
  );
}
