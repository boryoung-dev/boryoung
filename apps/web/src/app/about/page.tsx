import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "회사 소개",
  description:
    "22년 전통의 골프 여행 전문 보령항공여행입니다. 2004년부터 고객님께 최상의 골프투어 서비스를 제공해왔습니다.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "회사 소개 | 보령항공여행",
    description: "22년 전통의 골프 여행 전문 보령항공여행입니다.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
