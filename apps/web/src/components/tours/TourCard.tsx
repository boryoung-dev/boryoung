import Link from 'next/link';
import Image from 'next/image';
import type { TourProductListItem } from '@/types/products';

interface TourCardProps {
  product: TourProductListItem;
}

export function TourCard({ product }: TourCardProps) {
  return (
    <Link
      href={`/tours/${product.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-[color:var(--border)]"
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface-3)]">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)]">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* 목적지 태그 */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[color:var(--fg)] backdrop-blur-sm">
            {product.destination}
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[color:var(--fg)] mb-2 line-clamp-2 group-hover:text-[color:var(--brand)] transition-colors">
          {product.title}
        </h3>

        {product.durationText && (
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)] mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{product.durationText}</span>
          </div>
        )}

        <p className="text-sm text-[color:var(--muted)] mb-4 line-clamp-2">
          {product.excerpt}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[color:var(--border)]">
          <div className="text-right">
            <div className="text-xs text-[color:var(--muted)] mb-1">여행 경비</div>
            <div className="text-xl font-bold text-[color:var(--brand)]">
              {product.basePrice ? `${product.basePrice.toLocaleString()}원` : '가격 문의'}
            </div>
          </div>

          <div className="flex items-center text-[color:var(--brand)] group-hover:translate-x-1 transition-transform">
            <span className="text-sm font-medium mr-1">자세히 보기</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
