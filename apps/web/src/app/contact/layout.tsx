import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "문의하기",
  description: "보령항공여행에 골프투어 관련 문의를 남겨주세요. 전화 1588-0320, 카카오톡으로 빠른 상담이 가능합니다.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "문의하기 | 보령항공여행",
    description: "보령항공여행에 골프투어 관련 문의를 남겨주세요. 전화 1588-0320.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
