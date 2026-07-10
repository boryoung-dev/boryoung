"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Youtube } from "lucide-react";

const YOUTUBE_URL =
  "https://www.youtube.com/@%EB%B3%B4%EB%A0%B9%ED%95%AD%EA%B3%B5%EC%97%AC%ED%96%89%EC%82%AC";

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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
          hidden && !mobileOpen ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled
            ? "bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur-xl"
            : "bg-white"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-all duration-300 md:px-8 ${
            scrolled ? "h-[74px]" : "h-[92px]"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3">
            <svg
              width="34"
              height="34"
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
            <span className="text-[20px] font-bold tracking-tight text-[color:var(--fg)] md:text-[22px]">
              (주)보령항공여행사
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative px-4 py-3 text-[18px] font-semibold tracking-tight transition-colors"
                >
                  <span
                    className={
                      isActive
                        ? "text-[color:var(--fg)]"
                        : "text-[color:var(--muted)] group-hover:text-[color:var(--fg)]"
                    }
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute bottom-1 left-1/2 h-[2px] rounded-full bg-[color:var(--fg)] transition-all duration-300 ease-out ${
                      isActive
                        ? "w-7 -translate-x-1/2"
                        : "w-0 -translate-x-1/2 group-hover:w-6"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://pf.kakao.com/_XaITs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[color:var(--muted)] opacity-75 transition-all duration-300 hover:bg-yellow-50 hover:text-yellow-600 hover:opacity-100 md:flex"
              aria-label="카카오톡 상담"
              title="카카오톡 상담"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z" />
              </svg>
            </a>
            <a
              href="https://blog.naver.com/boryoung2"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[color:var(--muted)] opacity-75 transition-all duration-300 hover:bg-green-50 hover:text-green-600 hover:opacity-100 md:flex"
              aria-label="네이버 블로그"
              title="네이버 블로그"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z" />
              </svg>
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[color:var(--muted)] opacity-75 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:opacity-100 md:flex"
              aria-label="유튜브 채널"
              title="유튜브 채널"
            >
              <Youtube className="h-[22px] w-[22px]" />
            </a>
            <a
              href="tel:1588-0320"
              className="hidden h-12 items-center rounded-full bg-[color:var(--surface)] px-5 text-[17px] font-bold tracking-tight text-[color:var(--fg)] transition-all duration-300 hover:bg-[color:var(--border)]/50 md:flex"
              aria-label="전화 상담"
              title="전화 상담"
            >
              1588-0320
            </a>

            <a
              href="tel:1588-0320"
              className="flex h-12 w-12 items-center justify-center rounded-full text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)] md:hidden"
              aria-label="전화 상담"
            >
              <Phone className="h-6 w-6" />
            </a>

            <button
              type="button"
              onClick={() => {
                const nextOpen = !mobileOpen;
                setMobileOpen(nextOpen);
                if (nextOpen) setHidden(false);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)] md:hidden"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              <div className="relative h-6 w-6">
                <span
                  className={`absolute left-0 block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-[11px] rotate-45" : "top-[5px] rotate-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[11px] block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-[11px] -rotate-45" : "top-[17px] rotate-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`fixed right-0 top-0 z-40 h-full w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col pt-24">
          <nav className="flex flex-col gap-2 px-6">
            {NAV_ITEMS.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-4 text-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[color:var(--surface)] text-[color:var(--fg)]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${index * 50 + 100}ms` : "0ms",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-[color:var(--border)] p-6">
            <a
              href="tel:1588-0320"
              className="flex items-center gap-2 rounded-xl bg-[color:var(--fg)] px-4 py-4 text-base font-bold text-white"
            >
              <Phone className="h-5 w-5" />
              <span>전화 상담 1588-0320</span>
            </a>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://pf.kakao.com/_XaITs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl bg-[#FEE500] px-2 py-3 text-sm font-bold text-[#371D1E]"
              >
                카카오톡
              </a>
              <a
                href="https://blog.naver.com/boryoung2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl bg-[#03C75A] px-2 py-3 text-sm font-bold text-white"
              >
                블로그
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl bg-[#FF0000] px-2 py-3 text-sm font-bold text-white"
              >
                유튜브
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
