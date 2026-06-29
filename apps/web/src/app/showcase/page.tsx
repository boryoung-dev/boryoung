import type { Metadata } from "next";
import { KakaoFloating } from "@/components/common/KakaoFloating";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { ShowcasePage } from "@/components/showcase/ShowcasePage";
import type { ShowcaseData, ShowcaseProduct } from "@/components/showcase/types";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 0; // 관리자 수정 즉시 반영 (캐시 비활성)

export const metadata: Metadata = {
  title: "보령항공여행사 프리미엄 골프투어 쇼케이스",
  description:
    "보령항공여행사의 해외 골프투어 대표 상품, 국가별 추천 일정, 특가 상품을 한눈에 보는 프리미엄 퍼블리싱 페이지입니다.",
  alternates: {
    canonical: `${SITE_URL}/showcase`,
  },
  openGraph: {
    title: "보령항공여행사 프리미엄 골프투어 쇼케이스",
    description:
      "관리자 등록 상품과 큐레이션 데이터를 기반으로 구성한 보령항공여행사 골프투어 쇼케이스.",
    url: `${SITE_URL}/showcase`,
    type: "website",
  },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&q=85";

type ProductRecord = Awaited<ReturnType<typeof getRawProducts>>[number];

function averageRating(product: ProductRecord) {
  if (product.reviews.length === 0) return null;
  const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / product.reviews.length) * 10) / 10;
}

function toProduct(product: ProductRecord): ShowcaseProduct {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    excerpt: product.excerpt,
    destination: product.destination,
    duration:
      product.durationText ||
      (product.nights && product.days ? `${product.nights}박 ${product.days}일` : "일정 문의"),
    departure: product.departure,
    airline: product.airline,
    totalHoles: product.totalHoles,
    minPeople: product.minPeople,
    basePrice: product.basePrice,
    originalPrice: product.originalPrice,
    imageUrl: product.images[0]?.url || FALLBACK_IMAGE,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    tags: product.tags.map((item) => item.tag.name),
    reviewCount: product.reviews.length,
    averageRating: averageRating(product),
    isFeatured: product.isFeatured,
  };
}

async function getRawProducts() {
  return prisma.tourProduct.findMany({
    where: { isActive: true },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      images: {
        where: { isThumbnail: true },
        take: 1,
      },
      tags: {
        include: {
          tag: true,
        },
      },
      reviews: {
        where: { isPublished: true },
        select: {
          rating: true,
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: 48,
  });
}

async function getShowcaseData(): Promise<ShowcaseData> {
  const now = new Date();
  const [rawProducts, banners, curations, quickIcons, categories, posts, reviewAggregate, reviewCount] =
    await Promise.all([
      getRawProducts(),
      prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { sortOrder: "asc" },
        take: 5,
      }),
      prisma.curation.findMany({
        where: { isActive: true },
        include: {
          products: {
            include: {
              product: {
                include: {
                  category: { include: { parent: true } },
                  images: { where: { isThumbnail: true }, take: 1 },
                  tags: { include: { tag: true } },
                  reviews: {
                    where: { isPublished: true },
                    select: { rating: true },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      prisma.quickIcon.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          products: { some: { isActive: true } },
        },
        include: {
          parent: true,
          products: {
            where: { isActive: true },
            include: {
              images: { where: { isThumbnail: true }, take: 1 },
            },
            orderBy: [
              { isFeatured: "desc" },
              { sortOrder: "asc" },
              { createdAt: "desc" },
            ],
            take: 6,
          },
          _count: {
            select: {
              products: { where: { isActive: true } },
            },
          },
        },
        orderBy: [{ globeSortOrder: "asc" }, { sortOrder: "asc" }],
        take: 10,
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.review.aggregate({
        where: { isPublished: true },
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { isPublished: true },
      }),
    ]);

  const products = rawProducts.map(toProduct);
  const productById = new Map(products.map((product) => [product.id, product]));
  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 12);
  const fallbackFeatured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 12);
  const dealProducts = products
    .filter(
      (product) =>
        product.basePrice && product.originalPrice && product.originalPrice > product.basePrice,
    )
    .slice(0, 12);
  const minPrice = products.reduce<number | null>((current, product) => {
    if (!product.basePrice) return current;
    return current === null ? product.basePrice : Math.min(current, product.basePrice);
  }, null);

  return {
    banners: banners.map((banner) => ({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      ctaText: banner.ctaText,
    })),
    quickIcons: quickIcons.map((icon) => ({
      label: icon.label,
      iconName: icon.iconName,
      linkUrl: icon.linkUrl,
    })),
    curations: curations.map((curation) => ({
      id: curation.id,
      title: curation.title,
      subtitle: curation.subtitle,
      description: curation.description,
      imageUrl: curation.imageUrl,
      linkUrl: curation.linkUrl,
      sectionType: curation.sectionType,
      products: curation.products
        .filter((item) => item.product.isActive)
        .map((item) => productById.get(item.product.id) ?? toProduct(item.product)),
    })),
    featuredProducts: fallbackFeatured,
    dealProducts,
    destinations: categories.map((category) => {
      const categoryProducts = category.products;
      const leadProduct = categoryProducts[0];
      const minCategoryPrice = categoryProducts.reduce<number | null>((current, product) => {
        if (!product.basePrice) return current;
        return current === null ? product.basePrice : Math.min(current, product.basePrice);
      }, null);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category._count.products,
        leadImage: leadProduct?.images[0]?.url || FALLBACK_IMAGE,
        minPrice: minCategoryPrice,
      };
    }),
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
      category: post.category,
    })),
    stats: {
      productCount: products.length,
      destinationCount: categories.length,
      reviewCount,
      averageRating: reviewAggregate._avg.rating
        ? Math.round(reviewAggregate._avg.rating * 10) / 10
        : null,
      minPrice,
    },
  };
}

export default async function ShowcaseRoute() {
  const data = await getShowcaseData();

  return (
    <div className="min-h-screen bg-white font-sans text-[color:var(--fg)] antialiased">
      <SiteHeader />
      <ShowcasePage data={data} />
      <SiteFooter />
      <KakaoFloating />
    </div>
  );
}
