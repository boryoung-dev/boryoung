import { prisma } from "@/lib/prisma";

export type GlobeDestination = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  lat: number;
  lng: number;
  cities: { name: string; slug: string }[];
  products: {
    slug: string;
    title: string;
    imageUrl: string;
    price: string;
    destination: string;
  }[];
};

export async function getGlobeDestinations(): Promise<GlobeDestination[]> {
  const countries = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const results: GlobeDestination[] = await Promise.all(
    countries.map(async (country) => {
      // 직접 연결 + 하위 카테고리 연결 상품 모두 가져오기
      const products = await prisma.tourProduct.findMany({
        where: {
          isActive: true,
          category: {
            OR: [{ id: country.id }, { parentId: country.id }],
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
        take: 20,
        include: {
          images: { where: { isThumbnail: true }, take: 1 },
          category: true,
        },
      });

      const cities = country.children
        .filter((child) => child._count.products > 0)
        .map((child) => ({ name: child.name, slug: child.slug }));

      return {
        id: country.id,
        name: country.name,
        slug: country.slug,
        emoji: country.emoji ?? "📍",
        lat: country.latitude ?? 0,
        lng: country.longitude ?? 0,
        cities,
        products: products.map((p) => ({
          slug: p.slug,
          title: p.title,
          imageUrl: p.images[0]?.url ?? "",
          price: p.basePrice != null ? `${p.basePrice.toLocaleString()}원` : "",
          destination: p.category.name,
        })),
      };
    })
  );

  return results;
}
