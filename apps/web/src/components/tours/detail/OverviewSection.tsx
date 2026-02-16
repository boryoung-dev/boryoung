"use client";

interface OverviewSectionProps {
  product: any;
}

// HTML 내 img 태그에 referrerPolicy 추가 (Naver 이미지 핫링크 방지 우회)
function addReferrerPolicy(html: string): string {
  return html.replace(/<img\s/g, '<img referrerPolicy="no-referrer" ');
}

export function OverviewSection({ product }: OverviewSectionProps) {
  return (
    <div className="bg-white rounded-[32px] p-8">
      <h2 className="text-2xl font-bold text-[#18181B] mb-6">상품 소개</h2>

      {product.excerpt && (
        <p className="text-base text-[#71717A] leading-[1.6] mb-6">
          {product.excerpt}
        </p>
      )}

      {(product.content || product.contentHtml) && (
        <div className="prose prose-gray max-w-none">
          {product.contentHtml ? (
            <div
              className="text-base text-[#71717A] leading-[1.6]"
              dangerouslySetInnerHTML={{ __html: addReferrerPolicy(product.contentHtml) }}
            />
          ) : (
            <p className="text-base text-[#71717A] leading-[1.6] whitespace-pre-wrap">
              {product.content}
            </p>
          )}
        </div>
      )}

      {/* 태그 */}
      {product.tagList && product.tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[#F4F4F5]">
          {product.tagList.map((tag: any) => (
            <span
              key={tag.id}
              className="bg-[#F4F4F5] text-[#71717A] text-sm px-4 py-2 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
