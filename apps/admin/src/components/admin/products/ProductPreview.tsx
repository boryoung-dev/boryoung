"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plane,
  Star,
  Phone,
  Utensils,
  Hotel,
  Flag,
  Bus,
  Check,
  X,
} from "lucide-react";

interface ProductPreviewProps {
  formData: any;
  images?: any[];
  itineraries?: any[];
  priceOptions?: any[];
}

type PreviewTab = "intro" | "itinerary" | "inclusions" | "pricing" | "reviews";

const CSS_VARS = {
  "--fg": "#1d1d1f",
  "--muted": "#86868b",
  "--surface": "#f5f5f7",
  "--border": "#d2d2d7",
  "--brand": "#0071e3",
  "--brand-foreground": "#ffffff",
  "--bg": "#ffffff",
} as React.CSSProperties;

export function ProductPreview({
  formData,
  images = [],
  itineraries = [],
  priceOptions = [],
}: ProductPreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("intro");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const thumbnail =
    images.find((img: any) => img.isThumbnail)?.url || images[0]?.url;
  const mainImageUrl = images[activeImageIdx]?.url || thumbnail;
  const thumbnailRow = images.slice(0, 5);

  const discountPct =
    formData.originalPrice && formData.basePrice &&
    Number(formData.originalPrice) > Number(formData.basePrice)
      ? Math.round(
          (1 - Number(formData.basePrice) / Number(formData.originalPrice)) * 100
        )
      : 0;

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: "intro", label: "상품 소개" },
    { id: "itinerary", label: "일정표" },
    { id: "inclusions", label: "포함사항" },
    { id: "reviews", label: "후기" },
    { id: "pricing", label: "가격옵션" },
  ];

  return (
    <div
      className="bg-[color:var(--surface)] min-h-full text-[color:var(--fg)] text-sm font-sans"
      style={CSS_VARS}
    >
      {/* ─── 히어로 섹션 ─── */}
      <div className="px-5 pt-6 pb-0">
        <div className="flex flex-row gap-6">
          {/* 왼쪽: 이미지 50% */}
          <div className="w-1/2 flex-shrink-0">
            {/* 메인 이미지 */}
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[color:var(--border)]">
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[color:var(--muted)] text-xs">
                  이미지를 등록하세요
                </div>
              )}
            </div>
            {/* 썸네일 행 */}
            {thumbnailRow.length > 1 && (
              <div className="flex gap-2 mt-3">
                {thumbnailRow.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`flex-1 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImageIdx === idx
                        ? "border-[color:var(--brand)]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 배지 */}
            <div className="flex items-center gap-2 mb-3">
              {formData.isFeatured && (
                <span className="inline-flex items-center gap-1 bg-[color:var(--fg)] text-white text-xs font-medium px-3 py-1 rounded-full">
                  <Star className="w-3 h-3" /> 베스트셀러
                </span>
              )}
              {discountPct > 0 && (
                <span className="border border-[color:var(--border)] text-[color:var(--fg)] text-xs px-3 py-1 rounded-full">
                  얼리버드 -{discountPct}%
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1
              className={`text-2xl lg:text-[36px] font-bold leading-tight tracking-tight mb-2 ${
                formData.title ? "text-[color:var(--fg)]" : "text-[color:var(--muted)]"
              }`}
            >
              {formData.title || "상품 제목을 입력하세요"}
            </h1>

            {/* 부제목 */}
            {formData.subtitle && (
              <p className="text-[color:var(--muted)] text-base mb-4">
                {formData.subtitle}
              </p>
            )}

            {/* 가격 박스 */}
            <div className="bg-[color:var(--bg)] rounded-xl p-4 lg:p-6 mb-4">
              <p className="text-xs text-[color:var(--muted)] mb-1">1인 기준 가격</p>
              {formData.basePrice ? (
                <div className="flex items-end gap-2">
                  <span className="text-[32px] font-bold text-[color:var(--fg)] leading-none">
                    {Number(formData.basePrice).toLocaleString()}
                    <span className="text-xl ml-0.5">원</span>
                  </span>
                  {discountPct > 0 && (
                    <span className="text-base text-[color:var(--muted)] line-through pb-1">
                      {Number(formData.originalPrice).toLocaleString()}원
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[32px] font-bold text-[color:var(--muted)] leading-none">
                  가격 문의
                </span>
              )}
            </div>

            {/* CTA 버튼 */}
            <div className="space-y-3 mt-auto">
              <button className="flex items-center justify-center gap-2 w-full h-14 bg-[color:var(--fg)] text-white rounded-2xl text-sm font-semibold">
                <Phone className="w-4 h-4" /> 전화 상담하기
              </button>
              <button className="flex items-center justify-center gap-2 w-full h-12 bg-[#FEE500] text-[#371D1E] rounded-2xl text-sm font-semibold">
                카카오톡 상담
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 하이라이트 카드 ─── */}
      {(formData.durationText ||
        formData.destination ||
        formData.airline ||
        formData.minPeople ||
        formData.maxPeople) && (
        <div className="px-5 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.durationText && (
              <HighlightCard
                icon={<Calendar className="w-5 h-5" />}
                label="여행 기간"
                value={formData.durationText}
              />
            )}
            {formData.destination && (
              <HighlightCard
                icon={<MapPin className="w-5 h-5" />}
                label="여행지"
                value={formData.destination}
              />
            )}
            {(formData.minPeople || formData.maxPeople) && (
              <HighlightCard
                icon={<Users className="w-5 h-5" />}
                label="인원"
                value={
                  formData.minPeople && formData.maxPeople
                    ? `${formData.minPeople}~${formData.maxPeople}명`
                    : formData.minPeople
                    ? `${formData.minPeople}명 이상`
                    : `최대 ${formData.maxPeople}명`
                }
              />
            )}
            {formData.airline && (
              <HighlightCard
                icon={<Plane className="w-5 h-5" />}
                label="항공편"
                value={formData.airline}
              />
            )}
          </div>
        </div>
      )}

      {/* ─── 탭 네비게이션 ─── */}
      <div className="sticky top-0 z-10 bg-[color:var(--bg)] border-b border-[color:var(--border)] px-5">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[color:var(--fg)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[color:var(--fg)] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 콘텐츠 영역 ─── */}
      <div className="px-5 pt-6 pb-24">
        <div>
          {/* 메인 콘텐츠 */}
          <div className="min-w-0">
            {/* ── 상품 소개 탭 ── */}
            {activeTab === "intro" && (
              <div className="space-y-6">
                {/* 상품 소개 카드 */}
                <div className="bg-[color:var(--bg)] rounded-2xl p-8">
                  <h2 className="text-xl font-bold text-[color:var(--fg)] mb-4">
                    상품 소개
                  </h2>
                  {formData.excerpt && (
                    <p className="text-[color:var(--muted)] leading-relaxed mb-6">
                      {formData.excerpt}
                    </p>
                  )}
                  {Array.isArray(formData.contentSections) &&
                  formData.contentSections.length > 0 ? (
                    <PreviewSectionRenderer sections={formData.contentSections} />
                  ) : formData.contentHtml ? (
                    <div
                      className="text-[color:var(--muted)] leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.contentHtml }}
                    />
                  ) : formData.content ? (
                    <p className="text-[color:var(--muted)] leading-relaxed whitespace-pre-wrap">
                      {formData.content}
                    </p>
                  ) : (
                    <p className="text-[color:var(--border)]">
                      상품 소개를 입력하세요
                    </p>
                  )}

                  {/* 태그 */}
                  {Array.isArray(formData.tags) && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[color:var(--border)]">
                      {formData.tags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[color:var(--surface)] text-[color:var(--muted)] text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 출발 일정 */}
                {(formData.scheduleType === "always" ||
                  formData.scheduleDates?.length > 0) && (
                  <div className="bg-[color:var(--bg)] rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-[color:var(--fg)] mb-4">
                      출발 가능 일정
                    </h2>
                    {formData.scheduleType === "always" ? (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            상시 출발 가능
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">
                            원하시는 날짜에 출발 가능합니다.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {formData.scheduleDates.map((sd: any, i: number) => {
                          const statusStyles: Record<string, string> = {
                            available:
                              "bg-green-50 border-green-200 text-green-700",
                            few_left:
                              "bg-yellow-50 border-yellow-200 text-yellow-700",
                            sold_out:
                              "bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--muted)] line-through",
                          };
                          const statusLabels: Record<string, string> = {
                            available: "예약가능",
                            few_left: "마감임박",
                            sold_out: "마감",
                          };
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm ${
                                statusStyles[sd.status] || statusStyles.available
                              }`}
                            >
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{sd.date}</div>
                                <div className="text-xs">
                                  {statusLabels[sd.status] || sd.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── 일정표 탭 ── */}
            {activeTab === "itinerary" && (
              <div className="space-y-4">
                {itineraries.length > 0 ? (
                  itineraries.map((day: any, idx: number) => {
                    const urls: string[] = Array.isArray(day.imageUrls)
                      ? day.imageUrls.filter((u: any) => typeof u === "string")
                      : day.imageUrl
                      ? [day.imageUrl]
                      : [];

                    return (
                      <div
                        key={idx}
                        className="bg-[color:var(--bg)] rounded-[24px] p-6"
                      >
                        {/* Day 배지 + 제목 */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-[color:var(--brand)] text-white px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0">
                            Day {day.day}
                          </span>
                          <h3 className="text-lg font-bold text-[color:var(--fg)]">
                            {day.title}
                          </h3>
                        </div>

                        {/* 설명 */}
                        {day.description && (
                          <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                            {day.description}
                          </p>
                        )}

                        {/* 이미지 그리드 */}
                        {urls.length > 0 && (
                          <div
                            className={`mb-4 grid gap-2 ${
                              urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                            }`}
                          >
                            {urls.map((url: string, i: number) => (
                              <div
                                key={i}
                                className="relative w-full aspect-[16/10] rounded-xl overflow-hidden"
                              >
                                <img
                                  src={url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 활동 목록 */}
                        {Array.isArray(day.activities) &&
                          day.activities.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {day.activities.map((act: any, i: number) => (
                                <div key={i} className="flex gap-3 text-sm">
                                  {act.time && (
                                    <span className="text-[color:var(--muted)] font-mono w-12 flex-shrink-0">
                                      {act.time}
                                    </span>
                                  )}
                                  <span className="text-[color:var(--fg)]">
                                    {act.activity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* 메타 정보 */}
                        {(day.meals ||
                          day.accommodation ||
                          day.golfCourse ||
                          day.transport) && (
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-[color:var(--border)]">
                            {day.meals && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                                <Utensils className="w-3.5 h-3.5" /> {day.meals}
                              </span>
                            )}
                            {day.accommodation && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                                <Hotel className="w-3.5 h-3.5" />{" "}
                                {day.accommodation}
                              </span>
                            )}
                            {day.golfCourse && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <Flag className="w-3.5 h-3.5" /> {day.golfCourse}
                                {day.golfHoles ? ` ${day.golfHoles}홀` : ""}
                              </span>
                            )}
                            {day.transport && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                                <Bus className="w-3.5 h-3.5" /> {day.transport}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-[color:var(--muted)] text-sm py-16">
                    일정을 추가하면 여기에 표시됩니다
                  </div>
                )}
              </div>
            )}

            {/* ── 포함사항 탭 ── */}
            {activeTab === "inclusions" && (
              <div className="space-y-6">
                {formData.inclusions?.length > 0 ? (
                  <div className="bg-[color:var(--bg)] rounded-[32px] p-8">
                    <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
                      포함 사항
                    </h3>
                    <ul className="space-y-3">
                      {formData.inclusions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[color:var(--fg)] leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {formData.exclusions?.length > 0 ? (
                  <div className="bg-[color:var(--surface)] rounded-[32px] p-8">
                    <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
                      미포함 사항
                    </h3>
                    <ul className="space-y-3">
                      {formData.exclusions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center mt-0.5">
                            <X className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[color:var(--fg)] leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {!formData.inclusions?.length && !formData.exclusions?.length && (
                  <div className="text-center text-[color:var(--muted)] text-sm py-16">
                    포함/불포함 사항을 추가하면 여기에 표시됩니다
                  </div>
                )}
              </div>
            )}

            {/* ── 가격옵션 탭 ── */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                {priceOptions.length > 0 ? (
                  <div className="bg-[color:var(--bg)] rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-[color:var(--fg)] mb-6">
                      가격 옵션
                    </h3>
                    <div className="space-y-3">
                      {priceOptions.map((opt: any, i: number) => {
                        const typeLabels: Record<string, string> = {
                          per_person: "1인당",
                          per_group: "그룹",
                          per_room: "1실",
                          flat: "정액",
                        };
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-5 bg-[color:var(--surface)] rounded-2xl"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[color:var(--fg)]">
                                {opt.name || "옵션명 없음"}
                              </p>
                              <p className="text-xs text-[color:var(--muted)] mt-1">
                                {typeLabels[opt.priceType] || opt.priceType}
                                {opt.season && opt.season !== "all"
                                  ? ` · ${opt.season}`
                                  : ""}
                              </p>
                              {opt.description && (
                                <p className="text-xs text-[color:var(--muted)] mt-1">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="text-lg font-bold text-[color:var(--fg)]">
                                {opt.price ? Number(opt.price).toLocaleString() : 0}원
                              </p>
                              <div className="flex gap-1 mt-1 justify-end">
                                {opt.isDefault && (
                                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                    기본
                                  </span>
                                )}
                                {!opt.isActive && (
                                  <span className="text-[10px] bg-[color:var(--border)] text-[color:var(--muted)] px-2 py-0.5 rounded-full">
                                    비활성
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[color:var(--muted)] text-sm py-16">
                    가격 옵션을 추가하면 여기에 표시됩니다
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── 섹션 빌더 렌더러 ───
function PreviewSectionRenderer({ sections }: { sections: any[] }) {
  const sorted = [...sections].sort(
    (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="flex flex-col gap-6 mt-4">
      {sorted.map((section: any, idx: number) => {
        const data = section.data || section;
        const key = section.id || String(idx);

        switch (data.type) {
          case "text":
            return (
              <div
                key={key}
                className="text-[color:var(--muted)] leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: data.html || "" }}
              />
            );

          case "image":
            return (
              <figure key={key}>
                <img
                  src={data.url}
                  alt={data.alt || ""}
                  className="w-full rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                {data.caption && (
                  <figcaption className="mt-2 text-center text-xs text-[color:var(--muted)]">
                    {data.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "imageText": {
            const isLeft = data.imagePosition === "left";
            const imageEl = (
              <div className="w-1/2 flex-shrink-0">
                <img
                  src={data.imageUrl}
                  alt={data.imageAlt || ""}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            );
            const textEl = (
              <div className="w-1/2 flex items-center">
                <div
                  className="text-sm text-[color:var(--muted)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: data.html || "" }}
                />
              </div>
            );
            return (
              <div key={key} className="flex gap-4">
                {isLeft ? imageEl : textEl}
                {isLeft ? textEl : imageEl}
              </div>
            );
          }

          case "gallery":
            return (
              <div
                key={key}
                className={`grid gap-2 ${
                  data.columns === 2
                    ? "grid-cols-2"
                    : data.columns === 4
                    ? "grid-cols-4"
                    : "grid-cols-3"
                }`}
              >
                {(data.images || []).map((img: any, i: number) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt || ""}
                    className="w-full h-32 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            );

          case "video":
            return (
              <div
                key={key}
                className="bg-[color:var(--surface)] rounded-xl aspect-video flex items-center justify-center text-[color:var(--muted)] text-sm"
              >
                동영상: {data.url}
              </div>
            );

          case "quote":
            return (
              <blockquote
                key={key}
                className="border-l-4 border-[color:var(--brand)] pl-4 py-1"
              >
                <p className="text-[color:var(--fg)] italic">{data.text}</p>
                {data.author && (
                  <cite className="text-sm text-[color:var(--muted)] not-italic mt-1 block">
                    — {data.author}
                  </cite>
                )}
              </blockquote>
            );

          case "callout": {
            const variantStyles: Record<string, string> = {
              info: "bg-blue-50 border-blue-200",
              warning: "bg-yellow-50 border-yellow-200",
              tip: "bg-green-50 border-green-200",
              important: "bg-red-50 border-red-200",
            };
            const icons: Record<string, string> = {
              info: "ℹ️",
              warning: "⚠️",
              tip: "💡",
              important: "🚨",
            };
            return (
              <div
                key={key}
                className={`border rounded-xl p-4 ${
                  variantStyles[data.variant] || variantStyles.info
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-base">{icons[data.variant] || "ℹ️"}</span>
                  <div>
                    {data.title && (
                      <p className="text-sm font-semibold mb-1">{data.title}</p>
                    )}
                    <div
                      className="text-sm text-[color:var(--fg)] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: data.html || "" }}
                    />
                  </div>
                </div>
              </div>
            );
          }

          case "faq":
            return (
              <div
                key={key}
                className="border border-[color:var(--border)] rounded-xl overflow-hidden divide-y divide-[color:var(--border)]"
              >
                {(data.items || []).map((item: any, i: number) => (
                  <div key={i} className="px-5 py-4">
                    <p className="text-sm font-semibold text-[color:var(--fg)]">
                      Q. {item.question}
                    </p>
                    <p className="text-sm text-[color:var(--muted)] mt-2 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            );

          case "divider":
            return (
              <hr key={key} className="border-t border-[color:var(--border)]" />
            );

          case "banner":
            return (
              <div
                key={key}
                className="relative rounded-2xl overflow-hidden h-32 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${data.backgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 text-center px-4">
                  <p className="text-lg font-bold text-white">{data.title}</p>
                  {data.subtitle && (
                    <p className="text-sm text-white/80 mt-1">{data.subtitle}</p>
                  )}
                </div>
              </div>
            );

          case "features":
            return (
              <div
                key={key}
                className={`grid gap-3 ${
                  data.columns === 2
                    ? "grid-cols-2"
                    : data.columns === 4
                    ? "grid-cols-4"
                    : "grid-cols-3"
                }`}
              >
                {(data.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-[color:var(--surface)] rounded-xl p-4">
                    {item.icon && <span className="text-2xl">{item.icon}</span>}
                    <p className="text-sm font-semibold text-[color:var(--fg)] mt-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-[color:var(--muted)] mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── 하이라이트 카드 ───
function HighlightCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[color:var(--surface)] rounded-xl px-5 py-4 flex items-center gap-3">
      <span className="text-[color:var(--muted)] flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-[color:var(--muted)]">{label}</div>
        <div className="text-sm font-semibold text-[color:var(--fg)] truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
