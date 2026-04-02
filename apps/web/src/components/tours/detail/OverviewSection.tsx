"use client";

import { sanitizeHtml } from "@/lib/sanitize";
import type { TourProductDetail, Tag } from "@/lib/types";
import { SectionRenderer } from "./SectionRenderer";
import type { ContentSection } from "@repo/database";

interface OverviewSectionProps {
  product: TourProductDetail;
}

export function OverviewSection({ product }: OverviewSectionProps) {
  const hasSections =
    Array.isArray(product.contentSections) && product.contentSections.length > 0;

  return (
    <div className="bg-white rounded-2xl p-8">
      <h2 className="text-lg font-semibold text-[color:var(--fg)] mb-6">상품 소개</h2>

      {product.excerpt && (
        <p className="text-base text-[color:var(--muted)] leading-[1.6] mb-6">
          {product.excerpt}
        </p>
      )}

      {/* 섹션 빌더 콘텐츠 */}
      {hasSections ? (
        <SectionRenderer sections={product.contentSections as ContentSection[]} />
      ) : (
        /* 기존 content/contentHtml 폴백 */
        (product.content || product.contentHtml) && (
          <div className="prose prose-gray max-w-none">
            {(() => {
              const html = product.contentHtml || product.content || "";
              if (html.includes("<")) {
                return (
                  <div
                    className="text-base text-[color:var(--muted)] leading-[1.6]"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
                  />
                );
              }
              return (
                <p className="text-base text-[color:var(--muted)] leading-[1.6] whitespace-pre-wrap">
                  {html}
                </p>
              );
            })()}
          </div>
        )
      )}

      {/* 태그 */}
      {product.tagList && product.tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[color:var(--border)]">
          {product.tagList.map((tag: Tag) => (
            <span
              key={tag.id}
              className="bg-[color:var(--surface)] text-[color:var(--muted)] text-[13px] px-3 py-1.5 rounded-lg"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
