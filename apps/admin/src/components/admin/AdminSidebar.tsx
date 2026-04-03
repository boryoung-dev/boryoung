"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  CalendarCheck,
  Tags,
  Star,
  MessageSquare,
  Users,
  Image,
  ExternalLink,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  LayoutGrid,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// 메뉴를 그룹으로 묶어 가독성 향상
const navGroups = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "상품",
    items: [
      { href: "/products", label: "상품 관리", icon: Package },
      { href: "/categories", label: "카테고리 (국가/지역)", icon: FolderTree },
      { href: "/tags", label: "태그 관리", icon: Tags },
    ],
  },
  {
    label: "홈페이지 관리",
    items: [
      { href: "/curations", label: "홈페이지 에디터", icon: LayoutGrid },
      { href: "/banners", label: "배너 관리", icon: Image },
    ],
  },
  {
    label: "콘텐츠",
    items: [
      { href: "/blog-posts", label: "매거진 관리", icon: FileText },
    ],
  },
  {
    label: "고객",
    items: [
      { href: "/bookings", label: "예약 관리", icon: CalendarCheck },
      { href: "/reviews", label: "리뷰 관리", icon: Star },
      { href: "/inquiries", label: "문의 관리", icon: MessageSquare },
    ],
  },
  {
    label: "설정",
    items: [
      { href: "/admins", label: "관리자", icon: Users },
      { href: "/ai-settings", label: "AI 설정", icon: Sparkles },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ open, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[color:var(--bg)] border-r border-[color:var(--border)] transform transition-all duration-200 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[60px]" : "w-[220px]"}`}
      >
        {/* 로고 */}
        <div className={`flex items-center h-14 shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
              title="사이드바 펼치기"
            >
              <PanelLeftOpen className="w-4 h-4 text-[color:var(--muted)]" />
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[color:var(--fg)] tracking-tight">
                  보령항공여행
                </span>
                <span className="text-[10px] font-semibold text-[color:var(--brand)] bg-[color:var(--brand)]/10 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:block p-1.5 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
                  title="사이드바 접기"
                >
                  <PanelLeftClose className="w-4 h-4 text-[color:var(--muted)]" />
                </button>
                <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-[color:var(--surface)]">
                  <X className="w-4 h-4 text-[color:var(--muted)]" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 네비게이션 - 그룹별 렌더링 */}
        <nav className={`flex-1 pt-2 overflow-y-auto ${collapsed ? "px-1.5" : "px-3"}`}>
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {/* 확장 상태: 그룹 레이블 표시 */}
              {group.label && !collapsed && (
                <div className="px-3 mb-1 text-[10px] font-semibold text-[color:var(--muted)] uppercase tracking-widest">
                  {group.label}
                </div>
              )}
              {/* 접힌 상태: 그룹 구분선 표시 */}
              {group.label && collapsed && gi > 0 && (
                <div className="mx-2 mb-2 border-t border-[color:var(--border)]" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-lg text-[13px] font-medium transition-colors ${
                        collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-[color:var(--brand)] text-white"
                          : "text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : ""}`} />
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 하단 */}
        <div className={`shrink-0 border-t border-[color:var(--border)] ${collapsed ? "px-1.5 py-2" : "px-3 py-3"} space-y-0.5`}>
          {!collapsed && (
            <Link
              href={process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              사이트 바로가기
            </Link>
          )}
          {collapsed && (
            <Link
              href={process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}
              target="_blank"
              title="사이트 바로가기"
              className="flex items-center justify-center p-2.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          {!collapsed ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[color:var(--muted)] hover:text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              로그아웃
            </button>
          ) : (
            <button
              onClick={logout}
              title="로그아웃"
              className="flex items-center justify-center p-2.5 rounded-lg text-[color:var(--muted)] hover:text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
