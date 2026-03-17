"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Pencil, Trash2, Eye, EyeOff, MessageSquare } from "lucide-react";
import Select from "@/components/ui/Select";
import Modal, { ModalCancelButton, ModalConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmModal";

interface Product {
  id: string;
  title: string;
  destination: string;
}

interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  travelDate: string | null;
  isVerified: boolean;
  isPublished: boolean;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  authorName: string;
  rating: number;
  title: string;
  content: string;
  travelDate: string;
  isVerified: boolean;
  isPublished: boolean;
}

export default function ReviewsPage() {
  const { authHeaders } = useAdminAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "unpublished">("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    authorName: "",
    rating: 5,
    title: "",
    content: "",
    travelDate: "",
    isVerified: false,
    isPublished: false,
  });

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchReviews();
    }
  }, [authHeaders]);

  useEffect(() => {
    applyFilter();
  }, [statusFilter, reviews]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/reviews?limit=100&offset=0", {
        headers: authHeaders as any,
      });

      if (!res.ok) {
        throw new Error("리뷰 목록 조회 실패");
      }

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("리뷰 조회 실패:", error);
      toast("리뷰 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    if (statusFilter === "all") {
      setFilteredReviews(reviews);
    } else if (statusFilter === "published") {
      setFilteredReviews(reviews.filter((r) => r.isPublished));
    } else {
      setFilteredReviews(reviews.filter((r) => !r.isPublished));
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditFormData({
      authorName: review.authorName,
      rating: review.rating,
      title: review.title || "",
      content: review.content,
      travelDate: review.travelDate
        ? new Date(review.travelDate).toISOString().split("T")[0]
        : "",
      isVerified: review.isVerified,
      isPublished: review.isPublished,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;

    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders as any),
        },
        body: JSON.stringify({
          authorName: editFormData.authorName,
          rating: editFormData.rating,
          title: editFormData.title || null,
          content: editFormData.content,
          travelDate: editFormData.travelDate || null,
          isVerified: editFormData.isVerified,
          isPublished: editFormData.isPublished,
        }),
      });

      if (!res.ok) {
        throw new Error("리뷰 수정 실패");
      }

      const data = await res.json();
      if (data.success) {
        toast("리뷰가 수정되었습니다.", "success");
        setIsEditModalOpen(false);
        setEditingReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      toast("리뷰 수정에 실패했습니다.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: "정말 삭제하시겠습니까?", variant: "danger", confirmText: "삭제" }))) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: authHeaders as any,
      });

      if (!res.ok) {
        throw new Error("리뷰 삭제 실패");
      }

      const data = await res.json();
      if (data.success) {
        toast("리뷰가 삭제되었습니다.", "success");
        fetchReviews();
      }
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      toast("리뷰 삭제에 실패했습니다.", "error");
    }
  };

  const handleTogglePublish = async (review: Review) => {
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders as any),
        },
        body: JSON.stringify({
          isPublished: !review.isPublished,
        }),
      });

      if (!res.ok) {
        throw new Error("공개 상태 변경 실패");
      }

      const data = await res.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error("공개 상태 변경 실패:", error);
      toast("공개 상태 변경에 실패했습니다.", "error");
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
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
        <h1 className="text-2xl font-bold text-gray-900">리뷰 관리</h1>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all" as const, label: `전체 (${reviews.length})` },
          { value: "published" as const, label: `공개 (${reviews.filter((r) => r.isPublished).length})` },
          { value: "unpublished" as const, label: `비공개 (${reviews.filter((r) => !r.isPublished).length})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === tab.value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 transition-colors"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 리뷰 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상품명</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">작성자</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">별점</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">내용</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">공개</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">인증</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">작성일</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">리뷰가 없습니다.</p>
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{review.product.title}</div>
                    <div className="text-xs text-gray-500">{review.product.destination}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{review.authorName}</td>
                  <td className="px-4 py-3 text-sm text-yellow-500">{renderStars(review.rating)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {review.title && (
                        <div className="font-medium mb-1">{truncateText(review.title, 30)}</div>
                      )}
                      <div className="text-gray-600">{truncateText(review.content, 50)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(review)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        review.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {review.isPublished ? "공개" : "비공개"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        review.isVerified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {review.isVerified ? "인증됨" : "미인증"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(review.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
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

      {/* 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen && !!editingReview}
        onClose={() => setIsEditModalOpen(false)}
        title="리뷰 수정"
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setIsEditModalOpen(false)} />
            <ModalConfirmButton onClick={handleSaveEdit}>저장</ModalConfirmButton>
          </>
        }
      >
        {editingReview && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품</label>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                {editingReview.product.title}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                작성자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editFormData.authorName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, authorName: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                별점 <span className="text-red-500">*</span>
              </label>
              <Select
                value={String(editFormData.rating)}
                onChange={(val) =>
                  setEditFormData({ ...editFormData, rating: parseInt(val) })
                }
                options={[
                  { value: "5", label: "★★★★★ (5점)" },
                  { value: "4", label: "★★★★☆ (4점)" },
                  { value: "3", label: "★★★☆☆ (3점)" },
                  { value: "2", label: "★★☆☆☆ (2점)" },
                  { value: "1", label: "★☆☆☆☆ (1점)" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editFormData.content}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, content: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">여행 날짜</label>
              <input
                type="date"
                value={editFormData.travelDate}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, travelDate: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium text-gray-700">인증된 리뷰</span>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, isVerified: !editFormData.isVerified })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editFormData.isVerified ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    editFormData.isVerified ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium text-gray-700">공개</span>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, isPublished: !editFormData.isPublished })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editFormData.isPublished ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    editFormData.isPublished ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
