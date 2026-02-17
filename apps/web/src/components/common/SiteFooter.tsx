import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-10 text-sm text-gray-500">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-lg font-bold tracking-tight text-gray-800">
          (주)보령항공여행사
        </div>

        <div className="space-y-1 leading-relaxed">
          <p>
            사업자등록번호 : 117-81-52746 | 통신판매번호 : 제2013-경기김포-0560호
          </p>
          <p>
            국외여행업등록번호 : 2013-000008 | 국내여행업등록번호 : 2013-000005
          </p>
          <p>
            대표자 : 이종양 | 개인정보책임자 : 이종양 |{" "}
            <Link href="/privacy" className="text-yellow-600 font-semibold hover:underline">
              개인정보취급방침
            </Link>
          </p>
          <p>
            주소 : 경기도 김포시 태장로 795번길 23, 537호(장기동)
          </p>
          <p>
            대표전화 :{" "}
            <a href="tel:1588-0320" className="text-gray-700 font-medium hover:underline">
              1588-0320
            </a>{" "}
            | 직통 :{" "}
            <a href="tel:02-730-1220" className="text-gray-700 font-medium hover:underline">
              02-730-1220
            </a>{" "}
            | 팩스 : 02-2647-2083 | 야간/휴일 :{" "}
            <a href="tel:010-5514-5831" className="text-gray-700 font-medium hover:underline">
              010-5514-5831
            </a>
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          &copy; 2009 boryoung.com All rights reserved.
        </p>
      </div>
    </footer>
  );
}
