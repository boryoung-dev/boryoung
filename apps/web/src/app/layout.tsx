import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 해외골프투어 전문 여행사`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // 핵심 키워드
    "골프여행", "골프투어", "해외골프여행", "해외골프투어", "골프패키지", "골프여행사", "골프투어전문",
    // 국가별 골프투어
    "일본골프여행", "일본골프투어", "태국골프여행", "태국골프투어", "베트남골프여행", "베트남골프투어",
    "대만골프여행", "대만골프투어", "괌골프여행", "사이판골프여행", "제주골프여행",
    // 도시별 골프투어
    "후쿠오카골프", "오키나와골프", "홋카이도골프", "오사카골프", "규슈골프",
    "방콕골프", "치앙마이골프", "파타야골프", "다낭골프", "호치민골프", "하노이골프",
    "타이베이골프", "타이중골프",
    // 롱테일 키워드 (검색 의도 기반)
    "동남아골프여행", "동남아골프투어", "동남아골프추천",
    "태국여행골프", "태국여행골프추천", "태국골프장추천",
    "일본여행골프", "일본여행골프추천", "일본골프장추천",
    "베트남여행골프추천", "대만여행골프추천",
    "해외골프장예약", "해외골프여행추천", "해외골프투어추천",
    "골프여행패키지", "골프투어패키지", "골프여행상품", "골프투어상품",
    "골프리조트여행", "골프리조트투어", "명문골프장투어",
    // 시즌/테마 키워드
    "겨울골프여행", "여름골프여행", "골프여행시즌", "벚꽃골프여행",
    "가성비골프여행", "프리미엄골프투어", "럭셔리골프여행",
    "골프여행가격", "골프투어가격", "골프여행비용",
    // 브랜드
    "보령항공여행사", "보령항공여행", "보령골프투어",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    other: {
      "naver-site-verification": ["f74847ba2e75788aa94473429118a4e479da3066"],
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 해외골프투어 전문 여행사`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 해외골프투어 전문 여행사`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD 구조화 데이터: Organization + TravelAgency
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE_NAME,
  alternateName: "보령항공여행",
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  image: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  telephone: "1588-0320",
  email: "admin@boryoung.com",
  foundingDate: "2004",
  address: {
    "@type": "PostalAddress",
    streetAddress: "태장로 795번길 23, 537호(장기동)",
    addressLocality: "김포시",
    addressRegion: "경기도",
    addressCountry: "KR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.6174,
    longitude: 126.7153,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://pf.kakao.com/_XaITs",
    "https://blog.naver.com/boryoung2",
  ],
  priceRange: "$$",
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 37.5665,
      longitude: 126.978,
    },
    geoRadius: "50000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8KCME6XCXK" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8KCME6XCXK');`,
          }}
        />
        {/* 네이버 애널리틱스 */}
        <script src="//wcs.pstatic.net/wcslog.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!wcs_add) var wcs_add={};wcs_add["wa"]="275b880ad47090";if(window.wcs){wcs_do();}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
