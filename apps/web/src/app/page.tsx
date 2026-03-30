import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "보령항공여행사 - 22년 전통 해외골프투어 전문 여행사",
  description: "보령항공여행사(보령항공여행)는 2004년 설립된 22년 전통의 해외골프투어 전문 여행사입니다. 일본, 태국, 베트남, 대만 등 50개+ 명문 골프장 직접 제휴. 1588-0320",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "보령항공여행사 - 22년 전통 해외골프투어 전문 여행사",
    description: "보령항공여행사는 2004년 설립된 해외골프투어 전문 여행사입니다. 일본, 태국, 베트남, 대만 골프여행 상담 1588-0320",
    url: SITE_URL,
    type: "website",
  },
};

// 60초마다 재검증 (ISR)
export const revalidate = 60;

export default async function Home() {
  return <HomePage />;
}
