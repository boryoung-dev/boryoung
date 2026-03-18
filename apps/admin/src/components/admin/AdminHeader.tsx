"use client";

import { Menu } from "lucide-react";
import RecentTabs from "./RecentTabs";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--bg)]/80 backdrop-blur-md border-b border-[color:var(--border)] h-11 flex items-center px-4 shrink-0 gap-2">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-[color:var(--surface)] transition-colors"
      >
        <Menu className="w-4 h-4 text-[color:var(--fg)]" />
      </button>

      <div className="flex-1 min-w-0">
        <RecentTabs />
      </div>
    </header>
  );
}
