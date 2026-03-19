import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#111] text-white/70 text-sm">
      {/* 메인 푸터: 3컬럼 그리드 */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* 좌측: 로고 + 회사 소개 */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit transition-opacity hover:opacity-80">
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
            <p className="text-white/50 leading-relaxed text-sm">
              22년 전통 골프여행 전문 여행사.<br />
              일본·동남아·대만·국내 명문 골프장과<br />
              직접 제휴한 최상의 골프 투어를 제공합니다.
            </p>
          </div>

          {/* 중앙: 사이트맵 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white/40 uppercase tracking-widest text-[11px] font-medium">사이트맵</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/tours" className="text-white/60 hover:text-white transition-colors">
                여행상품
              </Link>
              <Link href="/magazine" className="text-white/60 hover:text-white transition-colors">
                매거진
              </Link>
              <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                회사소개
              </Link>
              <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                문의하기
              </Link>
              <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
                개인정보취급방침
              </Link>
            </nav>
          </div>

          {/* 우측: 연락처 + SNS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white/40 uppercase tracking-widest text-[11px] font-medium">연락처</h3>
            <div className="flex flex-col gap-1.5 leading-relaxed text-white/60">
              <p>
                대표전화&nbsp;
                <a
                  href="tel:1588-0320"
                  className="text-white font-medium hover:underline"
                >
                  1588-0320
                </a>
              </p>
              <p>
                직통&nbsp;
                <a
                  href="tel:02-730-1220"
                  className="text-white font-medium hover:underline"
                >
                  02-730-1220
                </a>
              </p>
              <p>
                야간/휴일&nbsp;
                <a
                  href="tel:010-5514-5831"
                  className="text-white font-medium hover:underline"
                >
                  010-5514-5831
                </a>
              </p>
            </div>

            {/* SNS 링크 */}
            <div className="flex items-center gap-4 mt-1">
              {/* 카카오톡 채널 */}
              <a
                href="https://pf.kakao.com/_xgxoBxj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오톡 채널"
                title="카카오톡 채널"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.26.54.52.37l4.17-2.74c.53.06 1.06.09 1.61.09 5.52 0 10-3.58 10-7.95C22 6.58 17.52 3 12 3z" />
                </svg>
              </a>
              {/* 네이버 블로그 */}
              <a
                href="https://blog.naver.com/boryoung2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="네이버 블로그"
                title="네이버 블로그"
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 0h16a2 2 0 012 2v16a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm4.5 14.5V8.25L11 14.5h2.5V5.5h-2v6.25L7 5.5H4.5v9z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 구분선 + 사업자 정보 + copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-1 leading-relaxed text-xs text-white/30">
          <p>
            사업자등록번호 : 117-81-52746 | 통신판매번호 : 제2013-경기김포-0560호
          </p>
          <p>
            국외여행업등록번호 : 2013-000008 | 국내여행업등록번호 : 2013-000005
          </p>
          <p>
            대표자 : 이종양 | 개인정보책임자 : 이종양 |{" "}
            <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
              개인정보취급방침
            </Link>
          </p>
          <p>
            주소 : 경기도 김포시 태장로 795번길 23, 537호(장기동)
          </p>
          <p className="mt-3">
            &copy; 2026 boryoung.com All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
