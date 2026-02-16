"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { MessageSquare, Reply, Trash2, X, Eye } from "lucide-react";

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
      alert("문의 목록을 불러오는 데 실패했습니다.");
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
        alert("문의가 업데이트되었습니다.");
        closeModal();
        loadInquiries();
      } else {
        alert(data.error || "업데이트 실패");
      }
    } catch (error) {
      console.error("문의 업데이트 실패:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 이 문의를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });

      const data = await res.json();
      if (data.success) {
        alert("문의가 삭제되었습니다.");
        loadInquiries();
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch (error) {
      console.error("문의 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
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
        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          문의 관리
        </h1>

        {/* 필터 */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            전체 ({inquiries.length})
          </button>
          <button
            onClick={() => setSelectedStatus("PENDING")}
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === "PENDING"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            대기중 ({inquiries.filter((i) => i.status === "PENDING").length})
          </button>
          <button
            onClick={() => setSelectedStatus("REPLIED")}
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === "REPLIED"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            답변완료 ({inquiries.filter((i) => i.status === "REPLIED").length})
          </button>
          <button
            onClick={() => setSelectedStatus("CLOSED")}
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === "CLOSED"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            종료 ({inquiries.filter((i) => i.status === "CLOSED").length})
          </button>
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                접수일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  문의가 없습니다.
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inquiry.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{inquiry.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inquiry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(inquiry)}
                        className="text-blue-600 hover:text-blue-900"
                        title="상세/답변"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="text-red-600 hover:text-red-900"
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
      {isModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">문의 상세</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <div className="text-gray-900">{selectedInquiry.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처
                  </label>
                  <div className="text-gray-900">{selectedInquiry.phone}</div>
                </div>

                {selectedInquiry.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <div className="text-gray-900">{selectedInquiry.email}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    문의 내용
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-900">
                    {selectedInquiry.content}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    접수일
                  </label>
                  <div className="text-gray-900">
                    {formatDate(selectedInquiry.createdAt)}
                  </div>
                </div>

                {selectedInquiry.repliedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      답변일
                    </label>
                    <div className="text-gray-900">
                      {formatDate(selectedInquiry.repliedAt)}{" "}
                      {selectedInquiry.repliedBy && (
                        <span className="text-gray-500 text-sm">
                          (by {selectedInquiry.repliedBy})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">대기중</option>
                    <option value="REPLIED">답변완료</option>
                    <option value="CLOSED">종료</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    관리자 답변
                  </label>
                  <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="답변 내용을 입력하세요..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "처리 중..." : "저장"}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
