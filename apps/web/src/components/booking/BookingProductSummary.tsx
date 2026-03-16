"use client";

import { Calendar, MapPin } from "lucide-react";

interface BookingProductSummaryProps {
  product: any;
}

export function BookingProductSummary({ product }: BookingProductSummaryProps) {
  const thumbnail =
    product.images?.find((img: any) => img.isThumbnail)?.url ||
    product.images?.[0]?.url;

  return (
    <div className="flex gap-4 p-4 bg-[color:var(--surface)] rounded-xl">
      {thumbnail && (
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={thumbnail}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[color:var(--brand)] font-medium mb-1">
          {product.category?.name}
        </div>
        <h3 className="text-sm font-bold text-[color:var(--fg)] line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-[color:var(--muted)]">
          {product.durationText && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {product.durationText}
            </span>
          )}
          {product.destination && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {product.destination}
            </span>
          )}
        </div>
        {product.basePrice && (
          <div className="mt-1.5 text-sm font-bold text-[color:var(--brand)]">
            {product.basePrice.toLocaleString()}원~
          </div>
        )}
      </div>
    </div>
  );
}
