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
    <div className="space-y-6">
      {/* 별점 통계 */}
      <div className="bg-white rounded-[32px] p-8">
        <h2 className="text-2xl font-bold text-[#18181B] mb-6">후기 요약</h2>
        <div className="flex items-start gap-8">
          {/* 평균 별점 */}
          <div className="text-center">
            <div className="text-5xl font-bold text-[#18181B]">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(avgRating)
                      ? "fill-[#FACC15] text-[#FACC15]"
                      : "fill-[#E4E4E7] text-[#E4E4E7]"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-[#71717A] mt-2">
              {reviews.length}개 리뷰
            </div>
          </div>

          {/* 분포 바 */}
          <div className="flex-1 space-y-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3">
                <span className="text-sm text-[#71717A] w-3">{d.star}</span>
                <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                <div className="flex-1 h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FACC15] rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-[#71717A] w-10 text-right">{d.count}개</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-5">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="bg-white rounded-[24px] p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-10 h-10 bg-[#F4F4F5] rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[#71717A]">
                    {review.authorName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#18181B]">
                      {review.authorName}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] px-2 py-0.5 rounded-full">
                        인증
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#18181B] font-medium">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                </div>
              </div>
              {review.travelDate && (
                <span className="text-sm text-[#71717A]">
                  {new Date(review.travelDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {review.title && (
              <h4 className="font-medium text-[#18181B] mb-2">{review.title}</h4>
            )}
            <p className="text-[#71717A] text-sm leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
