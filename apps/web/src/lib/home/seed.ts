import { prisma } from '@/lib/prisma';
import type { HomeTabKey, ProductCardDTO, RankingItem, CollectionItem } from "./types";

// destination → HomeTabKey 매핑 (국가/지역 기준)
const DESTINATION_TO_TAB: Record<string, HomeTabKey> = {
  'JAPAN': 'JAPAN',
  'THAILAND': 'THAILAND',
  'VIETNAM': 'VIETNAM',
  'TAIWAN': 'TAIWAN',
  'LAOS': 'LAOS',
  'GUAM_SAIPAN': 'GUAM_SAIPAN',
  'EUROPE_HAWAII': 'EUROPE_HAWAII',
  'MONGOLIA': 'MONGOLIA',
  'GROUP': 'GROUP',
  'DOMESTIC': 'DOMESTIC',
  // 하위 호환: 기존 destination 값 매핑
  'SOUTHEAST_ASIA': 'VIETNAM',
  'KOREA': 'DOMESTIC',
  'CHINA': 'OTHER',
  'AMERICAS': 'GUAM_SAIPAN',
  'OTHER': 'OTHER',
};

// 카테고리명으로 탭 결정 (destination이 없거나 모호할 때 카테고리명으로 보완)
function getTabByCategory(destination: string, category: string): HomeTabKey {
  // destination 직접 매핑 우선
  const directTab = DESTINATION_TO_TAB[destination];
  if (directTab) return directTab;

  // 카테고리명으로 추론
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('일본')) return 'JAPAN';
  if (categoryLower.includes('태국')) return 'THAILAND';
  if (categoryLower.includes('베트남')) return 'VIETNAM';
  if (categoryLower.includes('대만')) return 'TAIWAN';
  if (categoryLower.includes('라오스')) return 'LAOS';
  if (categoryLower.includes('괌') || categoryLower.includes('사이판')) return 'GUAM_SAIPAN';
  if (categoryLower.includes('유럽') || categoryLower.includes('하와이')) return 'EUROPE_HAWAII';
  if (categoryLower.includes('몽골')) return 'MONGOLIA';
  if (categoryLower.includes('단체') || categoryLower.includes('인센티브')) return 'GROUP';
  if (categoryLower.includes('국내') || categoryLower.includes('제주')) return 'DOMESTIC';

  return 'OTHER';
}

// 국가별 라벨
const TAB_LABELS: Record<HomeTabKey, string> = {
  JAPAN: '일본',
  THAILAND: '태국',
  VIETNAM: '베트남',
  TAIWAN: '대만',
  LAOS: '라오스',
  GUAM_SAIPAN: '괌·사이판',
  EUROPE_HAWAII: '유럽·하와이',
  MONGOLIA: '몽골',
  OTHER: '기타',
  GROUP: '단체여행',
  DOMESTIC: '국내·제주',
};

// Ranking 섹션용 데이터 (featured 상품)
export async function getRankingProducts(): Promise<RankingItem[]> {
  try {
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
      take: 5,
    });

    return products.map((product, index) => ({
      id: product.id,
      slug: product.slug,
      rank: index + 1,
      title: product.title,
      price: product.basePrice
        ? `${product.basePrice.toLocaleString()}원~`
        : '가격 문의',
      imageUrl: product.images[0]?.url || getDefaultImage(getTabByCategory(product.destination, product.category?.name || '')),
      badges: [
        product.durationText || '문의',
        TAB_LABELS[getTabByCategory(product.destination, product.category?.name || '')] || '여행',
      ],
    }));
  } catch (error) {
    console.error('Failed to fetch ranking products:', error);
    return [];
  }
}

// Collection 섹션용 데이터 (destination별 추천)
export async function getCollectionItems(): Promise<CollectionItem[]> {
  try {
    const destinations = ['JAPAN', 'VIETNAM', 'THAILAND', 'TAIWAN'];
    const items: CollectionItem[] = [];

    const destLabels: Record<string, string> = {
      'JAPAN': '일본 골프의 정석',
      'VIETNAM': '베트남 럭셔리 리조트',
      'THAILAND': '태국 가성비 골프',
      'TAIWAN': '대만 프리미엄',
    };

    const destSubtitles: Record<string, string> = {
      'JAPAN': '규슈/오키나와/홋카이도 BEST',
      'VIETNAM': '다낭/호치민 5성급 리조트',
      'THAILAND': '치앙마이/파타야 무제한 골프',
      'TAIWAN': '명문 코스 완전 정복',
    };

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

// 모든 탭 키 목록
const ALL_TAB_KEYS: HomeTabKey[] = [
  'JAPAN', 'THAILAND', 'VIETNAM', 'TAIWAN', 'LAOS',
  'GUAM_SAIPAN', 'EUROPE_HAWAII', 'MONGOLIA', 'OTHER', 'GROUP', 'DOMESTIC',
];

// 빈 탭 맵 생성
function createEmptyTabMap(): Record<HomeTabKey, ProductCardDTO[]> {
  const map = {} as Record<HomeTabKey, ProductCardDTO[]>;
  ALL_TAB_KEYS.forEach((key) => { map[key] = []; });
  return map;
}

export async function getHomeProductsByTab(itemsPerTab: number): Promise<Record<HomeTabKey, ProductCardDTO[]>> {
  try {
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

    const productsByTab = createEmptyTabMap();

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
        highlight1: TAB_LABELS[tab] || '여행',
        highlight2: product.durationText || '패키지',
        badge: product.isFeatured ? 'BEST' : undefined,
        thumbnailUrl: product.images[0]?.url || getDefaultImage(tab),
      };

      productsByTab[tab].push(card);
    });

    // 각 탭별로 itemsPerTab 개수만큼만
    Object.keys(productsByTab).forEach((tab) => {
      productsByTab[tab as HomeTabKey] = productsByTab[tab as HomeTabKey].slice(0, itemsPerTab);
    });

    return productsByTab;

  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return createEmptyTabMap();
  }
}

// 기본 이미지 (썸네일 없을 때)
function getDefaultImage(tab: HomeTabKey): string {
  const defaults: Record<HomeTabKey, string> = {
    JAPAN: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    THAILAND: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    VIETNAM: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    TAIWAN: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    LAOS: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    GUAM_SAIPAN: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    EUROPE_HAWAII: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    MONGOLIA: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    OTHER: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    GROUP: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    DOMESTIC: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80',
  };
  return defaults[tab] || defaults.OTHER;
}
