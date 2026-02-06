import { HomePage } from "@/components/home/HomePage";

export const metadata = {
  title: "보령항공여행 - 20년 전통 골프 여행 전문",
  description: "일본, 동남아, 대만 골프 여행의 모든 것. 20년 노하우로 완벽한 여행을 제공합니다.",
};

export default async function Home() {
  return <HomePage />;
}
