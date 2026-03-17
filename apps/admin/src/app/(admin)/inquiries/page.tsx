"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import Select from "@/components/ui/Select";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  content: string;
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
}

export default function InquiriesPage() {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      loadInquiries();
    }
  }, [authHeaders]);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(
        inquiries.filter((inq) => inq.status === selectedStatus)
      );
    }
  }, [selectedStatus, inquiries]);

  async function loadInquiries() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/inquiries", {
        headers: authHeaders as any,
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error("문의 목록 로드 실패:", error);
      toast("문의 목록을 불러오는 데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(inquiry: Inquiry) {
    setSelectedInquiry(inquiry);
    setAdminReply(inquiry.adminReply || "");
    setNewStatus(inquiry.status);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedInquiry(null);
    setAdminReply("");
    setNewStatus("");
  }

  async function handleUpdate() {
    if (!selectedInquiry) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        } as any,
        body: JSON.stringify({
          status: newStatus,
          adminReply: adminReply || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast("문의가 업데이트되었습니다.", "success");
        closeModal();
        loadInquiries();
      } else {
        toast(data.error || "업데이트 실패", "error");
      }
    } catch (error) {
      console.error("문의 업데이트 실패:", error);
      toast("업데이트 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: "정말 이 문의를 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });

      const data = await res.json();
      if (data.success) {
        toast("문의가 삭제되었습니다.", "success");
        loadInquiries();
      } else {
        toast(data.error || "삭제 실패", "error");
      }
    } catch (error) {
      console.error("문의 삭제 실패:", error);
      toast("삭제 중 오류가 발생했습니다.", "error");
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      REPLIED: "bg-blue-100 text-blue-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    const labels = {
      PENDING: "대기중",
      REPLIED: "답변완료",
      CLOSED: "종료",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
        <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: `전체 (${inquiries.length})` },
          { value: "PENDING", label: `대기중 (${inquiries.filter((i) => i.status === "PENDING").length})` },
          { value: "REPLIED", label: `답변완료 (${inquiries.filter((i) => i.status === "REPLIED").length})` },
          { value: "CLOSED", label: `종료 (${inquiries.filter((i) => i.status === "CLOSED").length})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedStatus === tab.value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 transition-colors"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">내용</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">접수일</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">문의가 없습니다.</p>
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{inquiry.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{inquiry.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{inquiry.email || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{inquiry.content}</div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(inquiry.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inquiry.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal(inquiry)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="상세/답변"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
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

      {/* 상세/답변 모달 */}
      <Modal
        isOpen={isModalOpen && !!selectedInquiry}
        onClose={closeModal}
        title="문의 상세"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={closeModal} />
            <ModalConfirmButton onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : "저장"}
            </ModalConfirmButton>
          </>
        }
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <div className="text-gray-900">{selectedInquiry.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <div className="text-gray-900">{selectedInquiry.phone}</div>
            </div>

            {selectedInquiry.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="text-gray-900">{selectedInquiry.email}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">문의 내용</label>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-900 text-sm">
                {selectedInquiry.content}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">접수일</label>
              <div className="text-gray-900 text-sm">{formatDate(selectedInquiry.createdAt)}</div>
            </div>

            {selectedInquiry.repliedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">답변일</label>
                <div className="text-gray-900 text-sm">
                  {formatDate(selectedInquiry.repliedAt)}{" "}
                  {selectedInquiry.repliedBy && (
                    <span className="text-gray-500">(by {selectedInquiry.repliedBy})</span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                options={[
                  { value: "PENDING", label: "대기중" },
                  { value: "REPLIED", label: "답변완료" },
                  { value: "CLOSED", label: "종료" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">관리자 답변</label>
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="답변 내용을 입력하세요..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
