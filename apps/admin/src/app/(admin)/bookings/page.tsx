"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Eye, CalendarCheck } from "lucide-react";
import FilterTabs from "@/components/ui/FilterTabs";

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
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}
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
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
      </div>

      {/* 필터 */}
      <div className="mb-6">
        <FilterTabs
          tabs={filterButtons.map((btn) => ({
            key: btn.value,
            label: btn.label,
            count: btn.value === ""
              ? bookings.length
              : bookings.filter((b) => b.status === btn.value).length,
          }))}
          activeTab={filter}
          onTabChange={(key) => setFilter(key)}
        />
      </div>

      {/* 예약 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm text-gray-500">
            전체 <span className="font-medium text-gray-900">{bookings.length}</span>건
          </h2>
        </div>
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">로딩 중...</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">예약이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">예약자</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상품명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">인원</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">희망일</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">신청일</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{booking.name}</div>
                      <div className="text-xs text-gray-500">{booking.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{booking.tourProduct.title}</div>
                      <div className="text-xs text-gray-500">{booking.tourProduct.destination}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.peopleCount}명</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {booking.desiredDate
                        ? new Date(booking.desiredDate).toLocaleDateString()
                        : "미정"}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
