const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터 시딩 시작...\n');

  // 데이터 파일 경로
  const dataPath = path.join(process.env.HOME, 'clawd/content/crawled/boryoung2/export/products.json');

  if (!fs.existsSync(dataPath)) {
    console.error('❌ 데이터 파일을 찾을 수 없습니다:', dataPath);
    process.exit(1);
  }

  // 데이터 로드
  console.log('📂 데이터 파일 로드 중...');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const products = data.products;

  console.log(`✅ ${products.length}개 상품 로드 완료\n`);

  // 기존 데이터 삭제
  console.log('🗑️  기존 데이터 삭제 중...');
  const deleted = await prisma.tourProduct.deleteMany({});
  console.log(`✅ ${deleted.count}개 삭제 완료\n`);

  // 배치 삽입
  console.log('📥 데이터 임포트 시작...\n');

  const BATCH_SIZE = 100;
  let successCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    process.stdout.write(`   배치 ${batchNum}/${totalBatches} (${batch.length}개) ...`);

    try {
      // Prisma 형식으로 변환
      const prismaData = batch.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        destination: p.destination,
        category: p.category,
        nights: p.nights,
        days: p.days,
        duration: p.duration,
        price: p.price,
        excerpt: p.excerpt,
        content: p.content,
        contentHtml: p.content_html,
        images: p.images,
        thumbnail: p.thumbnail,
        publishedAt: p.published_at ? new Date(p.published_at) : null,
        naverUrl: p.naver_url,
        isActive: p.is_active,
        isFeatured: p.is_featured,
        sortOrder: p.sort_order
      }));

      await prisma.tourProduct.createMany({
        data: prismaData,
        skipDuplicates: true
      });

      console.log(` ✅`);
      successCount += batch.length;
    } catch (error) {
      console.log(` ❌`);
      console.error('      오류:', error.message);
    }
  }

  console.log(`\n🎉 임포트 완료!\n`);
  console.log(`📊 결과:`);
  console.log(`   - 성공: ${successCount}개`);
  console.log(`   - 실패: ${products.length - successCount}개\n`);

  // 검증
  const count = await prisma.tourProduct.count();
  console.log(`✅ DB에 ${count}개 저장됨\n`);

  // 샘플 데이터
  console.log('🔍 샘플 데이터:');
  const samples = await prisma.tourProduct.findMany({
    take: 3,
    select: {
      id: true,
      title: true,
      destination: true,
      price: true
    }
  });

  samples.forEach(s => {
    console.log(`   - ${s.title} (${s.destination}, ${s.price || '가격 미정'}원)`);
  });

  console.log('\n✅ 완료!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
