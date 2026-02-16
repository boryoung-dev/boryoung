"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";

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
      alert("리뷰 목록을 불러오는데 실패했습니다.");
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
        alert("리뷰가 수정되었습니다.");
        setIsEditModalOpen(false);
        setEditingReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      alert("리뷰 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

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
        alert("리뷰가 삭제되었습니다.");
        fetchReviews();
      }
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제에 실패했습니다.");
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
      alert("공개 상태 변경에 실패했습니다.");
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">리뷰 관리</h1>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-md ${
            statusFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          전체 ({reviews.length})
        </button>
        <button
          onClick={() => setStatusFilter("published")}
          className={`px-4 py-2 rounded-md ${
            statusFilter === "published"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          공개 ({reviews.filter((r) => r.isPublished).length})
        </button>
        <button
          onClick={() => setStatusFilter("unpublished")}
          className={`px-4 py-2 rounded-md ${
            statusFilter === "unpublished"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          비공개 ({reviews.filter((r) => !r.isPublished).length})
        </button>
      </div>

      {/* 리뷰 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                별점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공개
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                인증
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.product.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {review.product.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.authorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {review.title && (
                        <div className="font-medium mb-1">
                          {truncateText(review.title, 30)}
                        </div>
                      )}
                      <div className="text-gray-600">
                        {truncateText(review.content, 50)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(review)}
                      className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium ${
                        review.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {review.isPublished ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          공개
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          비공개
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        review.isVerified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {review.isVerified ? "인증됨" : "미인증"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-900"
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
      {isEditModalOpen && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">리뷰 수정</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">
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
                      setEditFormData({
                        ...editFormData,
                        authorName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    별점 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.rating}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>★★★★★ (5점)</option>
                    <option value={4}>★★★★☆ (4점)</option>
                    <option value={3}>★★★☆☆ (3점)</option>
                    <option value={2}>★★☆☆☆ (2점)</option>
                    <option value={1}>★☆☆☆☆ (1점)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editFormData.content}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        content: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    여행 날짜
                  </label>
                  <input
                    type="date"
                    value={editFormData.travelDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        travelDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.isVerified}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isVerified: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      인증된 리뷰
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.isPublished}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      공개
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
