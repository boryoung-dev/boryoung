"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Eye } from "lucide-react";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  peopleCount: number;
  desiredDate: string | null;
  status: string;
  tourProduct: {
    id: string;
    title: string;
    destination: string;
  };
  createdAt: string;
}

export default function AdminBookingsPage() {
  const { authHeaders } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchBookings();
    }
  }, [filter, authHeaders]);

  const fetchBookings = async () => {
    try {
      const url = filter
        ? `/api/bookings?status=${filter}&limit=100`
        : `/api/bookings?limit=100`;
      const response = await fetch(url, { headers: authHeaders as any });
      const data = await response.json();
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error("Bookings fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      PENDING: "접수",
      CONFIRMED: "확정",
      COMPLETED: "완료",
      CANCELLED: "취소",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const filterButtons = [
    { value: "", label: "전체" },
    { value: "PENDING", label: "접수" },
    { value: "CONFIRMED", label: "확정" },
    { value: "COMPLETED", label: "완료" },
    { value: "CANCELLED", label: "취소" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">예약 관리</h1>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">상태:</span>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  filter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            전체 {bookings.length}건
          </h2>
        </div>
        {isLoading ? (
          <div className="px-6 py-8 text-center text-gray-500">로딩 중...</div>
        ) : bookings.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            예약이 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인원
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    희망일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {booking.tourProduct.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.tourProduct.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.peopleCount}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.desiredDate
                        ? new Date(booking.desiredDate).toLocaleDateString()
                        : "미정"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="상세보기"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
