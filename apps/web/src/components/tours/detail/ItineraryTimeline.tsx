"use client";

import { MapPin, Utensils, Hotel, Flag, Bus } from "lucide-react";

interface ItineraryTimelineProps {
  itineraries: any[];
}

export function ItineraryTimeline({ itineraries }: ItineraryTimelineProps) {
  return (
    <div className="relative">
      {/* 타임라인 세로선 */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[color:var(--border)]" />

      <div className="space-y-8">
        {itineraries.map((day: any, idx: number) => (
          <div key={day.id || idx} className="relative pl-16">
            {/* Day 마커 */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-[color:var(--brand)] text-white rounded-full flex flex-col items-center justify-center z-10">
              <span className="text-[10px] leading-none font-medium">DAY</span>
              <span className="text-base font-bold leading-none">{day.day}</span>
            </div>

            {/* 일정 카드 */}
            <div className="bg-[color:var(--surface)] rounded-2xl p-5">
              <h3 className="text-lg font-bold text-[color:var(--fg)] mb-2">
                {day.title}
              </h3>

              {day.description && (
                day.description.includes('<') ? (
                  <div
                    className="prose prose-sm max-w-none text-[color:var(--muted)] mb-4"
                    dangerouslySetInnerHTML={{ __html: day.description }}
                  />
                ) : (
                  <p className="text-[color:var(--muted)] text-sm mb-4 leading-relaxed">
                    {day.description}
                  </p>
                )
              )}

              {/* 활동 */}
              {day.activities &&
                Array.isArray(day.activities) &&
                day.activities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {day.activities.map((act: any, i: number) => (
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
              <div className="flex flex-wrap gap-3 pt-3 border-t border-[color:var(--border)]">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
