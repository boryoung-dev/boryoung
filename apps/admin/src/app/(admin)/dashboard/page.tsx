"use client";

import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApiQuery } from "@/hooks/useApi";
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

interface StatsResponse {
  success: boolean;
  stats: DashboardStats;
  recentInquiries: RecentInquiry[];
  productsByCategory: ProductByCategory[];
}

interface BookingsResponse {
  success: boolean;
  bookings: RecentBooking[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "접수", color: "bg-amber-500" },
  CONFIRMED: { label: "확정", color: "bg-blue-600" },
  COMPLETED: { label: "완료", color: "bg-emerald-500" },
  CANCELLED: { label: "취소", color: "bg-red-400" },
};

const inquiryStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "bg-amber-500" },
  REPLIED: { label: "답변완료", color: "bg-emerald-500" },
  CLOSED: { label: "종료", color: "bg-gray-400" },
};

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
  const { token } = useAdminAuth();

  const { data: statsData, isLoading: statsLoading } =
    useApiQuery<StatsResponse>(["dashboard", "stats"], "/api/stats", {
      enabled: !!token,
    });

  const { data: bookingsData, isLoading: bookingsLoading } =
    useApiQuery<BookingsResponse>(
      ["dashboard", "recentBookings"],
      "/api/bookings?limit=5",
      { enabled: !!token }
    );

  const isLoading = statsLoading || bookingsLoading;

  const stats = statsData?.success ? statsData.stats : null;
  const recentInquiries = statsData?.success ? (statsData.recentInquiries ?? []) : [];
  const productsByCategory = statsData?.success ? (statsData.productsByCategory ?? []) : [];
  const recentBookings = bookingsData?.success ? bookingsData.bookings : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
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
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-xs text-gray-500">
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
              className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${action.dotColor}`} />
              <Icon className="w-4 h-4 shrink-0 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">{action.label}</span>
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
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">{card.label}</span>
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {card.value.toLocaleString()}
                <span className="text-sm font-medium text-gray-500 ml-0.5">{card.unit}</span>
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">최근 예약</h2>
              <Link
                href="/bookings"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                전체 보기
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="px-5 py-12 text-center border-t border-gray-200">
                <CalendarCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">최근 예약이 없습니다</p>
              </div>
            ) : (
              <div>
                {recentBookings.map((booking, i) => {
                  const status = statusConfig[booking.status] || statusConfig.PENDING;
                  return (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                        i > 0 ? "border-t border-gray-100" : "border-t border-gray-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{booking.name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{booking.tourProduct.title}</p>
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />{booking.peopleCount}명
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />{booking.tourProduct.destination}
                          </span>
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 최근 문의 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">최근 문의</h2>
                {(stats?.pendingInquiries || 0) > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {stats?.pendingInquiries}
                  </span>
                )}
              </div>
              <Link
                href="/inquiries"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                전체 보기
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="px-5 py-12 text-center border-t border-gray-200">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">최근 문의가 없습니다</p>
              </div>
            ) : (
              <div>
                {recentInquiries.map((inquiry, i) => {
                  const status = inquiryStatusConfig[inquiry.status] || inquiryStatusConfig.PENDING;
                  return (
                    <Link
                      key={inquiry.id}
                      href={`/inquiries`}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                        i > 0 ? "border-t border-gray-100" : "border-t border-gray-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{inquiry.name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{inquiry.content}</p>
                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-gray-500">
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
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 국가별 상품 분포 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">국가별 활성 상품</h2>
            </div>

            {productsByCategory.length === 0 ? (
              <div className="px-5 py-12 text-center border-t border-gray-200">
                <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">등록된 상품이 없습니다</p>
              </div>
            ) : (
              <div className="px-5 pb-5 space-y-3 border-t border-gray-200 pt-4">
                {productsByCategory
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.destination}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-900">
                          {destinationLabels[item.destination] || item.destination}
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {item.count}개
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / maxProductCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 요약 정보 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">운영 요약</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">전체 상품</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalProducts || 0}개</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">활성 상품</span>
                <span className="text-sm font-bold text-emerald-600">{stats?.activeProducts || 0}개</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">전체 문의</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalInquiries || 0}건</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">미답변 문의</span>
                <span className={`text-sm font-bold ${(stats?.pendingInquiries || 0) > 0 ? "text-rose-600" : "text-gray-900"}`}>
                  {stats?.pendingInquiries || 0}건
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">이번달 예약</span>
                <span className="text-sm font-bold text-blue-600">{stats?.monthBookings || 0}건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
