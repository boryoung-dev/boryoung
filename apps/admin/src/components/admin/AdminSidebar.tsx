"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  CalendarCheck,
  ExternalLink,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/products", label: "상품 관리", icon: Package },
  { href: "/categories", label: "카테고리", icon: FolderTree },
  { href: "/bookings", label: "예약 관리", icon: CalendarCheck },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ open, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

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

        {/* 네비게이션 */}
        <nav className={`flex-1 pt-2 space-y-0.5 overflow-y-auto ${collapsed ? "px-1.5" : "px-3"}`}>
          {navItems.map((item) => {
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
        </nav>

        {/* 하단 */}
        <div className={`shrink-0 border-t border-[color:var(--border)] ${collapsed ? "px-1.5 py-2" : "px-3 py-3"} space-y-0.5`}>
          {!collapsed && (
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              사이트 바로가기
            </Link>
          )}
          {collapsed && (
            <Link
              href="/"
              target="_blank"
              title="사이트 바로가기"
              className="flex items-center justify-center p-2.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:bg-[color:var(--surface)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
