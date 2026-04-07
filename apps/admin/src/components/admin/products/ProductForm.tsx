"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { ContentTab } from "./tabs/ContentTab";
import { ImagesTab } from "./tabs/ImagesTab";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { PricingTab } from "./tabs/PricingTab";
import { TagsSeoTab } from "./tabs/TagsSeoTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import { Save, Loader2, Eye, EyeOff, ChevronUp, Maximize2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ProductPreview } from "./ProductPreview";

const sections = [
  { id: "basic", label: "기본 정보" },
  { id: "content", label: "상품 소개" },
  { id: "images", label: "이미지" },
  { id: "itinerary", label: "일정" },
  { id: "pricing", label: "가격 옵션" },
  { id: "schedule", label: "출발일정" },
  { id: "tags", label: "태그/SEO" },
  { id: "settings", label: "설정" },
];

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // 섹션 접기/펼치기 상태
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 신규 등록 시 이미지/일정/가격옵션 로컬 상태 (state로 관리해서 미리보기 실시간 반영)
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [pendingItineraries, setPendingItineraries] = useState<any[]>([]);
  const [pendingPriceOptions, setPendingPriceOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    categoryId: initialData?.categoryId || "",
    destination: initialData?.destination || "",
    departure: initialData?.departure || "",
    airline: initialData?.airline || "",
    nights: initialData?.nights || 0,
    days: initialData?.days || 0,
    durationText: initialData?.durationText || "",
    golfCourses: initialData?.golfCourses || [],
    totalHoles: initialData?.totalHoles || null,
    difficulty: initialData?.difficulty || "",
    minPeople: initialData?.minPeople || null,
    maxPeople: initialData?.maxPeople || null,
    basePrice: initialData?.basePrice || null,
    originalPrice: initialData?.originalPrice || null,
    content: initialData?.content || "",
    contentSections: Array.isArray(initialData?.contentSections) ? initialData.contentSections : [],
    inclusions: Array.isArray(initialData?.inclusions) ? initialData.inclusions : [],
    exclusions: Array.isArray(initialData?.exclusions) ? initialData.exclusions : [],
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    naverUrl: initialData?.naverUrl || "",
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    sortOrder: initialData?.sortOrder || 0,
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : "",
    tagIds: initialData?.tagList?.map((t: any) => t.id) || [],
    contentHtml: initialData?.contentHtml || "",
    scheduleDates: Array.isArray(initialData?.scheduleDates) ? initialData.scheduleDates : [],
    scheduleType: initialData?.scheduleType || "dates",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 신규 등록 후 관련 데이터 일괄 저장
  const saveRelatedData = async (productId: string) => {
    const headers = { "Content-Type": "application/json", ...authHeaders } as any;

    const images = pendingImages;
    if (images.length > 0) {
      try {
        await fetch(`/api/products/${productId}/images`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            images: images.map((img: any) => ({
              url: img.url,
              alt: img.alt || null,
              type: img.type || "DETAIL",
              isThumbnail: img.isThumbnail || false,
            })),
          }),
        });
      } catch {}
    }

    const itineraries = pendingItineraries;
    if (itineraries.length > 0) {
      try {
        await fetch(`/api/products/${productId}/itineraries`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            itineraries: itineraries.map((item: any) => ({
              day: item.day,
              title: item.title,
              description: item.description,
              imageUrl: item.imageUrl || null,
              imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
              meals: item.meals,
              accommodation: item.accommodation,
              golfCourse: item.golfCourse,
              golfHoles: item.golfHoles,
              transport: item.transport,
              activities: item.activities?.filter((a: any) => a.time || a.activity) || [],
            })),
          }),
        });
      } catch {}
    }

    const priceOptions = pendingPriceOptions;
    if (priceOptions.length > 0) {
      try {
        await fetch(`/api/products/${productId}/price-options`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            priceOptions: priceOptions.map((opt: any) => ({
              name: opt.name,
              description: opt.description,
              price: opt.price ?? 0,
              priceType: opt.priceType,
              season: opt.season,
              validFrom: opt.validFrom || null,
              validTo: opt.validTo || null,
              isDefault: opt.isDefault,
              isActive: opt.isActive,
            })),
          }),
        });
      } catch {}
    }
  };

  const handleSave = async () => {
    // 유효성 검사
    const errors: string[] = [];
    if (!formData.title) errors.push("상품명");
    if (!formData.slug) errors.push("Slug");
    if (!formData.categoryId) errors.push("카테고리 (국가/지역)");
    if (!formData.nights || !formData.days) errors.push("기간(박/일)");
    if (!formData.basePrice) errors.push("기본 가격");

    const currentImages = pendingImages.length > 0 ? pendingImages : (initialData?.images || []);
    if (currentImages.length === 0) errors.push("이미지 (최소 1장)");

    if (errors.length > 0) {
      toast(`필수 항목을 입력해주세요: ${errors.join(", ")}`, "error");
      return;
    }

    if (!formData.metaTitle) {
      formData.metaTitle = `${formData.title} | 보령항공여행`;
    }
    if (!formData.metaDescription) {
      const parts = [formData.destination, formData.durationText || `${formData.nights || 0}박${formData.days || 0}일`, "골프투어"].filter(Boolean);
      const price = formData.basePrice ? `${Number(formData.basePrice).toLocaleString()}원~` : "";
      formData.metaDescription = price
        ? `${parts.join(" ")} ${price}. 왕복 항공권, 숙박, 그린피 포함 패키지. 보령항공여행에서 예약하세요.`
        : `${parts.join(" ")} 패키지. 왕복 항공권, 숙박, 그린피 포함. 보령항공여행에서 예약하세요.`;
    }

    setIsSaving(true);
    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";

      const method = initialData ? "PUT" : "POST";

      const body = {
        ...formData,
        nights: formData.nights != null ? formData.nights : undefined,
        days: formData.days != null ? formData.days : undefined,
        basePrice: formData.basePrice != null ? formData.basePrice : undefined,
        originalPrice: formData.originalPrice ?? null,
        minPeople: formData.minPeople != null ? formData.minPeople : undefined,
        maxPeople: formData.maxPeople != null ? formData.maxPeople : undefined,
        totalHoles: formData.totalHoles != null ? formData.totalHoles : undefined,
        difficulty: formData.difficulty || undefined,
        publishedAt: formData.publishedAt || null,
        excerpt: formData.excerpt || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        naverUrl: formData.naverUrl || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (!initialData && data.product?.id) {
          await saveRelatedData(data.product.id);
          toast("상품이 등록되었습니다", "success");
          router.push(`/products/${data.product.id}/edit`);
        } else {
          toast("상품이 수정되었습니다", "success");
          router.push("/products");
        }
      } else {
        toast(data.error || "저장 실패", "error");
      }
    } catch (error) {
      toast("저장 중 오류가 발생했습니다", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isNewMode = !initialData;

  return (
    <div className={`flex gap-6 ${showPreview ? "" : ""}`}>
      {/* 좌측: 폼 영역 */}
      <div className={`${showPreview ? "w-1/2" : "w-full"} transition-all duration-300`}>
        {/* 미리보기 토글 + 저장 버튼 (상단 고정) */}
        <div className="sticky top-0 z-20 bg-gray-100 pb-3 pt-3 flex items-center justify-between border-b border-gray-200 -mx-1 px-1">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "미리보기 닫기" : "미리보기"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/products")}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
              ) : (
                <><Save className="w-4 h-4" /> {initialData ? "수정" : "등록"}</>
              )}
            </button>
          </div>
        </div>

        {/* 섹션별 스크롤 폼 (웹 상세페이지 흐름 순서) */}
        <div className="space-y-4">
          {/* 1. 기본 정보 (타이틀, 가격 등 - 히어로 영역) */}
          <SectionCard
            id="basic"
            label="기본 정보"
            collapsed={collapsedSections.has("basic")}
            onToggle={() => toggleSection("basic")}
          >
            <BasicInfoTab formData={formData} updateField={updateField} isEditMode={!!initialData} />
          </SectionCard>

          {/* 2. 이미지 (히어로 이미지) */}
          <SectionCard
            id="images"
            label="이미지"
            collapsed={collapsedSections.has("images")}
            onToggle={() => toggleSection("images")}
          >
            <ImagesTab
              productId={initialData?.id}
              images={initialData?.images || []}
              onPendingChange={(imgs: any[]) => setPendingImages(imgs)}
            />
          </SectionCard>

          {/* 3. 상품 소개 (소개 탭 콘텐츠) */}
          <SectionCard
            id="content"
            label="상품 소개"
            collapsed={collapsedSections.has("content")}
            onToggle={() => toggleSection("content")}
          >
            <ContentTab formData={formData} updateField={updateField} />
          </SectionCard>

          {/* 4. 출발일정 (소개 탭 하단) */}
          <SectionCard
            id="schedule"
            label="출발일정"
            collapsed={collapsedSections.has("schedule")}
            onToggle={() => toggleSection("schedule")}
          >
            <ScheduleTab formData={formData} updateField={updateField} />
          </SectionCard>

          {/* 5. 일정 (일정 탭) */}
          <SectionCard
            id="itinerary"
            label="일정"
            collapsed={collapsedSections.has("itinerary")}
            onToggle={() => toggleSection("itinerary")}
          >
            <ItineraryTab
              productId={initialData?.id}
              itineraries={initialData?.itineraries || []}
              onPendingChange={(items: any[]) => setPendingItineraries(items)}
            />
          </SectionCard>

          {/* 6. 가격 옵션 */}
          <SectionCard
            id="pricing"
            label="가격 옵션"
            collapsed={collapsedSections.has("pricing")}
            onToggle={() => toggleSection("pricing")}
          >
            <PricingTab
              productId={initialData?.id}
              priceOptions={initialData?.priceOptions || []}
              onPendingChange={(opts: any[]) => setPendingPriceOptions(opts)}
            />
          </SectionCard>

          {/* 7. 태그/SEO */}
          <SectionCard
            id="tags"
            label="태그/SEO"
            collapsed={collapsedSections.has("tags")}
            onToggle={() => toggleSection("tags")}
          >
            <TagsSeoTab formData={formData} updateField={updateField} />
          </SectionCard>

          {/* 8. 설정 */}
          <SectionCard
            id="settings"
            label="설정"
            collapsed={collapsedSections.has("settings")}
            onToggle={() => toggleSection("settings")}
          >
            <SettingsTab formData={formData} updateField={updateField} />
          </SectionCard>
        </div>

        {/* 하단 저장 버튼 */}
        <div className="mt-6 flex justify-end gap-3 pb-8">
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="w-4 h-4" /> {initialData ? "수정" : "등록"}</>
            )}
          </button>
        </div>
      </div>

      {/* 우측: 미리보기 */}
      {showPreview && (
        <div className="w-1/2 sticky top-0 h-screen pt-1">
          <div className="h-full flex flex-col rounded-lg border border-gray-200 bg-white">
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg flex-shrink-0 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">실시간 미리보기</span>
              <button
                onClick={() => setFullscreenPreview(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                전체보기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ProductPreview
                formData={formData}
                images={pendingImages.length > 0 ? pendingImages : (initialData?.images || [])}
                itineraries={pendingItineraries.length > 0 ? pendingItineraries : (initialData?.itineraries || [])}
                priceOptions={pendingPriceOptions.length > 0 ? pendingPriceOptions : (initialData?.priceOptions || [])}
              />
            </div>
          </div>
        </div>
      )}

      {/* 전체보기 팝업 */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl w-full max-w-[1200px] h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">데스크탑 미리보기</span>
              <button
                onClick={() => setFullscreenPreview(false)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProductPreview
                formData={formData}
                images={pendingImages.length > 0 ? pendingImages : (initialData?.images || [])}
                itineraries={pendingItineraries.length > 0 ? pendingItineraries : (initialData?.itineraries || [])}
                priceOptions={pendingPriceOptions.length > 0 ? pendingPriceOptions : (initialData?.priceOptions || [])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 접기/펼치기 가능한 섹션 카드
function SectionCard({
  id,
  label,
  collapsed,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div id={`section-${id}`} className="bg-white rounded-lg shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-800">{label}</h3>
        <ChevronUp
          className={`w-5 h-5 text-gray-400 transition-transform ${collapsed ? "rotate-180" : ""}`}
        />
      </button>
      {!collapsed && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
