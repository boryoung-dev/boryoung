import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
  console.log('📦 기존 데이터 백업 중...');

  try {
    // tour_products 백업
    const products = await prisma.tourProduct.findMany({
      include: {
        bookings: true,
      },
    });

    // blog_posts 백업
    const posts = await (prisma as any).blogPost?.findMany() || [];

    const backupData = {
      timestamp: new Date().toISOString(),
      products,
      posts,
    };

    const backupPath = path.join(__dirname, '../data-backup.json');
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

    console.log(`✅ 백업 완료: ${backupPath}`);
    console.log(`   - 상품: ${products.length}개`);
    console.log(`   - 블로그: ${posts.length}개`);
  } catch (error) {
    console.error('❌ 백업 실패:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
