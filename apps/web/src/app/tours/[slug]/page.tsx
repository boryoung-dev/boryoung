import { notFound } from "next/navigation";
import { getTourProduct } from "@/lib/tours/queries";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { ProductDetailPage } from "@/components/tours/detail/ProductDetailPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getTourProduct(slug);

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  return {
    title: product.metaTitle || `${product.title} | 보령항공여행`,
    description:
      product.metaDescription || product.excerpt || product.subtitle,
  };
}

export default async function TourProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getTourProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] antialiased">
      <SiteHeader />
      <ProductDetailPage product={product} />

      {/* 푸터 (홈과 동일) */}
      <footer className="mt-auto border-t border-[color:var(--border)] bg-white py-12 text-center text-sm text-[color:var(--muted)]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center">
          <div className="mb-4 text-xl font-bold tracking-tighter text-[color:var(--brand)] opacity-50">Boryoung</div>
          <p className="mb-2">보령(주) | 대표이사: 심재형 | 사업자등록번호: 123-45-67890</p>
          <p>&copy; 2024 Boryoung. All rights reserved.</p>
        </div>
      </footer>

      <KakaoFloating />
    </div>
  );
}
