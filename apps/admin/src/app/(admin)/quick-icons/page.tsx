"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Plane, Flag, Tag, Star, Users, Clock, MapPin, Globe } from "lucide-react";

interface QuickIcon {
  id: string;
  label: string;
  iconName: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

interface QuickIconFormData {
  label: string;
  iconName: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const ICON_OPTIONS = [
  { value: "plane", label: "비행기", icon: Plane },
  { value: "flag", label: "깃발", icon: Flag },
  { value: "tag", label: "태그", icon: Tag },
  { value: "star", label: "별", icon: Star },
  { value: "users", label: "단체", icon: Users },
  { value: "clock", label: "시계", icon: Clock },
  { value: "map", label: "지도핀", icon: MapPin },
  { value: "globe", label: "지구", icon: Globe },
];

const getIconComponent = (name: string) => {
  const found = ICON_OPTIONS.find(o => o.value === name);
  if (!found) return Globe;
  return found.icon;
};

export default function QuickIconsPage() {
  const { authHeaders, isLoading } = useAdminAuth();
  const [quickIcons, setQuickIcons] = useState<QuickIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<QuickIcon | null>(null);
  const [formData, setFormData] = useState<QuickIconFormData>({
    label: "",
    iconName: "plane",
    linkUrl: "",
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0 && !isLoading) {
      fetchQuickIcons();
    }
  }, [authHeaders, isLoading]);

  const fetchQuickIcons = async () => {
    try {
      const res = await fetch("/api/quick-icons", {
        headers: authHeaders as any
      });
      const data = await res.json();
      if (data.success) {
        setQuickIcons(data.quickIcons);
      }
    } catch (error) {
      console.error("빠른아이콘 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingIcon(null);
    setFormData({
      label: "",
      iconName: "plane",
      linkUrl: "",
      sortOrder: 0,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (icon: QuickIcon) => {
    setEditingIcon(icon);
    setFormData({
      label: icon.label,
      iconName: icon.iconName,
      linkUrl: icon.linkUrl,
      sortOrder: icon.sortOrder,
      isActive: icon.isActive
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim() || !formData.iconName.trim() || !formData.linkUrl.trim()) {
      alert("레이블, 아이콘 이름, 링크 URL은 필수입니다");
      return;
    }

    try {
      const url = editingIcon ? `/api/quick-icons/${editingIcon.id}` : "/api/quick-icons";
      const method = editingIcon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders
        } as any,
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchQuickIcons();
      } else {
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("빠른아이콘 저장 실패:", error);
      alert("빠른아이콘 저장 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 빠른아이콘을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/quick-icons/${id}`, {
        method: "DELETE",
        headers: authHeaders as any
      });

      const data = await res.json();
      if (data.success) {
        fetchQuickIcons();
      } else {
        alert(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("빠른아이콘 삭제 실패:", error);
      alert("빠른아이콘 삭제 중 오류가 발생했습니다");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const SelectedIcon = getIconComponent(formData.iconName);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">빠른아이콘 관리</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          아이콘 추가
        </button>
      </div>

      {quickIcons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>등록된 빠른아이콘이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  아이콘
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  레이블
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  링크 URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정렬 순서
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quickIcons.map((icon) => {
                const IconComponent = getIconComponent(icon.iconName);
                return (
                  <tr key={icon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{icon.label}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={icon.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {icon.linkUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {icon.sortOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        icon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {icon.isActive ? (
                          <>
                            <Eye className="w-3 h-3" />
                            활성
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            비활성
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(icon)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(icon.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingIcon ? "빠른아이콘 수정" : "빠른아이콘 추가"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    레이블 *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 해외골프"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이콘 *
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">미리보기:</span>
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <SelectedIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formData.label || "레이블"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    링크 URL *
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    활성화
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingIcon ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
