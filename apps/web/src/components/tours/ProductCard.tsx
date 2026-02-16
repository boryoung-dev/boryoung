import Link from "next/link";
import { Calendar } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  durationText?: string;
  basePrice?: number;
  category: {
    name: string;
  };
  tagList: Array<{ name: string; slug: string }>;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/tours/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-[color:var(--border)]">
        {/* 썸네일 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface)]">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)]">
              이미지 없음
            </div>
          )}

          {/* 이미지 하단 그래디언트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* 카테고리 배지 (글래스 효과) */}
          <div className="absolute top-3 left-3">
            <span className="backdrop-blur-sm bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.category.name}
            </span>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-[color:var(--fg)] mb-1 line-clamp-2 group-hover:text-[color:var(--brand)] transition-colors duration-300">
            {product.title}
          </h3>

          {product.subtitle && (
            <p className="text-sm text-[color:var(--muted)] mb-3 line-clamp-1">
              {product.subtitle}
            </p>
          )}

          {/* 태그 */}
          {product.tagList && product.tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tagList.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="text-xs bg-[color:var(--surface)] text-[color:var(--muted)] px-2 py-0.5 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 정보 (목적지 + 기간 나란히) */}
          <div className="flex items-center gap-4 text-sm text-[color:var(--muted)] mb-4 mt-auto">
            {product.durationText && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{product.durationText}</span>
              </div>
            )}
          </div>

          {/* 가격 */}
          <div className="pt-4 border-t border-[color:var(--border)]">
            {product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[color:var(--brand)]">
                  {product.basePrice.toLocaleString()}원
                </span>
                <span className="text-sm text-[color:var(--muted)]">~</span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-[color:var(--muted)]">
                가격 문의
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
