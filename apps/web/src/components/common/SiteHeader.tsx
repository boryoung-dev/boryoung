"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, Phone } from "lucide-react";

const NAV_ITEMS = [
  { label: "여행상품", href: "/tours" },
  { label: "매거진", href: "/magazine" },
  { label: "회사소개", href: "/about" },
  { label: "문의하기", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      // 스크롤 다운 시 헤더 숨김, 스크롤 업 시 등장
      if (currentY > 100 && currentY > lastScrollY.current + 5) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 5) {
        setHidden(false);
      }
      setScrolled(currentY > 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴 열릴 때 스크롤 잠금
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setHidden(false); // 메뉴 열릴 때 헤더 표시
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
          hidden && !mobileOpen
            ? "-translate-y-full"
            : "translate-y-0"
        } ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "bg-white"
        }`}
      >
        <div className={`mx-auto flex max-w-[1200px] items-center justify-between px-4 md:px-6 transition-all duration-300 ${
          scrolled ? "h-[60px]" : "h-[72px]"
        }`}>
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="flex items-center gap-2">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                className="text-[color:var(--brand)] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
              >
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

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-[14px] font-medium tracking-tight transition-colors group"
                >
                  <span className={isActive ? "text-[color:var(--fg)]" : "text-[color:var(--muted)] group-hover:text-[color:var(--fg)]"}>
                    {item.label}
                  </span>
                  {/* 밑줄 애니메이션: 활성 시 표시, 호버 시 확장 */}
                  <span className={`absolute bottom-0 left-1/2 h-[2px] rounded-full bg-[color:var(--fg)] transition-all duration-300 ease-out ${
                    isActive
                      ? "w-5 -translate-x-1/2"
                      : "w-0 -translate-x-1/2 group-hover:w-4"
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-1.5">
            {/* 카카오톡 */}
            <a
              href="https://pf.kakao.com/_xgxoBxj"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] opacity-50 hover:opacity-100 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-300"
              aria-label="카카오톡 상담"
              title="카카오톡 상담"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z"/>
              </svg>
            </a>
            {/* 블로그 */}
            <a
              href="https://blog.naver.com/boryoung2"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] opacity-50 hover:opacity-100 hover:text-green-600 hover:bg-green-50 transition-all duration-300"
              aria-label="네이버 블로그"
              title="네이버 블로그"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z"/>
              </svg>
            </a>
            {/* 전화 */}
            <a
              href="tel:1588-0320"
              className="hidden md:flex items-center h-8 px-4 rounded-full bg-[color:var(--surface)] hover:bg-[color:var(--border)]/50 text-[color:var(--fg)] transition-all duration-300 text-[13px] font-semibold tracking-tight"
              aria-label="전화 상담"
              title="전화 상담"
            >
              1588-0320
            </a>

            {/* 모바일 전화 */}
            <a
              href="tel:1588-0320"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors md:hidden"
              aria-label="전화 상담"
            >
              <Phone className="w-5 h-5" />
            </a>

            {/* 모바일 메뉴 토글 */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors md:hidden"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              <div className="relative w-5 h-5">
                {/* 햄버거 → X 애니메이션 */}
                <span className={`absolute left-0 block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "top-[9px] rotate-45" : "top-[4px] rotate-0"
                }`} />
                <span className={`absolute left-0 top-[9px] block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                }`} />
                <span className={`absolute left-0 block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "top-[9px] -rotate-45" : "top-[14px] rotate-0"
                }`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* 모바일 슬라이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-[300px] bg-white shadow-2xl transition-transform duration-500 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20">
          {/* 메뉴 링크 */}
          <nav className="flex flex-col px-6 gap-1">
            {NAV_ITEMS.map((item, i) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
                    isActive
                      ? "text-[color:var(--fg)] bg-[color:var(--surface)]"
                      : "text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                  }`}
                  style={{ transitionDelay: mobileOpen ? `${i * 50 + 100}ms` : "0ms" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 하단 빠른 링크 */}
          <div className="mt-auto p-6 border-t border-[color:var(--border)] space-y-3">
            <a
              href="tel:1588-0320"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[color:var(--fg)] text-white font-medium text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>전화 상담 1588-0320</span>
            </a>
            <div className="flex gap-2">
              <a
                href="https://pf.kakao.com/_xgxoBxj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FEE500] text-[#371D1E] text-xs font-medium"
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
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#03C75A] text-white text-xs font-medium"
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
