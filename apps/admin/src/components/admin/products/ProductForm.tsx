"use client";

import { useState, useRef } from "react";
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
import { TemplateEditorTab } from "./tabs/TemplateEditorTab";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const tabs = [
  { id: "basic", label: "기본 정보" },
  { id: "content", label: "상품 소개" },
  { id: "images", label: "이미지" },
  { id: "itinerary", label: "일정" },
  { id: "pricing", label: "가격 옵션" },
  { id: "schedule", label: "출발일정" },
  { id: "tags", label: "태그/SEO" },
  { id: "settings", label: "설정" },
  { id: "template", label: "✏️ 페이지 편집" },
];

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // 신규 등록 시 이미지/일정/가격옵션 로컬 상태
  const pendingImagesRef = useRef<any[]>([]);
  const pendingItinerariesRef = useRef<any[]>([]);
  const pendingPriceOptionsRef = useRef<any[]>([]);

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
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 신규 등록 후 관련 데이터 일괄 저장
  const saveRelatedData = async (productId: string) => {
    const headers = { "Content-Type": "application/json", ...authHeaders } as any;

    // 이미지 저장
    const images = pendingImagesRef.current;
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

    // 일정 저장
    const itineraries = pendingItinerariesRef.current;
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

    // 가격옵션 저장
    const priceOptions = pendingPriceOptionsRef.current;
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
    if (!formData.title || !formData.slug || !formData.categoryId || !formData.destination) {
      toast("제목, slug, 카테고리, 목적지는 필수입니다", "error");
      setActiveTab("basic");
      return;
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
        originalPrice: formData.originalPrice != null ? formData.originalPrice : undefined,
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
        // 신규 등록 시 이미지/일정/가격옵션 한번에 저장
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
    <div>
      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto px-4 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 border border-gray-200 border-b-white -mb-px"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white rounded-b-lg shadow p-6">
        {activeTab === "basic" && (
          <BasicInfoTab formData={formData} updateField={updateField} isEditMode={!!initialData} />
        )}
        {activeTab === "content" && (
          <ContentTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "images" && (
          <ImagesTab
            productId={initialData?.id}
            images={initialData?.images || []}
            onPendingChange={isNewMode ? (imgs: any[]) => { pendingImagesRef.current = imgs; } : undefined}
          />
        )}
        {activeTab === "itinerary" && (
          <ItineraryTab
            productId={initialData?.id}
            itineraries={initialData?.itineraries || []}
            onPendingChange={isNewMode ? (items: any[]) => { pendingItinerariesRef.current = items; } : undefined}
          />
        )}
        {activeTab === "pricing" && (
          <PricingTab
            productId={initialData?.id}
            priceOptions={initialData?.priceOptions || []}
            onPendingChange={isNewMode ? (opts: any[]) => { pendingPriceOptionsRef.current = opts; } : undefined}
          />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "tags" && (
          <TagsSeoTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "settings" && (
          <SettingsTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "template" && (
          <TemplateEditorTab
            formData={formData}
            updateField={updateField}
            initialData={initialData}
          />
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6 flex justify-end gap-3">
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
  );
}
