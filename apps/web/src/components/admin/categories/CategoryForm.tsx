"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { X, Loader2 } from "lucide-react";

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
  const isEdit = !!category;
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    icon: category?.icon || "",
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
    parentId: category?.parentId || parentCategory?.id || null,
  });

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("이름과 slug는 필수입니다");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? "카테고리 수정" : "카테고리 추가"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="일본골프"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="japan-golf"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                자동
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
            />
            활성화
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
                </>
              ) : (
                isEdit ? "수정" : "추가"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
