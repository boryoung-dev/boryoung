import Link from "next/link";
import { MapPin, Calendar, Users } from "lucide-react";

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
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* 썸네일 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
          
          {/* 카테고리 배지 */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.category.name}
            </span>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
            {product.title}
          </h3>
          
          {product.subtitle && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {product.subtitle}
            </p>
          )}

          {/* 태그 */}
          {product.tagList && product.tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tagList.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-auto">
            {product.durationText && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{product.durationText}</span>
              </div>
            )}
          </div>

          {/* 가격 */}
          <div className="pt-4 border-t border-gray-100">
            {product.basePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {product.basePrice.toLocaleString()}원
                </span>
                <span className="text-sm text-gray-500">~</span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-600">
                가격 문의
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
