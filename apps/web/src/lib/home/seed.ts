import { prisma } from '@/lib/prisma';
import type { HomeTabKey, ProductCardDTO, RankingItem, CollectionItem } from "./types";

// destination → HomeTabKey 매핑
const DESTINATION_TO_TAB: Record<string, HomeTabKey> = {
  'JAPAN': 'JAPAN',
  'TAIWAN': 'TAIWAN',
  'SOUTHEAST_ASIA': 'SEA',
  'KOREA': 'JEJU', // 제주/국내 합쳐서
  'CHINA': 'SEA', // 동남아에 포함
  'AMERICAS': 'SEA', // 동남아에 포함
  'OTHER': 'SEA',
};

// 카테고리명으로 구분 (국내 vs 제주)
function getTabByCategory(destination: string, category: string): HomeTabKey {
  if (destination === 'KOREA') {
    if (category?.includes('제주')) {
      return 'JEJU';
    }
    return 'DOMESTIC';
  }
  return DESTINATION_TO_TAB[destination] || 'SEA';
}

// Ranking 섹션용 데이터 (featured 상품)
export async function getRankingProducts(): Promise<RankingItem[]> {
  try {
    const products = await prisma.tourProduct.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        images: {
          where: { isThumbnail: true },
          take: 1,
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 4,
    });

    return products.map((product, index) => ({
      id: product.id,
      slug: product.slug,
      rank: index + 1,
      title: product.title,
      price: product.basePrice
        ? `${product.basePrice.toLocaleString()}원~`
        : '가격 문의',
      imageUrl: product.images[0]?.url || getDefaultImage(getTabByCategory(product.destination, '')),
      badges: [product.durationText || '문의', product.destination === 'JAPAN' ? '골프' : '여행'],
    }));
  } catch (error) {
    console.error('Failed to fetch ranking products:', error);
    return [];
  }
}

// Collection 섹션용 데이터 (destination별 추천)
export async function getCollectionItems(): Promise<CollectionItem[]> {
  try {
    const destinations = ['JAPAN', 'SOUTHEAST_ASIA', 'TAIWAN'];
    const items: CollectionItem[] = [];

    for (const dest of destinations) {
      const product = await prisma.tourProduct.findFirst({
        where: {
          isActive: true,
          destination: dest,
        },
        include: {
          category: true,
          images: {
            where: { isThumbnail: true },
            take: 1,
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { sortOrder: 'asc' },
        ],
      });

      if (product) {
        const destLabels: Record<string, string> = {
          'JAPAN': '일본 골프의 정석',
          'SOUTHEAST_ASIA': '동남아 럭셔리',
          'TAIWAN': '대만 프리미엄',
        };

        const destSubtitles: Record<string, string> = {
          'JAPAN': '규슈/오키나와/홋카이도 BEST',
          'SOUTHEAST_ASIA': '5성급 호텔 + VIP 의전',
          'TAIWAN': '명문 코스 완전 정복',
        };

        items.push({
          id: product.id,
          slug: product.slug,
          title: destLabels[dest] || product.title,
          subTitle: destSubtitles[dest] || product.category?.name || '패키지',
          imageUrl: product.images[0]?.url || getDefaultImage(getTabByCategory(dest, '')),
          badges: product.category ? [product.category.name] : [],
        });
      }
    }

    return items;
  } catch (error) {
    console.error('Failed to fetch collection items:', error);
    return [];
  }
}

export async function getHomeProductsByTab(itemsPerTab: number): Promise<Record<HomeTabKey, ProductCardDTO[]>> {
  try {
    // DB에서 활성 상품 가져오기
    const products = await prisma.tourProduct.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isThumbnail: true },
          take: 1,
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // 탭별로 상품 분류
    const productsByTab: Record<HomeTabKey, ProductCardDTO[]> = {
      JAPAN: [],
      SEA: [],
      TAIWAN: [],
      JEJU: [],
      DOMESTIC: [],
    };

    products.forEach((product) => {
      const tab = getTabByCategory(product.destination, product.category?.name || '');
      
      const card: ProductCardDTO = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        duration: product.durationText || '문의',
        priceText: product.basePrice 
          ? `${product.basePrice.toLocaleString()}원`
          : '가격 문의',
        highlight1: product.destination === 'JAPAN' ? '골프' : '여행',
        highlight2: product.durationText || '패키지',
        badge: product.isFeatured ? 'BEST' : undefined,
        thumbnailUrl: product.images[0]?.url || getDefaultImage(tab),
      };

      productsByTab[tab].push(card);
    });

    // 각 탭별로 itemsPerTab 개수만큼만 가져오기
    Object.keys(productsByTab).forEach((tab) => {
      productsByTab[tab as HomeTabKey] = productsByTab[tab as HomeTabKey].slice(0, itemsPerTab);
    });

    return productsByTab;
    
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    
    // 에러 시 빈 배열 반환
    return {
      JAPAN: [],
      SEA: [],
      TAIWAN: [],
      JEJU: [],
      DOMESTIC: [],
    };
  }
}

// 기본 이미지 (썸네일 없을 때)
function getDefaultImage(tab: HomeTabKey): string {
  const defaults: Record<HomeTabKey, string> = {
    JAPAN: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    SEA: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    TAIWAN: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    JEJU: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80',
    DOMESTIC: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80',
  };
  return defaults[tab];
}
