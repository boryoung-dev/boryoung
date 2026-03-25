"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import Select from "@/components/ui/Select";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminsPage() {
  const { token, admin } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "STAFF",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    isActive: true,
    password: "",
  });

  const { data, isLoading } = useApiQuery<{ success: boolean; admins: Admin[] }>(
    ["admins"],
    "/api/admins"
  );
  const admins = data?.admins ?? [];

  const addMutation = useApiMutation<any, typeof formData>(
    async (body, token) =>
      fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
    { invalidateKeys: [["admins"]] }
  );

  const editMutation = useApiMutation<any, { id: string; body: typeof editFormData }>(
    async ({ id, body }, token) =>
      fetch(`/api/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
    { invalidateKeys: [["admins"]] }
  );

  const deleteMutation = useApiMutation<any, string>(
    async (id, token) =>
      fetch(`/api/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    { invalidateKeys: [["admins"]] }
  );

  const toggleMutation = useApiMutation<any, { id: string; isActive: boolean }>(
    async ({ id, isActive }, token) =>
      fetch(`/api/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      }),
    { invalidateKeys: [["admins"]] }
  );

  const handleAdd = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast("필수 항목을 모두 입력해주세요", "error");
      return;
    }

    addMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          toast("관리자가 추가되었습니다", "success");
          setShowAddModal(false);
          setFormData({ email: "", password: "", name: "", role: "STAFF" });
        } else {
          toast(data.error || "추가 실패", "error");
        }
      },
      onError: () => toast("추가 중 오류가 발생했습니다", "error"),
    });
  };

  const handleEdit = () => {
    if (!editTarget) return;

    editMutation.mutate(
      { id: editTarget.id, body: editFormData },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast("관리자 정보가 수정되었습니다", "success");
            setShowEditModal(false);
            setEditTarget(null);
          } else {
            toast(data.error || "수정 실패", "error");
          }
        },
        onError: () => toast("수정 중 오류가 발생했습니다", "error"),
      }
    );
  };

  const handleDelete = async (id: string, name: string) => {
    if (admin?.id === id) {
      toast("자기 자신은 삭제할 수 없습니다", "error");
      return;
    }

    if (!(await confirm({ message: `"${name}" 관리자를 삭제하시겠습니까?`, variant: "danger", confirmText: "삭제" }))) return;

    deleteMutation.mutate(id, {
      onSuccess: (data) => {
        if (data.success) {
          toast("관리자가 삭제되었습니다", "success");
        } else {
          toast(data.error || "삭제 실패", "error");
        }
      },
      onError: () => toast("삭제 중 오류가 발생했습니다", "error"),
    });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (admin?.id === id) {
      toast("자기 자신의 상태는 변경할 수 없습니다", "error");
      return;
    }
    toggleMutation.mutate(
      { id, isActive },
      { onError: () => toast("상태 변경 중 오류가 발생했습니다", "error") }
    );
  };

  const openEditModal = (adminData: Admin) => {
    setEditTarget(adminData);
    setEditFormData({
      name: adminData.name,
      role: adminData.role,
      isActive: adminData.isActive,
      password: "",
    });
    setShowEditModal(true);
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      SUPER_ADMIN: "bg-red-100 text-red-700",
      MANAGER: "bg-blue-100 text-blue-700",
      STAFF: "bg-green-100 text-green-700",
      ADMIN: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[role] || styles.ADMIN}`}>
        {role}
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

  if (admin?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Shield className="w-12 h-12 mb-4" />
        <p className="text-lg">권한이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">관리자 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 관리자 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">역할</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">활성상태</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">마지막 로그인</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">등록된 관리자가 없습니다.</p>
                </td>
              </tr>
            ) : (
              admins.map((adminItem) => (
                <tr key={adminItem.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{adminItem.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{adminItem.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(adminItem.role)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(adminItem.id, !adminItem.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        adminItem.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={adminItem.isActive ? "비활성화" : "활성화"}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        adminItem.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {adminItem.lastLoginAt
                      ? new Date(adminItem.lastLoginAt).toLocaleString("ko-KR")
                      : "로그인 기록 없음"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(adminItem)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(adminItem.id, adminItem.name)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="관리자 추가"
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowAddModal(false)} />
            <ModalConfirmButton onClick={handleAdd}>추가</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="비밀번호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <Select
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              options={[
                { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
                { value: "MANAGER", label: "MANAGER" },
                { value: "STAFF", label: "STAFF" },
              ]}
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        isOpen={showEditModal && !!editTarget}
        onClose={() => setShowEditModal(false)}
        title="관리자 수정"
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowEditModal(false)} />
            <ModalConfirmButton onClick={handleEdit}>수정</ModalConfirmButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <Select
              value={editFormData.role}
              onChange={(val) => setEditFormData({ ...editFormData, role: val })}
              options={[
                { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
                { value: "MANAGER", label: "MANAGER" },
                { value: "STAFF", label: "STAFF" },
                { value: "ADMIN", label: "ADMIN" },
              ]}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">활성 상태</span>
            <button
              type="button"
              onClick={() => setEditFormData({ ...editFormData, isActive: !editFormData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editFormData.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                editFormData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 (변경 시에만 입력)
            </label>
            <input
              type="password"
              value={editFormData.password}
              onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="빈칸이면 변경하지 않음"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
