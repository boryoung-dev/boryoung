"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Select from "@/components/ui/Select";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Tag {
  id: string;
  name: string;
  slug: string;
  type: "FEATURE" | "DURATION" | "PRICE_RANGE" | "ACCOMMODATION";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    productTags: number;
  };
}

interface TagsResponse {
  success: boolean;
  tags: Tag[];
}

interface TagFormData {
  name: string;
  slug: string;
  type: Tag["type"];
  sortOrder: number;
  isActive: boolean;
}

export default function AdminTagsPage() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    slug: "",
    type: "FEATURE",
    sortOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useApiQuery<TagsResponse>(
    ["tags"],
    "/api/tags"
  );

  const tags = data?.tags ?? [];

  const saveMutation = useApiMutation<any, { id?: string; body: TagFormData }>(
    (variables, token) => {
      const url = variables.id ? `/api/tags/${variables.id}` : "/api/tags";
      const method = variables.id ? "PUT" : "POST";
      return fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variables.body),
      });
    },
    {
      invalidateKeys: [["tags"]],
      onSuccess: () => {
        setShowModal(false);
      },
      onError: () => {
        toast("저장 중 오류가 발생했습니다", "error");
      },
    }
  );

  const deleteMutation = useApiMutation<any, string>(
    (id, token) =>
      fetch(`/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      invalidateKeys: [["tags"]],
      onError: () => {
        toast("삭제 중 오류가 발생했습니다", "error");
      },
    }
  );

  const toggleMutation = useApiMutation<any, { id: string; isActive: boolean }>(
    (variables, token) =>
      fetch(`/api/tags/${variables.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: variables.isActive }),
      }),
    {
      invalidateKeys: [["tags"]],
      onError: () => {
        toast("상태 변경 중 오류가 발생했습니다", "error");
      },
    }
  );

  const handleAdd = () => {
    setEditTag(null);
    setFormData({
      name: "",
      slug: "",
      type: "FEATURE",
      sortOrder: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      type: tag.type,
      sortOrder: tag.sortOrder,
      isActive: tag.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirm({ message: `"${name}" 태그를 삭제하시겠습니까?`, variant: "danger", confirmText: "삭제" }))) return;
    deleteMutation.mutate(id, {
      onSuccess: (data: any) => {
        if (data && !data.success) {
          toast(data.error || "삭제 실패", "error");
        }
      },
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(
      { id: editTag?.id, body: formData },
      {
        onSuccess: (data: any) => {
          if (data && !data.success) {
            toast(data.error || "저장 실패", "error");
          }
        },
      }
    );
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  const getTypeBadge = (type: Tag["type"]) => {
    const styles: Record<string, string> = {
      FEATURE: "bg-purple-100 text-purple-800",
      DURATION: "bg-blue-100 text-blue-800",
      PRICE_RANGE: "bg-green-100 text-green-800",
      ACCOMMODATION: "bg-orange-100 text-orange-800",
    };
    const labels: Record<string, string> = {
      FEATURE: "특징",
      DURATION: "기간",
      PRICE_RANGE: "가격대",
      ACCOMMODATION: "숙박",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[type]}`}
      >
        {labels[type]}
      </span>
    );
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
        <h1 className="text-2xl font-bold text-gray-900">태그 관리</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 태그 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {tags.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <Plus className="w-12 h-12" />
            </div>
            <p className="text-sm text-gray-500">태그가 없습니다. 태그를 추가해주세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">슬러그</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">타입</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">연결 상품</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">정렬순서</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{tag.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">{tag.slug}</div>
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(tag.type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tag._count.productTags}개</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tag.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(tag.id, !tag.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          tag.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={tag.isActive ? "비활성화" : "활성화"}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          tag.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 추가/수정 모달 */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTag ? "태그 수정" : "태그 추가"}
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowModal(false)} />
            <ModalConfirmButton type="submit" onClick={() => {
              document.getElementById("tag-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }}>
              {editTag ? "수정" : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="tag-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              required
            />
          </div>

          {formData.slug && (
            <p className="text-xs text-gray-400">slug: {formData.slug}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">타입 *</label>
            <Select
              value={formData.type}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, type: val as Tag["type"] }))
              }
              options={[
                { value: "FEATURE", label: "특징" },
                { value: "DURATION", label: "기간" },
                { value: "PRICE_RANGE", label: "가격대" },
                { value: "ACCOMMODATION", label: "숙박" },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬순서</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">활성화</span>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
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
    </div>
  );
}
