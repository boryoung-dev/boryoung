"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/slugify";

interface CategoryFormProps {
  category?: any;
  parentCategory?: any;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryForm({
  category,
  parentCategory,
  onClose,
  onSaved,
}: CategoryFormProps) {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const isEdit = !!category;
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    icon: category?.icon || "",
    emoji: category?.emoji || "",
    latitude: category?.latitude ?? "",
    longitude: category?.longitude ?? "",
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
    parentId: category?.parentId || parentCategory?.id || null,
  });

  const toSlug = (text: string) => slugify(text);

  const handleNameChange = (name: string) => {
    if (isEdit) {
      setFormData((p) => ({ ...p, name }));
    } else {
      setFormData((p) => ({ ...p, name, slug: toSlug(name) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast("이름과 slug는 필수입니다", "error");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEdit
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        emoji: formData.emoji || null,
        latitude: formData.latitude !== "" ? parseFloat(String(formData.latitude)) : null,
        longitude: formData.longitude !== "" ? parseFloat(String(formData.longitude)) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        toast(data.error || "저장 실패", "error");
      }
    } catch {
      toast("저장 중 오류가 발생했습니다", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? "카테고리 수정" : "카테고리 추가"}
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalConfirmButton
            type="submit"
            disabled={isSaving}
            onClick={() => {
              document.getElementById("category-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }}
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
              </span>
            ) : (
              isEdit ? "수정" : "추가"
            )}
          </ModalConfirmButton>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {parentCategory && !isEdit && (
          <div className="bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-lg">
            상위: {parentCategory.name}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="일본"
          />
          {formData.slug && (
            <p className="mt-1 text-xs text-gray-400">slug: {formData.slug}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="plane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이모지</label>
            <input
              type="text"
              value={formData.emoji}
              onChange={(e) => setFormData((p) => ({ ...p, emoji: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="🇯🇵"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">위도</label>
            <input
              type="number"
              step="0.01"
              value={formData.latitude}
              onChange={(e) =>
                setFormData((p) => ({ ...p, latitude: e.target.value }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="36.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">경도</label>
            <input
              type="number"
              step="0.01"
              value={formData.longitude}
              onChange={(e) =>
                setFormData((p) => ({ ...p, longitude: e.target.value }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="138.2"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">활성화</span>
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
            }`} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
