"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import Select from "@/components/ui/Select";

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

export default function AdminTagsPage() {
  const { authHeaders } = useAdminAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "FEATURE" as Tag["type"],
    sortOrder: 0,
    isActive: true,
  });

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags", {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) setTags(data.tags);
    } catch (error) {
      console.error("태그 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchTags();
    }
  }, [authHeaders]);

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
    if (!confirm(`"${name}" 태그를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        fetchTags();
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders } as any,
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (data.success) fetchTags();
    } catch {
      alert("상태 변경 중 오류가 발생했습니다");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editTag ? `/api/tags/${editTag.id}` : "/api/tags";
      const method = editTag ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        } as any,
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchTags();
      } else {
        alert(data.error || "저장 실패");
      }
    } catch {
      alert("저장 중 오류가 발생했습니다");
    }
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
        className={`inline-flex px-2 py-1 text-xs font-medium ${styles[type]} rounded`}
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">태그 관리</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> 태그 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            태그가 없습니다. 태그를 추가해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    슬러그
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연결 상품
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정렬순서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {tag.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tag.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(tag.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tag._count.productTags}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tag.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(tag.id, !tag.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          tag.isActive ? "bg-blue-600" : "bg-gray-300"
                        }`}
                        title={tag.isActive ? "비활성화" : "활성화"}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tag.isActive ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editTag ? "태그 수정" : "태그 추가"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {formData.slug && (
                <p className="text-xs text-gray-400">slug: {formData.slug}</p>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  타입 *
                </label>
                {/* 태그 타입 선택 */}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  정렬순서
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">활성화</span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                >
                  {editTag ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
