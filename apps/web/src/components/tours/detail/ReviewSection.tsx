"use client";

import { Star } from "lucide-react";

interface ReviewSectionProps {
  reviews: any[];
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

  // 별점 분포 계산
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percentage:
      (reviews.filter((r: any) => r.rating === star).length / reviews.length) *
      100,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-6">여행 후기</h2>

      {/* 별점 통계 */}
      <div className="bg-[color:var(--surface)] rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-8">
          {/* 평균 별점 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-[color:var(--fg)]">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avgRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-[color:var(--muted)] mt-1">
              {reviews.length}개 리뷰
            </div>
          </div>

          {/* 분포 바 */}
          <div className="flex-1 space-y-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-sm text-[color:var(--muted)] w-4">{d.star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-[color:var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-[color:var(--muted)] w-8">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-6">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="border-b border-[color:var(--border)] pb-6 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-10 h-10 bg-[color:var(--surface)] rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[color:var(--muted)]">
                    {review.authorName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[color:var(--fg)]">
                      {review.authorName}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-[color:var(--brand)]/10 text-[color:var(--brand)] px-2 py-0.5 rounded-full">
                        인증
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.travelDate && (
                <span className="text-sm text-[color:var(--muted)]">
                  {new Date(review.travelDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {review.title && (
              <h4 className="font-medium text-[color:var(--fg)] mb-1">{review.title}</h4>
            )}
            <p className="text-[color:var(--muted)] text-sm leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
