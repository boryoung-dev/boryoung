import { prisma } from "@/lib/prisma";

/** 큐레이션에 연결된 상품의 DTO */
export interface CurationProductDTO {
  slug: string;
  title: string;
  imageUrl: string;
  destination: string;
  duration: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

/** DB에서 조회한 큐레이션 + 상품 데이터 */
export interface CurationSection {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sectionType: string | null;
  displayConfig: any;
  sortOrder: number;
  products: CurationProductDTO[];
}

/** 활성 큐레이션을 sortOrder 순으로 조회 (products 포함) */
export async function getActiveCurations(): Promise<CurationSection[]> {
  try {
    const curations = await prisma.curation.findMany({
      where: { isActive: true },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { where: { isThumbnail: true }, take: 1 },
                category: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return curations.map((curation) => ({
      id: curation.id,
      title: curation.title,
      subtitle: curation.subtitle,
      description: curation.description,
      imageUrl: curation.imageUrl,
      linkUrl: curation.linkUrl,
      sectionType: curation.sectionType,
      displayConfig: curation.displayConfig,
      sortOrder: curation.sortOrder,
      products: curation.products
        .filter((cp) => cp.product.isActive)
        .map((cp) => {
          const p = cp.product;
          return {
            slug: p.slug,
            title: p.title,
            imageUrl: p.images?.[0]?.url || "",
            destination: p.destination || "",
            duration: p.durationText || (p.nights && p.days ? `${p.nights}박 ${p.days}일` : ""),
            basePrice: p.basePrice ?? 0,
            originalPrice: p.originalPrice ?? undefined,
            rating: 4.5 + Math.random() * 0.4, // 임시 평점 (추후 리뷰 기반)
            reviewCount: Math.floor(50 + Math.random() * 200), // 임시 리뷰 수
            badge: p.isFeatured ? "특가" : undefined,
          };
        }),
    }));
  } catch (error) {
    console.error("큐레이션 조회 실패:", error);
    return [];
  }
}

/** 특가 상품 자동 조회 (큐레이션에 상품이 없을 때 폴백) */
export async function getFallbackDealProducts(): Promise<CurationProductDTO[]> {
  try {
    const products = await prisma.tourProduct.findMany({
      where: {
        isActive: true,
        originalPrice: { not: null },
      },
      include: {
        images: { where: { isThumbnail: true }, take: 1 },
      },
      orderBy: { sortOrder: "asc" },
      take: 8,
    });

    return products
      .filter((p) => p.originalPrice && p.basePrice && p.originalPrice > p.basePrice)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        imageUrl: p.images?.[0]?.url || "",
        destination: p.destination || "",
        duration: p.durationText || (p.nights && p.days ? `${p.nights}박 ${p.days}일` : ""),
        basePrice: p.basePrice ?? 0,
        originalPrice: p.originalPrice ?? undefined,
        rating: 4.5 + Math.random() * 0.4,
        reviewCount: Math.floor(50 + Math.random() * 200),
        badge: "특가",
      }));
  } catch (error) {
    console.error("특가 상품 조회 실패:", error);
    return [];
  }
}

/** 신규 상품 자동 조회 (큐레이션에 상품이 없을 때 폴백) */
export async function getFallbackNewProducts(): Promise<CurationProductDTO[]> {
  try {
    const products = await prisma.tourProduct.findMany({
      where: { isActive: true },
      include: {
        images: { where: { isThumbnail: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return products.map((p) => ({
      slug: p.slug,
      title: p.title,
      imageUrl: p.images?.[0]?.url || "",
      destination: p.destination || "",
      duration: p.durationText || (p.nights && p.days ? `${p.nights}박 ${p.days}일` : ""),
      basePrice: p.basePrice ?? 0,
      originalPrice: p.originalPrice ?? undefined,
      rating: 4.5 + Math.random() * 0.4,
      reviewCount: Math.floor(50 + Math.random() * 200),
      badge: undefined,
    }));
  } catch (error) {
    console.error("신규 상품 조회 실패:", error);
    return [];
  }
}

/** 추천 상품 자동 조회 (큐레이션에 상품이 없을 때 폴백) */
export async function getFallbackFeaturedProducts() {
  try {
    const products = await prisma.tourProduct.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: { where: { isThumbnail: true }, take: 1 },
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: 6,
    });

    return products.map((product, index) => ({
      id: product.id,
      slug: product.slug,
      rank: index + 1,
      title: product.title,
      price: product.basePrice ? `${product.basePrice.toLocaleString()}원~` : "가격 문의",
      imageUrl: product.images[0]?.url || "",
      badges: [
        product.durationText || "문의",
        product.category?.name || "여행",
      ],
    }));
  } catch (error) {
    console.error("추천 상품 조회 실패:", error);
    return [];
  }
}
