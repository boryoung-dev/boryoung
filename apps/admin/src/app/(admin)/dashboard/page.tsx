"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Clock,
  Package,
  PackageCheck,
  ArrowRight,
  Users,
  MapPin,
} from "lucide-react";

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

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "접수", color: "bg-amber-500" },
  CONFIRMED: { label: "확정", color: "bg-[color:var(--brand)]" },
  COMPLETED: { label: "완료", color: "bg-emerald-500" },
  CANCELLED: { label: "취소", color: "bg-red-400" },
};

export default function AdminDashboard() {
  const { authHeaders } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(authHeaders).length > 0) {
      fetchDashboardData();
    }
  }, [authHeaders]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch("/api/stats", { headers: authHeaders as any }),
        fetch("/api/bookings?limit=5", { headers: authHeaders as any }),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[color:var(--muted)] text-sm">
          <div className="w-4 h-4 border-2 border-[color:var(--border)] border-t-[color:var(--brand)] rounded-full animate-spin" />
          불러오는 중...
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "오늘 예약", value: stats?.todayBookings || 0, unit: "건", icon: CalendarCheck },
    { label: "이번주 예약", value: stats?.weekBookings || 0, unit: "건", icon: CalendarDays },
    { label: "이번달 예약", value: stats?.monthBookings || 0, unit: "건", icon: CalendarRange },
    { label: "대기 중", value: stats?.pendingBookings || 0, unit: "건", icon: Clock },
    { label: "전체 상품", value: stats?.totalProducts || 0, unit: "개", icon: Package },
    { label: "활성 상품", value: stats?.activeProducts || 0, unit: "개", icon: PackageCheck },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-xl font-bold text-[color:var(--fg)]">대시보드</h1>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[color:var(--bg)] rounded-xl border border-[color:var(--border)] p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-medium text-[color:var(--muted)]">{card.label}</span>
                <div className="p-1.5 rounded-lg bg-[color:var(--surface)]">
                  <Icon className="w-3.5 h-3.5 text-[color:var(--muted)]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[color:var(--fg)] tracking-tight">
                {card.value.toLocaleString()}
                <span className="text-sm font-medium text-[color:var(--muted)] ml-0.5">{card.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* 최근 예약 */}
      <div className="bg-[color:var(--bg)] rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[color:var(--fg)]">최근 예약</h2>
          <Link
            href="/bookings"
            className="text-[12px] font-semibold text-[color:var(--brand)] hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="px-5 py-12 text-center border-t border-[color:var(--border)]">
            <CalendarCheck className="w-8 h-8 text-[color:var(--border)] mx-auto mb-2" />
            <p className="text-[13px] text-[color:var(--muted)]">최근 예약이 없습니다</p>
          </div>
        ) : (
          <div>
            {recentBookings.map((booking, i) => {
              const status = statusConfig[booking.status] || statusConfig.PENDING;
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[color:var(--surface)] transition-colors ${
                    i > 0 ? "border-t border-[color:var(--surface)]" : "border-t border-[color:var(--border)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-[color:var(--fg)]">{booking.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[color:var(--muted)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[color:var(--muted)] truncate">{booking.tourProduct.title}</p>
                    <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[color:var(--muted)]">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" />{booking.peopleCount}명
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{booking.tourProduct.destination}
                      </span>
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[color:var(--border)] shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
