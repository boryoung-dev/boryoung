"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { admin, isLoading, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-[color:var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[color:var(--muted)] text-sm">
          <div className="w-4 h-4 border-2 border-[color:var(--border)] border-t-[color:var(--brand)] rounded-full animate-spin" />
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[color:var(--surface)] flex overflow-hidden">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          adminName={admin?.name}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
