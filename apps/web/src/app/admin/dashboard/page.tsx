"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalProducts: number;
  activeProducts: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  name: string;
  phone: string;
  peopleCount: number;
  status: string;
  tourProduct: {
    title: string;
    destination: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const { authHeaders } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/bookings?limit=5"),
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (bookingsData.success) setRecentBookings(bookingsData.bookings);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
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
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || ""}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">오늘 예약</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats?.todayBookings || 0}건
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">이번주 예약</div>
          <div className="text-3xl font-bold text-green-600">
            {stats?.weekBookings || 0}건
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">이번달 예약</div>
          <div className="text-3xl font-bold text-purple-600">
            {stats?.monthBookings || 0}건
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">대기 중 예약</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats?.pendingBookings || 0}건
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">전체 상품</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalProducts || 0}개
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">활성 상품</div>
          <div className="text-3xl font-bold text-indigo-600">
            {stats?.activeProducts || 0}개
          </div>
        </div>
      </div>

      {/* 최근 예약 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">최근 예약 신청</h2>
          <Link
            href="/admin/bookings"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            전체 보기
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBookings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              최근 예약 신청이 없습니다
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">
                        {booking.name}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.tourProduct.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.phone} | {booking.peopleCount}명 |{" "}
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold text-sm"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
