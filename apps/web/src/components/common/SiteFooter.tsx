import Link from "next/link";
import { Youtube } from "lucide-react";

const YOUTUBE_URL =
  "https://www.youtube.com/@%EB%B3%B4%EB%A0%B9%ED%95%AD%EA%B3%B5%EC%97%AC%ED%96%89%EC%82%AC";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#111] text-sm text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 transition-opacity hover:opacity-80"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="14" cy="14" r="13" fill="white" opacity="0.08" />
                <circle cx="14" cy="14" r="9" fill="white" opacity="0.12" />
                <path
                  d="M6 14 Q14 4 22 14 Q14 24 6 14Z"
                  fill="white"
                  opacity="0.5"
                />
                <path
                  d="M14 5 Q24 14 14 23 Q4 14 14 5Z"
                  fill="white"
                  opacity="0.35"
                />
                <circle cx="14" cy="14" r="3" fill="white" opacity="0.7" />
                <path
                  d="M14 6 L14 22"
                  stroke="white"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <path
                  d="M6 14 L22 14"
                  stroke="white"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.25"
                />
              </svg>
              <span className="text-base font-semibold tracking-tight text-white">
                (주)보령항공여행사
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              23년 전통 골프여행 전문 여행사.
              <br />
              일본, 동남아, 중국, 미주 등 전세계 및 국내 명문 골프장과
              <br />
              직접 제휴한 최상의 골프 투어를 제공합니다.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              사이트맵
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/tours"
                className="text-white/60 transition-colors hover:text-white"
              >
                여행상품
              </Link>
              <Link
                href="/magazine"
                className="text-white/60 transition-colors hover:text-white"
              >
                매거진
              </Link>
              <Link
                href="/about"
                className="text-white/60 transition-colors hover:text-white"
              >
                회사소개
              </Link>
              <Link
                href="/contact"
                className="text-white/60 transition-colors hover:text-white"
              >
                문의하기
              </Link>
              <Link
                href="/privacy"
                className="text-white/50 transition-colors hover:text-white"
              >
                개인정보처리방침
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              연락처
            </h3>
            <div className="flex flex-col gap-1.5 leading-relaxed text-white/60">
              <p>
                대표번호{" "}
                <a
                  href="tel:1588-0320"
                  className="font-medium text-white hover:underline"
                >
                  1588-0320
                </a>
              </p>
              <p>
                이종양 대표이사{" "}
                <a
                  href="tel:010-5473-9037"
                  className="font-medium text-white hover:underline"
                >
                  010-5473-9037
                </a>
              </p>
              <p>
                이국호 본부장{" "}
                <a
                  href="tel:010-3041-9192"
                  className="font-medium text-white hover:underline"
                >
                  010-3041-9192
                </a>
              </p>
            </div>

            <div className="mt-1 flex items-center gap-4">
              <a
                href="https://pf.kakao.com/_XaITs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오톡 채널"
                title="카카오톡 채널"
                className="text-white/40 transition-colors hover:text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z" />
                </svg>
              </a>
              <a
                href="https://blog.naver.com/boryoung2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="네이버 블로그"
                title="네이버 블로그"
                className="text-white/40 transition-colors hover:text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z" />
                </svg>
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="유튜브 채널"
                title="유튜브 채널"
                className="text-white/40 transition-colors hover:text-white"
              >
                <Youtube className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl space-y-1 px-6 py-6 text-xs leading-relaxed text-white/30">
          <p>
            사업자등록번호 : 117-81-52746 | 통신판매번호 :
            제2013-경기김포-0560호
          </p>
          <p>
            국외여행업등록번호 : 2013-000008 | 국내여행업등록번호 :
            2013-000005
          </p>
          <p>
            대표자 : 이종양 | 개인정보책임자 : 이종양 |{" "}
            <Link
              href="/privacy"
              className="text-white/50 transition-colors hover:text-white"
            >
              개인정보처리방침
            </Link>
          </p>
          <p>주소 : 경기도 김포시 태장로795번길 23, 537호</p>
          <p className="mt-3">&copy; 2026 boryoung.com All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
