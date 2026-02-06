"use client";

import { Menu, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
  adminName?: string;
  onLogout: () => void;
}

export function AdminHeader({ onMenuClick, adminName, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b h-16 flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {adminName && (
          <span className="text-sm text-gray-600">{adminName}</span>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
