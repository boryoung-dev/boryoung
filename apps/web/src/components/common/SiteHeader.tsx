import { Button } from "@repo/ui";
import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="bg-[#f5f5f7] px-4 py-2 text-center text-[11px] text-[color:var(--fg)]">
        <span className="inline-block">
          신규 회원 가입 시 5% 즉시 할인 쿠폰 증정.{" "}
          <Link href="#" className="text-[color:var(--brand)] hover:underline">
            지금 가입하기 ›
          </Link>
        </span>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-lg font-semibold tracking-tight text-[color:var(--fg)]">
              Boryoung
            </span>
          </Link>

          <nav className="hidden gap-6 text-[12px] font-normal text-[color:var(--fg)] md:flex">
            {["일본", "동남아", "대만", "제주", "국내"].map((item) => (
              <Link
                key={item}
                href="#"
                className="hover:text-[color:var(--brand)] transition-colors opacity-80 hover:opacity-100"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-[color:var(--fg)] opacity-80 hover:opacity-100 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <Button variant="brand" size="sm" className="hidden sm:inline-flex h-7 px-3 text-[11px]">
              상담하기
            </Button>
            
            <button className="md:hidden text-[color:var(--fg)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
