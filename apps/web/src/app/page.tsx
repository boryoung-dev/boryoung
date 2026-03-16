import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} - 22년 전통 골프 여행 전문`,
  description: "일본, 태국, 베트남, 대만 골프 여행의 모든 것. 22년 노하우의 골프전문여행사입니다.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} - 22년 전통 골프 여행 전문`,
    description: "일본, 태국, 베트남, 대만 골프 여행의 모든 것. 22년 노하우의 골프전문여행사입니다.",
    url: SITE_URL,
    type: "website",
  },
};

export default async function Home() {
  return <HomePage />;
}
