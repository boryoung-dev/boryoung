"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, Phone } from "lucide-react";

const NAV_ITEMS = [
  { label: "여행상품", href: "/tours" },
  { label: "매거진", href: "/magazine" },
  { label: "문의하기", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "bg-white"
        }`}
      >
        {/* 헤더 높이: h-16 → h-[72px] (더 여유 있게) */}
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-4 md:px-6">
          {/* 로고: SVG를 미니멀한 곡선 하나로 단순화 */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                className="text-[color:var(--brand)]"
              >
                {/* 깔끔한 곡선 하나만 유지 — 비행 궤적 */}
                <path
                  d="M4 18C4 18 8 12 14 9C20 6 23 7 23 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[17px] font-bold tracking-tight text-[color:var(--fg)]">
                (주)보령항공여행사
              </span>
            </div>
          </Link>

          {/* 데스크탑 네비게이션: rounded-lg 배경 제거 → 밑줄 인디케이터 */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-[14px] font-medium tracking-tight transition-colors ${
                    isActive
                      ? // 활성: 텍스트 + 밑줄 인디케이터
                        "text-[color:var(--fg)] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-[color:var(--fg)] after:rounded-full"
                      : // 비활성: 뮤트 색상, hover 시 전경색으로
                        "text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 우측 액션: 카톡 + 블로그 + 전화 */}
          <div className="flex items-center gap-1.5">
            {/* 카카오톡: opacity 낮추고 hover 시 선명하게 */}
            <a
              href="https://pf.kakao.com/_xgxoBxj"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--muted)] opacity-60 hover:opacity-100 hover:text-yellow-600 transition-all duration-200"
              aria-label="카카오톡 상담"
              title="카카오톡 상담"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
              </svg>
            </a>
            {/* 블로그: opacity 낮추고 hover 시 선명하게 */}
            <a
              href="https://blog.naver.com/boryoung2"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--muted)] opacity-60 hover:opacity-100 hover:text-green-600 transition-all duration-200"
              aria-label="네이버 블로그"
              title="네이버 블로그"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z"/>
              </svg>
            </a>
            {/* 전화: 아이콘 제거, 텍스트만, 전경색 사용 */}
            <a
              href="tel:1588-0320"
              className="hidden md:flex items-center h-9 px-3 rounded-lg text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors text-[13px] font-semibold tracking-tight"
              aria-label="전화 상담"
              title="전화 상담"
            >
              <span>1588-0320</span>
            </a>

            {/* 모바일 전화 */}
            <a
              href="tel:1588-0320"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors md:hidden"
              aria-label="전화 상담"
            >
              <Phone className="w-5 h-5" />
            </a>

            {/* 모바일 메뉴 토글 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors md:hidden"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 슬라이드 메뉴: top을 72px에 맞게 조정 */}
      <div
        className={`fixed top-[72px] right-0 z-40 h-[calc(100dvh-72px)] w-[280px] bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 메뉴 링크 */}
          <nav className="flex flex-col p-4 gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                    isActive
                      ? "text-[color:var(--brand)] bg-[color:var(--surface)]"
                      : "text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 하단 빠른 링크 */}
          <div className="mt-auto p-4 border-t border-[color:var(--border)] space-y-2">
            <a
              href="tel:1588-0320"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[color:var(--surface)] text-[color:var(--fg)] font-medium text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>전화 상담 1588-0320</span>
            </a>
            <div className="flex gap-2">
              <a
                href="https://pf.kakao.com/_xgxoBxj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
                </svg>
                카카오톡
              </a>
              <a
                href="https://blog.naver.com/boryoung2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z"/>
                </svg>
                블로그
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
