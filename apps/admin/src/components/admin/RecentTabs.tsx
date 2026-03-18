"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
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
  FileText,
  LayoutGrid,
  Zap,
  FileUp,
  Sparkles,
} from "lucide-react";

/** 경로 -> 페이지 이름 매핑 */
const PAGE_NAME_MAP: Record<string, string> = {
  "/dashboard": "대시보드",
  "/products": "상품 관리",
  "/products/import": "엑셀 일괄등록",
  "/categories": "카테고리",
  "/tags": "태그 관리",
  "/banners": "배너 관리",
  "/blog-posts": "매거진 관리",
  "/curations": "큐레이션 관리",
  "/quick-icons": "빠른아이콘 관리",
  "/bookings": "예약 관리",
  "/reviews": "리뷰 관리",
  "/inquiries": "문의 관리",
  "/admins": "관리자",
  "/ai-settings": "AI 설정",
};

/** 경로 -> 아이콘 매핑 */
const PAGE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/products": Package,
  "/products/import": FileUp,
  "/categories": FolderTree,
  "/tags": Tags,
  "/banners": Image,
  "/blog-posts": FileText,
  "/curations": LayoutGrid,
  "/quick-icons": Zap,
  "/bookings": CalendarCheck,
  "/reviews": Star,
  "/inquiries": MessageSquare,
  "/admins": Users,
  "/ai-settings": Sparkles,
};

interface RecentTab {
  path: string;
  name: string;
}

const STORAGE_KEY = "admin-recent-tabs";
const MAX_TABS = 8;

/** 경로에서 기본 경로만 추출 (하위 경로 정규화) */
function normalizePath(path: string): string {
  // /products/import 같은 경우 그대로 유지
  if (PAGE_NAME_MAP[path]) return path;
  // /bookings/abc123 같은 하위 경로는 상위로 정규화
  for (const key of Object.keys(PAGE_NAME_MAP)) {
    if (path.startsWith(key + "/") && key !== "/products") {
      return key;
    }
  }
  // /products/xxx (import 제외)는 /products로
  if (path.startsWith("/products/") && path !== "/products/import") {
    return "/products";
  }
  return path;
}

export default function RecentTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<RecentTab[]>([]);

  // localStorage에서 탭 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTabs(JSON.parse(stored));
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  // 현재 경로를 탭 목록에 추가
  useEffect(() => {
    const normalized = normalizePath(pathname);
    const name = PAGE_NAME_MAP[normalized];
    if (!name) return; // 매핑에 없는 경로는 무시

    setTabs((prev) => {
      // 이미 존재하면 순서만 앞으로
      const filtered = prev.filter((t) => t.path !== normalized);
      const updated = [{ path: normalized, name }, ...filtered].slice(0, MAX_TABS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // localStorage 쓰기 실패 시 무시
      }
      return updated;
    });
  }, [pathname]);

  // 탭 닫기
  const handleClose = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      setTabs((prev) => {
        const updated = prev.filter((t) => t.path !== path);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // 무시
        }
        return updated;
      });
    },
    []
  );

  // 탭 클릭으로 이동
  const handleClick = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  if (tabs.length === 0) return null;

  const currentPath = normalizePath(pathname);

  return (
    <div className="flex items-center gap-0.5 px-4 h-9 bg-gray-100 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.path === currentPath;
        const Icon = PAGE_ICON_MAP[tab.path];

        return (
          <button
            key={tab.path}
            onClick={() => handleClick(tab.path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap shrink-0 transition-colors ${
              isActive
                ? "bg-white rounded-t-lg font-medium text-gray-900 border border-b-0 border-gray-200 -mb-px"
                : "text-gray-500 hover:bg-gray-200/50 rounded-t-lg cursor-pointer"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            {tab.name}
            <span
              onClick={(e) => handleClose(e, tab.path)}
              className="ml-1 p-0.5 rounded hover:bg-gray-300/50 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
