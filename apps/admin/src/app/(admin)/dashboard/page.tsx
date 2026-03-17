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
  MessageSquare,
  Plus,
  FileText,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalProducts: number;
  activeProducts: number;
  pendingBookings: number;
  pendingInquiries: number;
  totalInquiries: number;
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

interface RecentInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  content: string;
  status: string;
  createdAt: string;
}

interface ProductByCategory {
  destination: string;
  count: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "접수", color: "bg-amber-500" },
  CONFIRMED: { label: "확정", color: "bg-[color:var(--brand)]" },
  COMPLETED: { label: "완료", color: "bg-emerald-500" },
  CANCELLED: { label: "취소", color: "bg-red-400" },
};

const inquiryStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "bg-amber-500" },
  REPLIED: { label: "답변완료", color: "bg-emerald-500" },
  CLOSED: { label: "종료", color: "bg-gray-400" },
};

// 국가 이름 매핑
const destinationLabels: Record<string, string> = {
  JAPAN: "일본",
  VIETNAM: "베트남",
  THAILAND: "태국",
  TAIWAN: "대만",
  PHILIPPINES: "필리핀",
  GUAM: "괌·사이판",
  CHINA: "중국",
  INDONESIA: "인도네시아",
};

export default function AdminDashboard() {
  const { authHeaders } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<ProductByCategory[]>([]);
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

      if (statsData.success) {
        setStats(statsData.stats);
        setRecentInquiries(statsData.recentInquiries || []);
        setProductsByCategory(statsData.productsByCategory || []);
      }
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
    { label: "오늘 예약", value: stats?.todayBookings || 0, unit: "건", icon: CalendarCheck, color: "text-blue-600" },
    { label: "이번주 예약", value: stats?.weekBookings || 0, unit: "건", icon: CalendarDays, color: "text-indigo-600" },
    { label: "이번달 예약", value: stats?.monthBookings || 0, unit: "건", icon: CalendarRange, color: "text-violet-600" },
    { label: "대기 중 예약", value: stats?.pendingBookings || 0, unit: "건", icon: Clock, color: "text-amber-600" },
    { label: "대기 중 문의", value: stats?.pendingInquiries || 0, unit: "건", icon: MessageSquare, color: "text-rose-600" },
    { label: "활성 상품", value: stats?.activeProducts || 0, unit: `/ ${stats?.totalProducts || 0}개`, icon: PackageCheck, color: "text-emerald-600" },
  ];

  const quickActions = [
    { label: "상품 추가", href: "/products/new", icon: Plus, dotColor: "bg-blue-500" },
    { label: "문의 관리", href: "/inquiries", icon: MessageSquare, dotColor: "bg-rose-500" },
    { label: "상품 관리", href: "/products", icon: Package, dotColor: "bg-violet-500" },
    { label: "리뷰 관리", href: "/reviews", icon: FileText, dotColor: "bg-emerald-500" },
  ];

  const maxProductCount = Math.max(...productsByCategory.map(p => p.count), 1);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[color:var(--fg)]">대시보드</h1>
        <p className="text-xs text-[color:var(--muted)]">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-[color:var(--border)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${action.dotColor}`} />
              <Icon className="w-4 h-4 shrink-0 text-[color:var(--muted)]" />
              <span className="text-sm font-semibold text-[color:var(--fg)]">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 통계 카드 */}
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
                <div className={`p-1.5 rounded-lg bg-[color:var(--surface)]`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
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

      {/* 하단 2열: 최근 예약 + 최근 문의 / 국가별 상품 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 왼쪽: 최근 예약 + 최근 문의 */}
        <div className="lg:col-span-2 space-y-4">
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

          {/* 최근 문의 */}
          <div className="bg-[color:var(--bg)] rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-[color:var(--fg)]">최근 문의</h2>
                {(stats?.pendingInquiries || 0) > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {stats?.pendingInquiries}
                  </span>
                )}
              </div>
              <Link
                href="/inquiries"
                className="text-[12px] font-semibold text-[color:var(--brand)] hover:underline"
              >
                전체 보기
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="px-5 py-12 text-center border-t border-[color:var(--border)]">
                <MessageSquare className="w-8 h-8 text-[color:var(--border)] mx-auto mb-2" />
                <p className="text-[13px] text-[color:var(--muted)]">최근 문의가 없습니다</p>
              </div>
            ) : (
              <div>
                {recentInquiries.map((inquiry, i) => {
                  const status = inquiryStatusConfig[inquiry.status] || inquiryStatusConfig.PENDING;
                  return (
                    <Link
                      key={inquiry.id}
                      href={`/inquiries`}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[color:var(--surface)] transition-colors ${
                        i > 0 ? "border-t border-[color:var(--surface)]" : "border-t border-[color:var(--border)]"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-[color:var(--fg)]">{inquiry.name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[color:var(--muted)]">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-[color:var(--muted)] truncate">{inquiry.content}</p>
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[color:var(--muted)]">
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />{inquiry.phone}
                          </span>
                          {inquiry.email && (
                            <span className="flex items-center gap-0.5">
                              <Mail className="w-3 h-3" />{inquiry.email}
                            </span>
                          )}
                          <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
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

        {/* 오른쪽: 국가별 상품 분포 */}
        <div className="space-y-4">
          <div className="bg-[color:var(--bg)] rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="text-[15px] font-bold text-[color:var(--fg)]">국가별 활성 상품</h2>
            </div>

            {productsByCategory.length === 0 ? (
              <div className="px-5 py-12 text-center border-t border-[color:var(--border)]">
                <Globe className="w-8 h-8 text-[color:var(--border)] mx-auto mb-2" />
                <p className="text-[13px] text-[color:var(--muted)]">등록된 상품이 없습니다</p>
              </div>
            ) : (
              <div className="px-5 pb-5 space-y-3 border-t border-[color:var(--border)] pt-4">
                {productsByCategory
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.destination}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-medium text-[color:var(--fg)]">
                          {destinationLabels[item.destination] || item.destination}
                        </span>
                        <span className="text-[12px] font-bold text-[color:var(--fg)]">
                          {item.count}개
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[color:var(--surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[color:var(--brand)] rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / maxProductCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 요약 정보 카드 */}
          <div className="bg-[color:var(--bg)] rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-card)] p-5">
            <h2 className="text-[15px] font-bold text-[color:var(--fg)] mb-4">운영 요약</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[color:var(--muted)]">전체 상품</span>
                <span className="text-[13px] font-bold text-[color:var(--fg)]">{stats?.totalProducts || 0}개</span>
              </div>
              <div className="h-px bg-[color:var(--surface)]" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[color:var(--muted)]">활성 상품</span>
                <span className="text-[13px] font-bold text-emerald-600">{stats?.activeProducts || 0}개</span>
              </div>
              <div className="h-px bg-[color:var(--surface)]" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[color:var(--muted)]">전체 문의</span>
                <span className="text-[13px] font-bold text-[color:var(--fg)]">{stats?.totalInquiries || 0}건</span>
              </div>
              <div className="h-px bg-[color:var(--surface)]" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[color:var(--muted)]">미답변 문의</span>
                <span className={`text-[13px] font-bold ${(stats?.pendingInquiries || 0) > 0 ? "text-rose-600" : "text-[color:var(--fg)]"}`}>
                  {stats?.pendingInquiries || 0}건
                </span>
              </div>
              <div className="h-px bg-[color:var(--surface)]" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[color:var(--muted)]">이번달 예약</span>
                <span className="text-[13px] font-bold text-[color:var(--brand)]">{stats?.monthBookings || 0}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
