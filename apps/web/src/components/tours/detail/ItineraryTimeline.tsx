"use client";

import Image from "next/image";
import { Utensils, Hotel, Flag, Bus } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Itinerary, ItineraryActivity } from "@/lib/types";

interface ItineraryTimelineProps {
  itineraries: Itinerary[];
}

export function ItineraryTimeline({ itineraries }: ItineraryTimelineProps) {
  return (
    <div className="space-y-5">
      {itineraries.map((day, idx) => {
        // 이미지 URL 파싱
        const parsedUrls: string[] = Array.isArray(day.imageUrls)
          ? (day.imageUrls as string[]).filter((u): u is string => typeof u === "string")
          : [];
        const urls =
          parsedUrls.length > 0
            ? parsedUrls
            : day.imageUrl
            ? [day.imageUrl]
            : [];

        return (
          <div key={day.id || idx} className="bg-white rounded-[24px] overflow-hidden">
            <div className="p-6">
              {/* 헤더: Day 배지 + 타이틀 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] px-3 py-1 rounded-full text-sm font-semibold">
                  Day {day.day}
                </div>
                <h3 className="text-lg font-bold text-[color:var(--fg)]">
                  {day.title}
                </h3>
              </div>

              {/* 설명 */}
              {day.description && (
                day.description.includes('<') ? (
                  <div
                    className="prose prose-sm max-w-none text-[color:var(--muted)] mb-4"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(day.description) }}
                  />
                ) : (
                  <p className="text-sm text-[color:var(--muted)] mb-4 leading-relaxed">
                    {day.description}
                  </p>
                )
              )}

              {/* 이미지 갤러리 - 설명 아래, 메타 정보 위 */}
              {urls.length > 0 && (
                <div className={`mb-4 grid gap-3 ${urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {urls.map((url, i) => (
                    <div key={i} className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
                      <Image
                        src={url}
                        alt={`${day.title ?? `Day ${day.day}`} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 활동 */}
              {day.activities &&
                Array.isArray(day.activities) &&
                day.activities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {(day.activities as unknown as ItineraryActivity[]).map((act, i) => (
                      <div
                        key={i}
                        className="flex gap-3 text-sm"
                      >
                        {act.time && (
                          <span className="text-[color:var(--muted)] font-mono w-14 flex-shrink-0">
                            {act.time}
                          </span>
                        )}
                        <span className="text-[color:var(--fg)]">{act.activity}</span>
                      </div>
                    ))}
                  </div>
                )}

              {/* 메타 정보 (식사, 숙소, 골프, 이동) */}
              {(day.meals || day.accommodation || day.golfCourse || day.transport) && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[color:var(--border)]">
                  {day.meals && (
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{day.meals}</span>
                    </div>
                  )}
                  {day.accommodation && (
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                      <Hotel className="w-3.5 h-3.5" />
                      <span>{day.accommodation}</span>
                    </div>
                  )}
                  {day.golfCourse && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <Flag className="w-3.5 h-3.5" />
                      <span>
                        {day.golfCourse}
                        {day.golfHoles ? ` ${day.golfHoles}홀` : ""}
                      </span>
                    </div>
                  )}
                  {day.transport && (
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{day.transport}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
