#!/usr/bin/env ts-node

/**
 * blogPosts.ts → Prisma DB 시드
 * 456개 블로그 데이터를 tour_products 테이블에 변환해서 삽입
 */

import { PrismaClient } from '@prisma/client';
import { posts } from '../apps/web/src/content/blogPosts';

const prisma = new PrismaClient();

// 카테고리 매핑
const CATEGORY_MAP: Record<string, { name: string; slug: string; description: string }> = {
  japan: { name: '일본골프', slug: 'japan', description: '일본 골프 여행 상품' },
  'vietnam-thailand': { name: '동남아여행', slug: 'southeast-asia', description: '베트남/태국 골프 여행' },
  korea: { name: '제주골프', slug: 'jeju', description: '제주도 및 국내 골프' },
  taiwan: { name: '대만골프', slug: 'taiwan', description: '대만 골프 여행' },
  'philippines-laos': { name: '필리핀/라오스', slug: 'philippines', description: '필리핀/라오스 골프' },
  americas: { name: '미주골프', slug: 'americas', description: '하와이/사이판 골프' },
  'china-others': { name: '중국/말레이시아', slug: 'china', description: '중국/말레이시아 골프' },
  overseas: { name: '해외골프', slug: 'overseas', description: '해외 골프 일반' },
  tips: { name: '여행정보', slug: 'tips', description: '골프/여행 팁' },
};

async function main() {
  console.log('🌱 시드 데이터 생성 시작...\n');

  // 1. 카테고리 생성
  console.log('📁 카테고리 생성 중...');
  const categories = await Promise.all(
    Object.values(CATEGORY_MAP).map(async (cat, idx) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: idx,
          isActive: true,
        },
      })
    )
  );
  console.log(`✅ ${categories.length}개 카테고리 생성 완료\n`);

  // 2. 태그 생성
  console.log('🏷️  기본 태그 생성 중...');
  const defaultTags = [
    { name: '가성비', slug: 'budget', type: 'FEATURE' },
    { name: '프리미엄', slug: 'premium', type: 'FEATURE' },
    { name: '54홀', slug: '54-holes', type: 'FEATURE' },
    { name: '단기', slug: 'short-term', type: 'DURATION' },
    { name: '장기', slug: 'long-term', type: 'DURATION' },
    { name: '리조트', slug: 'resort', type: 'ACCOMMODATION' },
  ];

  const tags = await Promise.all(
    defaultTags.map(async (tag, idx) =>
      prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: {
          name: tag.name,
          slug: tag.slug,
          type: tag.type,
          sortOrder: idx,
          isActive: true,
        },
      })
    )
  );
  console.log(`✅ ${tags.length}개 태그 생성 완료\n`);

  // 3. 투어 상품 변환 및 삽입
  console.log(`🎫 ${posts.length}개 투어 상품 생성 중...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const [idx, post] of posts.entries()) {
    try {
      // 카테고리 찾기
      const categoryData = CATEGORY_MAP[post.category] || CATEGORY_MAP['overseas'];
      const category = categories.find((c) => c.slug === categoryData.slug);

      if (!category) {
        console.error(`❌ [${idx + 1}] 카테고리 없음: ${post.category}`);
        errorCount++;
        continue;
      }

      // 가격 추출 (excerpt나 content에서)
      let basePrice: number | null = null;
      const priceMatch = post.excerpt.match(/(\d{1,3}(,\d{3})*)\s*원/);
      if (priceMatch) {
        basePrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      }

      // 일정 추출 (제목에서)
      const durationMatch = post.title.match(/(\d+)박\s*(\d+)일/);
      let nights: number | null = null;
      let days: number | null = null;
      let durationText: string | null = null;

      if (durationMatch) {
        nights = parseInt(durationMatch[1], 10);
        days = parseInt(durationMatch[2], 10);
        durationText = `${nights}박${days}일`;
      }

      // destination 매핑
      const destinationMap: Record<string, string> = {
        japan: 'JAPAN',
        taiwan: 'TAIWAN',
        'vietnam-thailand': 'SOUTHEAST_ASIA',
        korea: 'KOREA',
        'philippines-laos': 'SOUTHEAST_ASIA',
        americas: 'AMERICAS',
        'china-others': 'CHINA',
        overseas: 'OVERSEAS',
        tips: 'OTHER',
      };

      const destination = destinationMap[post.category] || 'OVERSEAS';

      // 상품 생성
      const product = await prisma.tourProduct.create({
        data: {
          slug: post.slug,
          title: post.title,
          subtitle: null,
          excerpt: post.excerpt.substring(0, 500),
          categoryId: category.id,
          destination,
          nights,
          days,
          durationText,
          basePrice,
          content: post.content,
          contentHtml: post.content,
          publishedAt: new Date(post.date),
          naverUrl: post.naverUrl,
          viewCount: 0,
          bookingCount: 0,
          isActive: true,
          isFeatured: idx < 10, // 상위 10개만 추천
          sortOrder: idx,
          images: {
            create: post.images.slice(0, 5).map((url, imgIdx) => ({
              url,
              alt: post.title,
              sortOrder: imgIdx,
              isThumbnail: imgIdx === 0,
            })),
          },
        },
      });

      successCount++;
      if ((idx + 1) % 50 === 0) {
        console.log(`   ✅ ${idx + 1}/${posts.length} 완료...`);
      }
    } catch (error: any) {
      console.error(`   ❌ [${idx + 1}] ${post.title}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n🎉 시드 완료!\n');
  console.log('📊 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log(`   📦 총합: ${posts.length}개\n`);

  // 검증
  const totalProducts = await prisma.tourProduct.count();
  console.log(`✅ DB에 ${totalProducts}개 상품이 저장되었습니다!\n`);

  // 샘플 출력
  console.log('🔍 샘플 데이터:');
  const samples = await prisma.tourProduct.findMany({
    take: 3,
    include: { category: true, images: { where: { isThumbnail: true } } },
  });

  samples.forEach((s) => {
    console.log(`   - ${s.title}`);
    console.log(`     카테고리: ${s.category.name} | 가격: ${s.basePrice ? s.basePrice.toLocaleString() + '원' : '미정'}`);
  });

  console.log('\n✅ 시드 완료! 이제 사이트를 새로고침하세요!\n');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
