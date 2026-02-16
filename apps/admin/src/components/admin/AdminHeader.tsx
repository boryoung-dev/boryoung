"use client";

import { Menu, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
  adminName?: string;
  onLogout: () => void;
}

export function AdminHeader({ onMenuClick, adminName, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--bg)]/80 backdrop-blur-md border-b border-[color:var(--border)] h-14 flex items-center justify-between px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
      >
        <Menu className="w-4 h-4 text-[color:var(--fg)]" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {adminName && (
          <span className="text-[13px] text-[color:var(--muted)]">{adminName}</span>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[color:var(--muted)] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
