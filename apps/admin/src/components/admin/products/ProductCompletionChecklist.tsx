"use client";

import { CheckCircle2, Circle, Image as ImageIcon, MapPin, Tag, CalendarDays, Wallet, Eye } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  sectionId: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProductCompletionChecklistProps {
  formData: {
    title?: string;
    slug?: string;
    categoryId?: string;
    destination?: string;
    nights?: number | null;
    days?: number | null;
    basePrice?: number | null;
    isActive?: boolean;
  };
  images: unknown[];
}

export function ProductCompletionChecklist({ formData, images }: ProductCompletionChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "title",
      label: "상품명",
      done: Boolean(formData.title && formData.slug),
      sectionId: "section-basic",
      helper: "상품명 입력 시 URL이 자동 생성됩니다.",
      icon: Tag,
    },
    {
      id: "category",
      label: "국가/지역",
      done: Boolean(formData.categoryId && formData.destination),
      sectionId: "section-basic",
      helper: "없으면 이 화면에서 바로 추가할 수 있습니다.",
      icon: MapPin,
    },
    {
      id: "duration",
      label: "기간",
      done: Boolean(formData.nights && formData.days),
      sectionId: "section-basic",
      helper: "예: 3박4일, 4박5일",
      icon: CalendarDays,
    },
    {
      id: "price",
      label: "판매가",
      done: Boolean(formData.basePrice),
      sectionId: "section-basic",
      helper: "상품 카드와 상세 페이지에 표시됩니다.",
      icon: Wallet,
    },
    {
      id: "image",
      label: "대표 이미지",
      done: images.length > 0,
      sectionId: "section-images",
      helper: "최소 1장 필요합니다.",
      icon: ImageIcon,
    },
    {
      id: "visibility",
      label: "공개 여부",
      done: true,
      sectionId: "section-settings",
      helper: formData.isActive ? "현재 공개 상태입니다." : "현재 비공개 상태입니다.",
      icon: Eye,
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">상품 등록 체크리스트</h2>
          <p className="text-xs text-gray-500 mt-0.5">필수 항목만 먼저 채우면 상품을 안전하게 저장할 수 있습니다.</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-blue-600">{doneCount}/{items.length}</p>
          <p className="text-[11px] text-gray-400">{percent}% 완료</p>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.sectionId)}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                item.done
                  ? "border-green-100 bg-green-50 hover:bg-green-100"
                  : "border-amber-100 bg-amber-50 hover:bg-amber-100"
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-900">
                  <Icon className="w-3 h-3" /> {item.label}
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5 leading-snug">{item.helper}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
