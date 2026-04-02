import { PrismaClient } from '../packages/database/generated/prisma';

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    slug: 'fukuoka-54hole-3n4d',
    title: '후쿠오카 골프 3박 4일 54홀',
    subtitle: '규슈 명문 3개 코스 완전정복',
    excerpt: '후쿠오카 근교 명문 골프장 3곳에서 54홀 라운딩. 온천 료칸 숙박 포함 프리미엄 패키지.',
    categorySlug: 'japan',
    destination: '일본 후쿠오카',
    departure: '인천',
    airline: '대한항공/아시아나',
    nights: 3,
    days: 4,
    durationText: '3박 4일',
    basePrice: 1490000,
    originalPrice: 1690000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 20,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: true,
    inclusions: ['왕복 항공권', '숙박 3박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 3회', '석식 2회'],
    exclusions: ['여행자보험', '개인경비', '중식', '음료비'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 → 후쿠오카', description: '인천 출발 → 후쿠오카 도착 → 호텔 체크인 → 웰컴 디너' },
      { day: 2, title: 'Day 2: 코가CC 18홀', description: '조식 → 코가CC 18홀 라운딩 → 석식 → 온천' },
      { day: 3, title: 'Day 3: 겐카이CC 18홀', description: '조식 → 겐카이CC 18홀 라운딩 → 석식 → 자유시간' },
      { day: 4, title: 'Day 4: 후쿠오카CC 18홀 → 귀국', description: '조식 → 후쿠오카CC 18홀 라운딩 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'okinawa-resort-4n5d',
    title: '오키나와 리조트 골프 4박 5일',
    subtitle: '에메랄드빛 바다와 함께하는 프리미엄 골프',
    excerpt: '오키나와 오션뷰 리조트 숙박 + 명문 골프장 36홀 라운딩. 관광과 골프를 동시에 즐기는 힐링 패키지.',
    categorySlug: 'japan',
    destination: '일본 오키나와',
    departure: '인천',
    airline: '진에어/티웨이',
    nights: 4,
    days: 5,
    durationText: '4박 5일',
    basePrice: 1890000,
    originalPrice: 2190000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 16,
    totalHoles: 36,
    tagSlugs: ['premium', '5-star'],
    isFeatured: true,
    inclusions: ['왕복 항공권', '리조트 숙박 4박', '그린피 2회(36홀)', '카트비', '캐디피', '전 일정 차량', '조식 4회', '석식 3회'],
    exclusions: ['여행자보험', '개인경비', '중식', '관광지 입장료'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 → 오키나와', description: '인천 출발 → 오키나와 도착 → 리조트 체크인 → 웰컴 디너' },
      { day: 2, title: 'Day 2: 가데나CC 18홀', description: '조식 → 가데나CC 18홀 라운딩 → 아메리칸빌리지 관광 → 석식' },
      { day: 3, title: 'Day 3: 자유시간', description: '조식 → 자유시간(해양 액티비티, 쇼핑) → 석식' },
      { day: 4, title: 'Day 4: 벨비치CC 18홀', description: '조식 → 벨비치CC 18홀 라운딩 → 페어웰 디너' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 나하 국제거리 자유시간 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'chiangmai-golf-4n5d',
    title: '치앙마이 골프 4박 5일 54홀',
    subtitle: '태국 북부 산악 명문 코스 3곳',
    excerpt: '서늘한 기후의 치앙마이에서 즐기는 산악 골프. 54홀 라운딩 + 태국 전통 마사지 포함.',
    categorySlug: 'thailand',
    destination: '태국 치앙마이',
    departure: '인천',
    airline: '타이에어아시아X',
    nights: 4,
    days: 5,
    durationText: '4박 5일',
    basePrice: 1290000,
    originalPrice: 1490000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 20,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: true,
    inclusions: ['왕복 항공권', '호텔 숙박 4박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 4회', '석식 3회', '태국 전통 마사지 1회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 → 치앙마이', description: '인천 출발 → 치앙마이 도착 → 호텔 체크인 → 야시장 관광 → 석식' },
      { day: 2, title: 'Day 2: 알파인GC 18홀', description: '조식 → 알파인GC 18홀 라운딩 → 석식 → 마사지' },
      { day: 3, title: 'Day 3: 치앙마이 하이랜드CC 18홀', description: '조식 → 치앙마이 하이랜드CC 18홀 라운딩 → 석식' },
      { day: 4, title: 'Day 4: 로얄치앙마이CC 18홀', description: '조식 → 로얄치앙마이CC 18홀 라운딩 → 자유시간' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 사원 관광 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'danang-golf-3n5d',
    title: '다낭 골프 3박 5일 54홀',
    subtitle: '베트남 중부 프리미엄 골프 투어',
    excerpt: '다낭의 세계적 골프장에서 54홀 라운딩. 바나힐 관광 + 호이안 야경까지 즐기는 올인원 패키지.',
    categorySlug: 'vietnam',
    destination: '베트남 다낭',
    departure: '인천',
    airline: '베트남항공/비엣젯',
    nights: 3,
    days: 5,
    durationText: '3박 5일',
    basePrice: 1190000,
    originalPrice: 1390000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 24,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: true,
    inclusions: ['왕복 항공권', '호텔 숙박 3박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 3회', '석식 3회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁', '관광지 입장료'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 심야 출발', description: '인천 심야 출발' },
      { day: 2, title: 'Day 2: 바나힐CC 18홀', description: '다낭 새벽 도착 → 호텔 체크인 → 바나힐CC 18홀 라운딩 → 석식' },
      { day: 3, title: 'Day 3: 몽고메리링크스 18홀', description: '조식 → 몽고메리링크스 18홀 라운딩 → 호이안 야경 관광 → 석식' },
      { day: 4, title: 'Day 4: 빈펄GC 18홀', description: '조식 → 빈펄GC 18홀 라운딩 → 한시장 쇼핑 → 페어웰 디너' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'bangkok-pattaya-golf-3n5d',
    title: '방콕·파타야 골프 3박 5일 54홀',
    subtitle: '태국 최고의 골프 리조트 투어',
    excerpt: '파타야 해변 리조트 숙박 + 태국 명문 골프장 54홀 라운딩. 방콕 시내 관광과 쇼핑까지 한번에.',
    categorySlug: 'thailand',
    destination: '태국 파타야',
    departure: '인천',
    airline: '타이항공/제주항공',
    nights: 3,
    days: 5,
    durationText: '3박 5일',
    basePrice: 1190000,
    originalPrice: 1390000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 20,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: false,
    inclusions: ['왕복 항공권', '리조트 숙박 3박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 3회', '석식 3회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 심야 출발', description: '인천 심야 출발' },
      { day: 2, title: 'Day 2: 시암CC 18홀', description: '방콕 도착 → 파타야 이동 → 시암CC 18홀 라운딩 → 석식' },
      { day: 3, title: 'Day 3: 레이크우드CC 18홀', description: '조식 → 레이크우드CC 18홀 라운딩 → 파타야 워킹스트리트 → 석식' },
      { day: 4, title: 'Day 4: 피닉스골드CC 18홀', description: '조식 → 피닉스골드CC 18홀 라운딩 → 방콕 이동 → 석식' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 방콕 자유시간(쇼핑) → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'taipei-golf-2n3d',
    title: '대만 타이베이 골프 2박 3일 36홀',
    subtitle: '가까운 대만에서 즐기는 주말 골프',
    excerpt: '비행 2시간 반, 가장 가까운 해외 골프. 타이베이 근교 명문 골프장 36홀 + 야시장 관광.',
    categorySlug: 'taiwan',
    destination: '대만 타이베이',
    departure: '인천',
    airline: '중화항공/타이거에어',
    nights: 2,
    days: 3,
    durationText: '2박 3일',
    basePrice: 890000,
    originalPrice: 1090000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 16,
    totalHoles: 36,
    tagSlugs: ['short', 'value'],
    isFeatured: false,
    inclusions: ['왕복 항공권', '호텔 숙박 2박', '그린피 2회(36홀)', '카트비', '캐디피', '전 일정 차량', '조식 2회', '석식 2회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁'],
    itineraries: [
      { day: 1, title: 'Day 1: 스프링필드CC 18홀', description: '인천 출발 → 타이베이 도착 → 스프링필드CC 18홀 라운딩 → 스린 야시장 → 석식' },
      { day: 2, title: 'Day 2: 미라마CC 18홀', description: '조식 → 미라마CC 18홀 라운딩 → 지우펀 관광 → 석식' },
      { day: 3, title: 'Day 3: 귀국', description: '조식 → 면세점 쇼핑 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'vientiane-golf-3n5d',
    title: '라오스 비엔티안 골프 3박 5일 54홀',
    subtitle: '숨겨진 골프 천국, 라오스',
    excerpt: '아직 알려지지 않은 라오스의 프리미엄 골프장에서 여유로운 라운딩. 가성비 최고의 동남아 골프 여행.',
    categorySlug: 'laos',
    destination: '라오스 비엔티안',
    departure: '인천',
    airline: '라오항공/진에어',
    nights: 3,
    days: 5,
    durationText: '3박 5일',
    basePrice: 1090000,
    originalPrice: 1290000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 16,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: false,
    inclusions: ['왕복 항공권', '호텔 숙박 3박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 3회', '석식 3회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁', '비자비용'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 심야 출발', description: '인천 심야 출발' },
      { day: 2, title: 'Day 2: 롱비엔GC 18홀', description: '비엔티안 도착 → 호텔 체크인 → 롱비엔GC 18홀 라운딩 → 석식' },
      { day: 3, title: 'Day 3: 비엔티안CC 18홀', description: '조식 → 비엔티안CC 18홀 라운딩 → 시내 관광 → 석식' },
      { day: 4, title: 'Day 4: 라오CC 18홀', description: '조식 → 라오CC 18홀 라운딩 → 메콩강변 석식' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 탓루앙 관광 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'jeju-golf-2n3d',
    title: '제주 골프 2박 3일 36홀',
    subtitle: '해외 안 가도 OK, 제주 명문 코스',
    excerpt: '제주도 오션뷰 명문 골프장 36홀 라운딩. 리조트 숙박 + 제주 맛집 투어 포함.',
    categorySlug: 'domestic-jeju',
    destination: '제주도',
    departure: '김포/김해',
    airline: '대한항공/제주항공',
    nights: 2,
    days: 3,
    durationText: '2박 3일',
    basePrice: 790000,
    originalPrice: 890000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 16,
    totalHoles: 36,
    tagSlugs: ['short', 'value', '2-people'],
    isFeatured: false,
    inclusions: ['왕복 항공권', '리조트 숙박 2박', '그린피 2회(36홀)', '카트비', '캐디피', '전 일정 차량', '조식 2회', '석식 2회'],
    exclusions: ['개인경비', '중식', '음료비'],
    itineraries: [
      { day: 1, title: 'Day 1: 나인브릿지CC 18홀', description: '김포 출발 → 제주 도착 → 나인브릿지CC 18홀 라운딩 → 흑돼지 석식' },
      { day: 2, title: 'Day 2: 핀크스CC 18홀', description: '조식 → 핀크스CC 18홀 라운딩 → 중문관광단지 → 해산물 석식' },
      { day: 3, title: 'Day 3: 귀국', description: '조식 → 동문시장 쇼핑 → 공항 이동 → 김포 도착' },
    ],
  },
  {
    slug: 'guam-resort-golf-3n4d',
    title: '괌 리조트 골프 3박 4일 36홀',
    subtitle: '오션뷰 파라다이스에서 즐기는 골프',
    excerpt: '괌 5성급 리조트 숙박 + 태평양 오션뷰 골프장 36홀 라운딩. 가족 동반 여행에도 완벽한 패키지.',
    categorySlug: 'guam-saipan',
    destination: '괌',
    departure: '인천',
    airline: '대한항공/진에어',
    nights: 3,
    days: 4,
    durationText: '3박 4일',
    basePrice: 1790000,
    originalPrice: 2090000,
    difficulty: 'ALL',
    minPeople: 2,
    maxPeople: 16,
    totalHoles: 36,
    tagSlugs: ['premium', '5-star', '2-people'],
    isFeatured: true,
    inclusions: ['왕복 항공권', '5성급 리조트 숙박 3박', '그린피 2회(36홀)', '카트비', '전 일정 차량', '조식 3회', '석식 2회'],
    exclusions: ['여행자보험', '개인경비', '중식', '해양 액티비티 비용'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 → 괌', description: '인천 출발 → 괌 도착 → 리조트 체크인 → 투몬비치 산책 → 웰컴 디너' },
      { day: 2, title: 'Day 2: 레오팰리스 리조트CC 18홀', description: '조식 → 레오팰리스 리조트CC 18홀 라운딩 → 쇼핑 → 석식' },
      { day: 3, title: 'Day 3: 칸트리클럽 오브 더 퍼시픽 18홀', description: '조식 → 칸트리클럽 오브 더 퍼시픽 18홀 라운딩 → 자유시간(해양 액티비티)' },
      { day: 4, title: 'Day 4: 귀국', description: '조식 → 차모로빌리지 관광 → 공항 이동 → 인천 도착' },
    ],
  },
  {
    slug: 'nhatrang-golf-3n5d',
    title: '나트랑 골프 3박 5일 54홀',
    subtitle: '베트남 남부 해변 리조트 골프',
    excerpt: '나트랑 해변 리조트에서 힐링 + 54홀 골프 라운딩. 머드온천, 빈펄랜드 관광까지 포함된 올인원 패키지.',
    categorySlug: 'vietnam',
    destination: '베트남 나트랑',
    departure: '인천',
    airline: '비엣젯/베트남항공',
    nights: 3,
    days: 5,
    durationText: '3박 5일',
    basePrice: 1090000,
    originalPrice: 1290000,
    difficulty: 'ALL',
    minPeople: 4,
    maxPeople: 20,
    totalHoles: 54,
    tagSlugs: ['54-holes', 'value'],
    isFeatured: false,
    inclusions: ['왕복 항공권', '리조트 숙박 3박', '그린피 3회(54홀)', '카트비', '캐디피', '전 일정 차량', '조식 3회', '석식 3회', '머드온천 1회'],
    exclusions: ['여행자보험', '개인경비', '중식', '캐디팁', '관광지 입장료'],
    itineraries: [
      { day: 1, title: 'Day 1: 인천 심야 출발', description: '인천 심야 출발' },
      { day: 2, title: 'Day 2: 빈펄GC 18홀', description: '나트랑 새벽 도착 → 호텔 체크인 → 빈펄GC 18홀 라운딩 → 해산물 석식' },
      { day: 3, title: 'Day 3: 다이아몬드베이GC 18홀', description: '조식 → 다이아몬드베이GC 18홀 라운딩 → 머드온천 → 석식' },
      { day: 4, title: 'Day 4: KN골프링크스 18홀', description: '조식 → KN골프링크스 18홀 라운딩 → 빈펄랜드 관광 → 페어웰 디너' },
      { day: 5, title: 'Day 5: 귀국', description: '조식 → 자유시간 → 공항 이동 → 인천 도착' },
    ],
  },
];

async function main() {
  console.log('🌱 10개 상품 등록 시작...\n');

  // 카테고리·태그 조회
  const categories = await prisma.category.findMany();
  const tags = await prisma.tag.findMany();

  const catMap = new Map(categories.map(c => [c.slug, c.id]));
  const tagMap = new Map(tags.map(t => [t.slug, t.id]));

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    // 이미 존재하면 스킵
    const existing = await prisma.tourProduct.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`⏭️  [스킵] ${p.title} (이미 존재)`);
      skipped++;
      continue;
    }

    const categoryId = catMap.get(p.categorySlug);
    if (!categoryId) {
      console.log(`❌ [실패] ${p.title} - 카테고리 "${p.categorySlug}" 없음`);
      continue;
    }

    await prisma.tourProduct.create({
      data: {
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        excerpt: p.excerpt,
        categoryId,
        destination: p.destination,
        departure: p.departure,
        airline: p.airline,
        nights: p.nights,
        days: p.days,
        durationText: p.durationText,
        basePrice: p.basePrice,
        originalPrice: p.originalPrice,
        difficulty: p.difficulty,
        minPeople: p.minPeople,
        maxPeople: p.maxPeople,
        totalHoles: p.totalHoles,
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        isFeatured: p.isFeatured,
        isActive: true,
        publishedAt: new Date(),
        sortOrder: created + 1,
        tags: {
          create: p.tagSlugs
            .filter(slug => tagMap.has(slug))
            .map(slug => ({ tagId: tagMap.get(slug)! })),
        },
        itineraries: {
          create: p.itineraries.map((it, i) => ({
            day: it.day,
            title: it.title,
            description: it.description,
            activities: [],
            sortOrder: i + 1,
          })),
        },
      },
    });

    console.log(`✅ [등록] ${p.title}`);
    created++;
  }

  console.log(`\n🎉 완료! 등록: ${created}개, 스킵: ${skipped}개`);
}

main()
  .catch((e) => {
    console.error('❌ 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
