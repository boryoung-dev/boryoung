"use client";

import { Utensils, Hotel, Flag, Bus } from "lucide-react";

interface ItineraryTimelineProps {
  itineraries: any[];
}

export function ItineraryTimeline({ itineraries }: ItineraryTimelineProps) {
  return (
    <div className="space-y-5">
      {itineraries.map((day: any, idx: number) => (
        <div key={day.id || idx} className="bg-white rounded-[24px] p-6">
          {/* 헤더: Day 배지 + 타이틀 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-sm font-semibold">
              Day {day.day}
            </div>
            <h3 className="text-lg font-bold text-[#18181B]">
              {day.title}
            </h3>
          </div>

          {/* 설명 */}
          {day.description && (
            day.description.includes('<') ? (
              <div
                className="prose prose-sm max-w-none text-[#71717A] mb-4"
                dangerouslySetInnerHTML={{ __html: day.description }}
              />
            ) : (
              <p className="text-sm text-[#71717A] mb-4 leading-relaxed">
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
                      <span className="text-[#71717A] font-mono w-14 flex-shrink-0">
                        {act.time}
                      </span>
                    )}
                    <span className="text-[#18181B]">{act.activity}</span>
                  </div>
                ))}
              </div>
            )}

          {/* 메타 정보 (식사, 숙소, 골프, 이동) */}
          {(day.meals || day.accommodation || day.golfCourse || day.transport) && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#F4F4F5]">
              {day.meals && (
                <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{day.meals}</span>
                </div>
              )}
              {day.accommodation && (
                <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
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
                <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                  <Bus className="w-3.5 h-3.5" />
                  <span>{day.transport}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
