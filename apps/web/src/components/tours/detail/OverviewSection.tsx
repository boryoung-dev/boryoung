"use client";

import { sanitizeHtml } from "@/lib/sanitize";
import type { TourProductDetail, Tag } from "@/lib/types";

interface OverviewSectionProps {
  product: TourProductDetail;
}

export function OverviewSection({ product }: OverviewSectionProps) {
  return (
    <div className="bg-white rounded-[32px] p-8">
      <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">상품 소개</h2>

      {product.excerpt && (
        <p className="text-base text-[color:var(--muted)] leading-[1.6] mb-6">
          {product.excerpt}
        </p>
      )}

      {(product.content || product.contentHtml) && (
        <div className="prose prose-gray max-w-none">
          {product.contentHtml ? (
            <div
              className="text-base text-[color:var(--muted)] leading-[1.6]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.contentHtml) }}
            />
          ) : (
            <p className="text-base text-[color:var(--muted)] leading-[1.6] whitespace-pre-wrap">
              {product.content}
            </p>
          )}
        </div>
      )}

      {/* 태그 */}
      {product.tagList && product.tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[color:var(--border)]">
          {product.tagList.map((tag: Tag) => (
            <span
              key={tag.id}
              className="bg-[color:var(--surface)] text-[color:var(--muted)] text-sm px-4 py-2 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
