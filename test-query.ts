#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('🔍 DB 연결 테스트...\n');

  try {
    // 1. 전체 상품 수
    const totalCount = await prisma.tourProduct.count();
    console.log(`✅ 전체 상품 수: ${totalCount}개\n`);

    // 2. 샘플 상품 가져오기
    const samples = await prisma.tourProduct.findMany({
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    console.log('✅ 샘플 상품:');
    samples.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.title}`);
      console.log(`      slug: ${s.slug}\n`);
    });

    // 3. 특정 slug로 쿼리
    const testSlug = samples[0]?.slug || '구마모토골프여행-야츠시로-2월-3월-예약-일본골프여행사';
    console.log(`🔍 특정 상품 조회 (slug: ${testSlug})...\n`);

    const product = await prisma.tourProduct.findUnique({
      where: { slug: testSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      },
    });

    if (product) {
      console.log('✅ 상품 조회 성공!');
      console.log(`   제목: ${product.title}`);
      console.log(`   카테고리: ${product.category.name}\n`);
    } else {
      console.log('❌ 상품을 찾을 수 없습니다.\n');
    }
  } catch (error: any) {
    console.error('❌ 에러 발생:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
