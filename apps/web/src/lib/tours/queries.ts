import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getTourProducts(filters?: {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  limit?: number;
}) {
  const where: Prisma.TourProductWhereInput = {
    isActive: true,
  };

  // 카테고리 필터
  if (filters?.categorySlug) {
    where.category = {
      slug: filters.categorySlug,
    };
  }

  // 태그 필터
  if (filters?.tagSlug) {
    where.tags = {
      some: {
        tag: {
          slug: filters.tagSlug,
        },
      },
    };
  }

  // 검색
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { subtitle: { contains: filters.search, mode: "insensitive" } },
      { excerpt: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.tourProduct.findMany({
    where,
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
    },
    orderBy: [
      { isFeatured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: filters?.limit || 100,
  });

  return products.map((product) => ({
    ...product,
    thumbnail: product.images[0]?.url || null,
    tagList: product.tags.map((t) => t.tag),
  }));
}

export async function getTourProduct(slug: string) {
  const decodedSlug = decodeURIComponent(slug);

  const product = await prisma.tourProduct.findUnique({
    where: { slug: decodedSlug },
    include: {
      category: {
        include: {
          parent: true,
          children: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      itineraries: {
        orderBy: { sortOrder: "asc" },
      },
      priceOptions: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    tagList: product.tags.map((t) => t.tag),
  };
}

// 계층형 카테고리 트리 조회
export async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, level: 0 },
    include: {
      children: {
        where: { isActive: true },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return categories;
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTags() {
  return prisma.tag.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
