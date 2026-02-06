#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const slug = '구마모토골프여행-야츠시로-2월-3월-예약-일본골프여행사';

  console.log('🔍 페이지 쿼리 테스트 (복잡한 include 포함)...\n');

  try {
    // 실제 페이지에서 사용하는 쿼리와 동일하게
    const product = await prisma.tourProduct.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        itineraries: {
          orderBy: { sortOrder: 'asc' },
        },
        priceOptions: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (product) {
      console.log('✅ 쿼리 성공!');
      console.log(`   제목: ${product.title}`);
      console.log(`   카테고리: ${product.category.name}`);
      console.log(`   이미지: ${product.images.length}개`);
      console.log(`   태그: ${product.tags.length}개`);
      console.log(`   일정: ${product.itineraries.length}개`);
      console.log(`   가격옵션: ${product.priceOptions.length}개`);
      console.log(`   리뷰: ${product.reviews.length}개\n`);
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
