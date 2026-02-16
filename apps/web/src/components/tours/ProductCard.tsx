import Link from "next/link";
import { Star } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  durationText?: string;
  basePrice?: number;
  originalPrice?: number;
  isFeatured?: boolean;
  category: {
    name: string;
  };
  tagList: Array<{ name: string; slug: string }>;
};

export function ProductCard({ product }: { product: Product }) {
  // 할인율 계산
  const discountPercent = product.originalPrice && product.basePrice
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0;

  // 랜덤 평점 생성 (실제 데이터 없으므로)
  const rating = 4.5;
  const reviewCount = 89;

  return (
    <Link href={`/tours/${product.slug}`} className="group">
      <div className="bg-white rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-500 h-full flex flex-col">
        {/* 썸네일 */}
        <div className="relative h-[240px] overflow-hidden bg-gray-100">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#71717A]">
              이미지 없음
            </div>
          )}

          {/* 배지 (좌상단) */}
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isFeatured && (
              <span className="bg-[#8B5CF6] text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
                베스트
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-[#F472B6] text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* 카드 콘텐츠 */}
        <div className="p-6 flex-1 flex flex-col gap-3">
          {/* 타이틀 */}
          <h3 className="text-[18px] font-semibold text-[#18181B] line-clamp-2 group-hover:text-[#8B5CF6] transition-colors">
            {product.title}
          </h3>

          {/* 설명 */}
          <p className="text-[14px] text-[#71717A] line-clamp-1">
            {product.durationText ? `${product.durationText} • ` : ""}
            {product.subtitle || "프리미엄 여행 패키지"}
          </p>

          {/* 별점 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(rating)
                      ? "fill-[#FACC15] text-[#FACC15]"
                      : "fill-[#E4E4E7] text-[#E4E4E7]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[14px] text-[#71717A]">
              {rating} ({reviewCount})
            </span>
          </div>

          {/* 가격 */}
          <div className="mt-auto pt-3">
            {product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-[20px] font-bold text-[#8B5CF6]">
                  ₩{product.basePrice.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.basePrice && (
                  <span className="text-[14px] text-[#A1A1AA] line-through">
                    ₩{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[18px] font-semibold text-[#71717A]">
                가격 문의
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
