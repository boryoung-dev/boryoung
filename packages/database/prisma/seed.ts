import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// 이전 카테고리 → 새 카테고리 매핑 (이름 기준)
const OLD_TO_NEW_CATEGORY: Record<string, string> = {
  '일본 골프': 'japan',
  '동남아 골프': 'vietnam',    // 동남아 → 베트남(대표)으로 매핑
  '대만 골프': 'taiwan',
  '제주 골프': 'domestic-jeju',
  '프리미엄': 'other',
};

const CATEGORIES = [
  { name: '일본', slug: 'japan', description: '일본 골프 투어', sortOrder: 1 },
  { name: '태국', slug: 'thailand', description: '태국 골프 투어', sortOrder: 2 },
  { name: '베트남', slug: 'vietnam', description: '베트남 골프 & 리조트', sortOrder: 3 },
  { name: '대만', slug: 'taiwan', description: '대만 프리미엄 골프', sortOrder: 4 },
  { name: '라오스', slug: 'laos', description: '라오스 골프 투어', sortOrder: 5 },
  { name: '괌 및 사이판', slug: 'guam-saipan', description: '괌·사이판 골프 리조트', sortOrder: 6 },
  { name: '유럽 및 하와이', slug: 'europe-hawaii', description: '유럽·하와이 골프 투어', sortOrder: 7 },
  { name: '몽골(울란바토르)', slug: 'mongolia', description: '몽골 골프 투어', sortOrder: 8 },
  { name: '기타', slug: 'other', description: '기타 지역 골프 투어', sortOrder: 9 },
  { name: '단체여행(인센티브)', slug: 'group-travel', description: '단체 골프 투어 및 인센티브', sortOrder: 10 },
  { name: '국내 및 제주도', slug: 'domestic-jeju', description: '국내·제주 골프 패키지', sortOrder: 11 },
];

async function migrateOldCategories() {
  const existing = await prisma.category.findMany();
  if (existing.length === 0) return;

  // 새 카테고리가 이미 있으면 마이그레이션 불필요
  const hasNewCats = existing.some(c => CATEGORIES.some(nc => nc.slug === c.slug));
  if (hasNewCats) {
    console.log('✅ 새 카테고리 이미 존재, 마이그레이션 스킵');
    return;
  }

  console.log('🔄 이전 카테고리 마이그레이션 시작...');

  // 새 카테고리 먼저 생성 (upsert)
  const newCats: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    newCats[cat.slug] = created.id;
  }

  // 이전 카테고리의 상품을 새 카테고리로 이동
  for (const oldCat of existing) {
    const newSlug = OLD_TO_NEW_CATEGORY[oldCat.name];
    if (newSlug && newCats[newSlug]) {
      const moved = await prisma.tourProduct.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: newCats[newSlug] },
      });
      if (moved.count > 0) {
        console.log(`  📦 "${oldCat.name}" → "${newSlug}": ${moved.count}개 상품 이동`);
      }
    }
  }

  // 상품이 없는 이전 카테고리 삭제
  for (const oldCat of existing) {
    if (OLD_TO_NEW_CATEGORY[oldCat.name]) {
      const productCount = await prisma.tourProduct.count({ where: { categoryId: oldCat.id } });
      if (productCount === 0) {
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`  🗑️ 이전 카테고리 "${oldCat.name}" 삭제`);
      }
    }
  }

  console.log('✅ 카테고리 마이그레이션 완료');
}

