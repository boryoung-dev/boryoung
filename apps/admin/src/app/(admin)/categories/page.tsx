"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { CategoryTree } from "@/components/admin/categories/CategoryTree";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface CategoriesResponse {
  success: boolean;
  categories: any[];
}

export default function AdminCategoriesPage() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [parentForNew, setParentForNew] = useState<any>(null);

  const { data, isLoading } = useApiQuery<CategoriesResponse>(
    ["categories"],
    "/api/categories"
  );

  const categories = data?.categories ?? [];

  const deleteMutation = useApiMutation<any, string>(
    (id, token) =>
      fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      invalidateKeys: [["categories"]],
      onError: () => {
        toast("삭제 중 오류가 발생했습니다", "error");
      },
    }
  );

  const handleAdd = (parent?: any) => {
    setEditCategory(null);
    setParentForNew(parent || null);
    setShowForm(true);
  };

  const handleEdit = (category: any) => {
    setEditCategory(category);
    setParentForNew(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirm({ message: `"${name}" 카테고리를 삭제하시겠습니까?`, variant: "danger", confirmText: "삭제" }))) return;
    deleteMutation.mutate(id, {
      onSuccess: (data: any) => {
        if (data && !data.success) {
          toast(data.error || "삭제 실패", "error");
        }
      },
    });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCategory(null);
    setParentForNew(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <button
          onClick={() => handleAdd()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 대분류 추가
        </button>
      </div>

      {/* 카테고리 트리 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <Plus className="w-12 h-12" />
            </div>
            <p className="text-sm text-gray-500">카테고리가 없습니다. 대분류를 먼저 추가해주세요.</p>
          </div>
        ) : (
          <CategoryTree
            categories={categories}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* 추가/수정 모달 */}
      {showForm && (
        <CategoryForm
          category={editCategory}
          parentCategory={parentForNew}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
