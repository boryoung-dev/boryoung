import Link from "next/link";
import { Search, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-[60px]">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <span className="text-2xl font-bold text-[#8B5CF6]">
            Boryoung
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/tours"
            className="text-[15px] font-medium text-[#18181B] hover:text-[#8B5CF6] transition-colors"
          >
            여행상품
          </Link>
          <Link
            href="/tours?tag=special"
            className="text-[15px] font-medium text-[#71717A] hover:text-[#8B5CF6] transition-colors"
          >
            특가상품
          </Link>
          <Link
            href="/about"
            className="text-[15px] font-medium text-[#71717A] hover:text-[#8B5CF6] transition-colors"
          >
            고객후기
          </Link>
        </nav>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F5] transition-colors hover:bg-[#E4E4E7]">
            <Search className="h-5 w-5 text-[#71717A]" />
          </button>
          <Link
            href="/contact"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B5CF6] transition-opacity hover:opacity-90"
          >
            <User className="h-5 w-5 text-white" />
          </Link>

          {/* 모바일 메뉴 버튼 */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F5] md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
