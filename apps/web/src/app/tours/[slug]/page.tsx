import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourProduct } from "@/lib/tours/queries";
import { SiteHeader } from "@/components/common/SiteHeader";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
import { ProductDetailPage } from "@/components/tours/detail/ProductDetailPage";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getTourProduct(slug);

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  const title = product.metaTitle || `${product.title} | ${SITE_NAME}`;
  const description = product.metaDescription || product.excerpt || product.subtitle || "";
  const url = `${SITE_URL}/tours/${slug}`;
  const imageUrl = product.images?.[0]?.url;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: SITE_NAME,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function TourProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getTourProduct(slug);

  if (!product) {
    notFound();
  }

  // JSON-LD: Product 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.excerpt || product.subtitle || "",
    url: `${SITE_URL}/tours/${slug}`,
    ...(product.images?.[0]?.url && { image: product.images[0].url }),
    brand: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    ...(product.basePrice && {
      offers: {
        "@type": "Offer",
        price: product.basePrice,
        priceCurrency: "KRW",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <ProductDetailPage product={product} />

      <SiteFooter />

      <KakaoFloating />
    </div>
  );
}
