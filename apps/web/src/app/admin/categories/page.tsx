"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { CategoryTree } from "@/components/admin/categories/CategoryTree";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  const { authHeaders } = useAdminAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [parentForNew, setParentForNew] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories", {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error("카테고리 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchCategories();
    }
  }, [authHeaders]);

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
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCategory(null);
    setParentForNew(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    fetchCategories();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <button
          onClick={() => handleAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> 대분류 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            카테고리가 없습니다. 대분류를 먼저 추가해주세요.
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
