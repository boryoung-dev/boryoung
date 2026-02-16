import { Button } from "@repo/ui";
import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="bg-[#f5f5f7] px-4 py-2.5 text-center text-xs text-[color:var(--fg)]">
        <span className="inline-block">
          신규 회원 가입 시 5% 즉시 할인 쿠폰 증정.{" "}
          <Link href="#" className="text-[color:var(--brand)] hover:underline font-medium">
            지금 가입하기 ›
          </Link>
        </span>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--bg)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-xl font-bold tracking-tight text-[color:var(--fg)]">
              Boryoung
            </span>
          </Link>

          <nav className="hidden gap-8 text-sm font-medium text-[color:var(--fg)] md:flex">
            {[
              { label: "일본", slug: "japan-golf" },
              { label: "동남아", slug: "southeast-asia" },
              { label: "대만", slug: "taiwan-golf" },
              { label: "제주", slug: "jeju-golf" },
              { label: "국내", slug: "korea-golf" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/tours?category=${item.slug}`}
                className="hover:text-[color:var(--brand)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button className="text-[color:var(--fg)] hover:text-[color:var(--brand)] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <Button variant="brand" size="sm" className="hidden sm:inline-flex h-9 px-5 text-sm font-medium">
              상담하기
            </Button>

            <button className="md:hidden text-[color:var(--fg)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
