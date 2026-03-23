import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 카테고리 생성
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '일본 골프',
        slug: 'japan-golf',
        description: '일본의 명문 골프장을 경험하세요',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: '동남아 여행',
        slug: 'southeast-asia',
        description: '동남아의 아름다운 리조트와 골프',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: '대만 골프',
        slug: 'taiwan-golf',
        description: '대만의 프리미엄 골프 코스',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: '제주 골프',
        slug: 'jeju-golf',
        description: '제주도의 아름다운 골프장',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: '국내 골프',
        slug: 'korea-golf',
        description: '국내 골프 패키지',
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ ${categories.length}개 카테고리 생성`);

  // 2. 태그 생성
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: '가성비', slug: 'value', type: 'PRICE_RANGE' } }),
    prisma.tag.create({ data: { name: '프리미엄', slug: 'premium', type: 'PRICE_RANGE' } }),
    prisma.tag.create({ data: { name: '54홀', slug: '54-holes', type: 'FEATURE' } }),
    prisma.tag.create({ data: { name: '단기', slug: 'short', type: 'DURATION' } }),
    prisma.tag.create({ data: { name: '장기', slug: 'long', type: 'DURATION' } }),
    prisma.tag.create({ data: { name: '2인출발', slug: '2-people', type: 'FEATURE' } }),
    prisma.tag.create({ data: { name: '단체', slug: 'group', type: 'FEATURE' } }),
    prisma.tag.create({ data: { name: '5성급호텔', slug: '5-star', type: 'ACCOMMODATION' } }),
  ]);

  console.log(`✅ ${tags.length}개 태그 생성`);

  // 3. 샘플 상품 생성 (일본 골프)
  const japanCategory = categories[0];
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
      categoryId: categories[1].id,
      destination: 'SOUTHEAST_ASIA',
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

  console.log(`✅ ${2}개 상품 생성`);

  // 4. 블로그 포스트
  await prisma.blogPost.create({
    data: {
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

  console.log('✅ 블로그 포스트 생성');

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