async function main() {
  console.log('🌱 Seeding database...');

  // 0. 이전 카테고리 마이그레이션 (기존 DB에서 실행 시)
  await migrateOldCategories();

  // 1. 카테고리 upsert (국가/지역 기준)
  const categories = await Promise.all(
    CATEGORIES.map(cat =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
        create: cat,
      })
    )
  );

  console.log(`✅ ${categories.length}개 카테고리 준비 완료`);

  // 2. 태그 upsert
  const TAG_DATA = [
    { name: '가성비', slug: 'value', type: 'PRICE_RANGE' },
    { name: '프리미엄', slug: 'premium', type: 'PRICE_RANGE' },
    { name: '54홀', slug: '54-holes', type: 'FEATURE' },
    { name: '단기', slug: 'short', type: 'DURATION' },
    { name: '장기', slug: 'long', type: 'DURATION' },
    { name: '2인출발', slug: '2-people', type: 'FEATURE' },
    { name: '단체', slug: 'group', type: 'FEATURE' },
    { name: '5성급호텔', slug: '5-star', type: 'ACCOMMODATION' },
  ];
  const tags = await Promise.all(
    TAG_DATA.map(t =>
      prisma.tag.upsert({
        where: { slug: t.slug },
        update: { name: t.name, type: t.type },
        create: t,
      })
    )
  );

  console.log(`✅ ${tags.length}개 태그 준비 완료`);

  // 3. 샘플 상품 생성 (기존 데이터 있으면 스킵)
  const existingProducts = await prisma.tourProduct.count();
  if (existingProducts > 0) {
    console.log(`✅ 이미 ${existingProducts}개 상품 존재, 샘플 생성 스킵`);
  } else {
  const japanCategory = categories[0]; // 일본
  const product1 = await prisma.tourProduct.create({
    data: {
      slug: 'fukuoka-golf-3days',
      title: '후쿠오카 골프 3박4일',
      subtitle: '규슈 명문 골프장 투어',
      excerpt: '후쿠오카의 아름다운 골프장에서 최고의 라운딩을 경험하세요',
      categoryId: japanCategory.id,
      destination: 'JAPAN',
      nights: 3,
      days: 4,
      durationText: '3박4일',
      basePrice: 1399000,
      content: '후쿠오카 골프 투어 상세 내용...',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      publishedAt: new Date(),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
            alt: '후쿠오카 골프장',
            sortOrder: 0,
            isThumbnail: true,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags.find(t => t.slug === 'value')!.id },
          { tagId: tags.find(t => t.slug === 'short')!.id },
        ],
      },
      itineraries: {
        create: [
          {
            day: 1,
            title: '인천 출발 - 후쿠오카 도착',
            description: '인천공항에서 후쿠오카로 이동',
            activities: [
              { time: '09:00', activity: '인천공항 집합' },
              { time: '11:00', activity: '후쿠오카 도착' },
              { time: '14:00', activity: '호텔 체크인' },
            ],
            meals: '석식',
            accommodation: '후쿠오카 그랜드 호텔',
            sortOrder: 1,
          },
          {
            day: 2,
            title: '골프 라운딩 1일차',
            description: '후쿠오카 명문 골프장 18홀',
            activities: [
              { time: '07:00', activity: '호텔 조식' },
              { time: '08:00', activity: '골프장 이동' },
              { time: '09:00', activity: '18홀 라운딩' },
              { time: '18:00', activity: '호텔 복귀' },
            ],
            meals: '조식, 중식, 석식',
            accommodation: '후쿠오카 그랜드 호텔',
            sortOrder: 2,
          },
          {
            day: 3,
            title: '골프 라운딩 2일차',
            description: '규슈 프리미엄 골프장 18홀',
            activities: [
              { time: '07:00', activity: '호텔 조식' },
              { time: '08:00', activity: '골프장 이동' },
              { time: '09:00', activity: '18홀 라운딩' },
              { time: '18:00', activity: '호텔 복귀' },
            ],
            meals: '조식, 중식, 석식',
            accommodation: '후쿠오카 그랜드 호텔',
            sortOrder: 3,
          },
          {
            day: 4,
            title: '후쿠오카 출발 - 인천 도착',
            description: '자유시간 후 귀국',
            activities: [
              { time: '09:00', activity: '호텔 조식 및 체크아웃' },
              { time: '11:00', activity: '공항 이동' },
              { time: '14:00', activity: '인천 도착' },
            ],
            meals: '조식',
            sortOrder: 4,
          },
        ],
      },
      priceOptions: {
        create: [
          {
            name: '1인실 (혼자 사용)',
            price: 1899000,
            priceType: 'PER_PERSON',
            isDefault: false,
            sortOrder: 1,
          },
          {
            name: '2인실 (2인 1실)',
            price: 1399000,
            priceType: 'PER_PERSON',
            isDefault: true,
            sortOrder: 2,
          },
          {
            name: '골프 1라운드 추가',
            price: 200000,
            priceType: 'ADDITIONAL',
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // 더 많은 상품들...
  const product2 = await prisma.tourProduct.create({
    data: {
      slug: 'danang-golf-4days',
      title: '다낭 골프 & 리조트 4박5일',
      subtitle: '5성급 리조트에서 즐기는 골프',
      excerpt: '베트남 다낭의 프리미엄 골프 리조트',
      categoryId: categories[2].id, // 베트남
      destination: 'VIETNAM',
      nights: 4,
      days: 5,
      durationText: '4박5일',
      basePrice: 1590000,
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      publishedAt: new Date(),
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
            alt: '다낭 리조트',
            sortOrder: 0,
            isThumbnail: true,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags.find(t => t.slug === 'premium')!.id },
          { tagId: tags.find(t => t.slug === '5-star')!.id },
        ],
      },
    },
  });

  console.log(`✅ 샘플 상품 생성 완료`);
  } // end if (existingProducts === 0)

  // 4. 블로그 포스트
  await prisma.blogPost.upsert({
    where: { slug: 'golf-trip-essentials' },
    update: {},
    create: {
      slug: 'golf-trip-essentials',
      title: '골프 여행 필수 준비물',
      excerpt: '해외 골프 여행 시 꼭 챙겨야 할 것들',
      content: '골프 여행을 떠나기 전에 준비해야 할 필수 아이템들을 소개합니다...',
      thumbnail: 'https://images.unsplash.com/photo-1591491653056-4e9d563a4b69?w=800',
      category: '골프팁',
      tags: ['준비물', '여행', '골프'],
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log('✅ 블로그 포스트 준비 완료');

  console.log('🎉 Seeding 완료!');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
