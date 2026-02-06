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
import { Save, Loader2 } from "lucide-react";

const tabs = [
  { id: "basic", label: "기본 정보" },
  { id: "content", label: "상품 소개" },
  { id: "images", label: "이미지" },
  { id: "itinerary", label: "일정" },
  { id: "pricing", label: "가격 옵션" },
  { id: "tags", label: "태그/SEO" },
  { id: "settings", label: "설정" },
];

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { authHeaders } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

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
    inclusions: initialData?.inclusions || [],
    exclusions: initialData?.exclusions || [],
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
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.categoryId || !formData.destination) {
      alert("제목, slug, 카테고리, 목적지는 필수입니다");
      setActiveTab("basic");
      return;
    }

    setIsSaving(true);
    try {
      const url = initialData
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const method = initialData ? "PUT" : "POST";

      const body = {
        ...formData,
        nights: formData.nights || undefined,
        days: formData.days || undefined,
        basePrice: formData.basePrice || undefined,
        originalPrice: formData.originalPrice || undefined,
        minPeople: formData.minPeople || undefined,
        maxPeople: formData.maxPeople || undefined,
        totalHoles: formData.totalHoles || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(initialData ? "상품이 수정되었습니다" : "상품이 등록되었습니다");
        router.push("/admin/products");
      } else {
        alert(data.error || "저장 실패");
      }
    } catch (error) {
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-t-lg border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
          <BasicInfoTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "content" && (
          <ContentTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "images" && (
          <ImagesTab productId={initialData?.id} images={initialData?.images || []} />
        )}
        {activeTab === "itinerary" && (
          <ItineraryTab productId={initialData?.id} itineraries={initialData?.itineraries || []} />
        )}
        {activeTab === "pricing" && (
          <PricingTab productId={initialData?.id} priceOptions={initialData?.priceOptions || []} />
        )}
        {activeTab === "tags" && (
          <TagsSeoTab formData={formData} updateField={updateField} />
        )}
        {activeTab === "settings" && (
          <SettingsTab formData={formData} updateField={updateField} />
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.push("/admin/products")}
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
