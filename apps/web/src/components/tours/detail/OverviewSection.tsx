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
    <div className="mt-8">
      {/* 상품 소개 */}
      {product.excerpt && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">상품 소개</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            {product.excerpt}
          </p>
        </div>
      )}

      {product.content && (
        <div className="prose prose-gray max-w-none">
          {product.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: addReferrerPolicy(product.contentHtml) }} />
          ) : (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.content}
            </p>
          )}
        </div>
      )}

      {/* 태그 */}
      {product.tagList && product.tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {product.tagList.map((tag: any) => (
            <span
              key={tag.id}
              className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
