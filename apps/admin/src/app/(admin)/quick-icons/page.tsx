"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { Plus, Pencil, Trash2, Plane, Flag, Tag, Star, Users, Clock, MapPin, Globe } from "lucide-react";
import Select from "@/components/ui/Select";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

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
  const { token, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<QuickIcon | null>(null);
  const [formData, setFormData] = useState<QuickIconFormData>({
    label: "",
    iconName: "plane",
    linkUrl: "",
    sortOrder: 0,
    isActive: true
  });

  const { data, isLoading: loading } = useApiQuery<{ success: boolean; quickIcons: QuickIcon[] }>(
    ["quick-icons"],
    "/api/quick-icons"
  );
  const quickIcons = data?.quickIcons ?? [];

  const saveMutation = useApiMutation<any, { id?: string; body: any }>(
    async ({ id, body }, token) => {
      const url = id ? `/api/quick-icons/${id}` : "/api/quick-icons";
      const method = id ? "PUT" : "POST";
      return fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    },
    { invalidateKeys: [["quick-icons"]] }
  );

  const toggleMutation = useApiMutation<any, { id: string; isActive: boolean }>(
    async ({ id, isActive }, token) =>
      fetch(`/api/quick-icons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      }),
    { invalidateKeys: [["quick-icons"]] }
  );

  const deleteMutation = useApiMutation<any, string>(
    async (id, token) =>
      fetch(`/api/quick-icons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    { invalidateKeys: [["quick-icons"]] }
  );

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
      toast("레이블, 아이콘 이름, 링크 URL은 필수입니다", "error");
      return;
    }

    saveMutation.mutate(
      { id: editingIcon?.id, body: formData },
      {
        onSuccess: (data) => {
          if (data.success) {
            setModalOpen(false);
          } else {
            toast(data.error || "저장에 실패했습니다", "error");
          }
        },
        onError: () => toast("빠른아이콘 저장 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleMutation.mutate(
      { id, isActive },
      { onError: () => toast("상태 변경 중 오류가 발생했습니다", "error") }
    );
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 이 빠른아이콘을 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    deleteMutation.mutate(id, {
      onSuccess: (data) => {
        if (!data.success) toast(data.error || "삭제에 실패했습니다", "error");
      },
      onError: () => toast("빠른아이콘 삭제 중 오류가 발생했습니다", "error"),
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        로딩 중...
      </div>
    );
  }

  const SelectedIcon = getIconComponent(formData.iconName);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">빠른아이콘 관리</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 아이콘 추가
        </button>
      </div>

      {quickIcons.length === 0 ? (
        <div className="py-16 text-center">
          <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">등록된 빠른아이콘이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">아이콘</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">레이블</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">링크 URL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">정렬 순서</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody>
              {quickIcons.map((icon) => {
                const IconComponent = getIconComponent(icon.iconName);
                return (
                  <tr key={icon.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{icon.label}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={icon.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {icon.linkUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {icon.sortOrder}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(icon.id, !icon.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          icon.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={icon.isActive ? "비활성화" : "활성화"}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          icon.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(icon)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(icon.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* 추가/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIcon ? "빠른아이콘 수정" : "빠른아이콘 추가"}
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setModalOpen(false)} />
            <ModalConfirmButton
              type="submit"
              onClick={() => {
                document.getElementById("quickicon-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
              }}
            >
              {editingIcon ? "수정" : "추가"}
            </ModalConfirmButton>
          </>
        }
      >
        <form id="quickicon-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">레이블 *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="예: 해외골프"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이콘 *</label>
            <Select
              value={formData.iconName}
              onChange={(val) => setFormData({ ...formData, iconName: val })}
              options={ICON_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              className="w-full"
            />
            <div className="mt-3 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">미리보기:</span>
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <SelectedIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{formData.label || "레이블"}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL *</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              min="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">활성화</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
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
