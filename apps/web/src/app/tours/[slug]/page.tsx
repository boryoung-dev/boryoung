import { notFound } from "next/navigation";
import { getTourProduct } from "@/lib/tours/queries";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
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

      <SiteFooter />

      <KakaoFloating />
    </div>
  );
}
