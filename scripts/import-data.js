#!/usr/bin/env node

/**
 * Supabase에 456개 상품 데이터 임포트
 * 실행: node scripts/import-data.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || SUPABASE_URL.includes('your_supabase')) {
  console.error('❌ .env.local 파일을 먼저 설정하세요!');
  process.exit(1);
}

console.log('📦 데이터 임포트 시작\n');

// Supabase 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// 데이터 파일 경로
const dataPath = path.join(__dirname, '../../clawd/content/crawled/boryoung2/export/products.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ 데이터 파일이 없습니다:', dataPath);
  console.log('\n먼저 크롤링을 완료하세요.');
  process.exit(1);
}

async function main() {
  // 데이터 로드
  console.log('📂 데이터 파일 로드 중...');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const products = data.products;
  
  console.log(`✅ ${products.length}개 상품 로드 완료\n`);

  // 기존 데이터 확인
  console.log('🔍 기존 데이터 확인 중...');
  const { count, error: countError } = await supabase
    .from('tour_products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ 테이블 접근 오류:', countError.message);
    console.log('\n먼저 Supabase에서 테이블을 생성하세요:');
    console.log('   node scripts/setup-supabase.js\n');
    process.exit(1);
  }

  if (count > 0) {
    console.log(`⚠️  이미 ${count}개 데이터가 존재합니다.`);
    console.log('   기존 데이터를 삭제하고 다시 임포트하시겠습니까? (y/n)');
    
    // 사용자 확인 (간단히 진행)
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('', ans => {
        readline.close();
        resolve(ans);
      });
    });

    if (answer.toLowerCase() === 'y') {
      console.log('\n🗑️  기존 데이터 삭제 중...');
      const { error: deleteError } = await supabase
        .from('tour_products')
        .delete()
        .neq('id', '0'); // 모든 데이터 삭제

      if (deleteError) {
        console.error('❌ 삭제 실패:', deleteError.message);
        process.exit(1);
      }
      console.log('✅ 삭제 완료\n');
    } else {
      console.log('❌ 임포트 취소됨\n');
      process.exit(0);
    }
  }

  // 배치 삽입 (100개씩)
  console.log('📥 데이터 임포트 시작...\n');
  
  const BATCH_SIZE = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    process.stdout.write(`   배치 ${batchNum}/${totalBatches} (${batch.length}개) ...`);

    const { data: inserted, error } = await supabase
      .from('tour_products')
      .insert(batch)
      .select('id');

    if (error) {
      console.log(` ❌ 실패`);
      console.error('      오류:', error.message);
      errorCount += batch.length;
    } else {
      console.log(` ✅ 성공 (${inserted.length}개)`);
      successCount += inserted.length;
    }

    // API 제한 방지 (짧은 대기)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 임포트 완료!\n');
  console.log('📊 결과:');
  console.log(`   - 성공: ${successCount}개`);
  console.log(`   - 실패: ${errorCount}개`);
  console.log(`   - 총합: ${products.length}개\n`);

  // 검증
  console.log('✅ 데이터 검증 중...');
  const { count: finalCount } = await supabase
    .from('tour_products')
    .select('*', { count: 'exact', head: true });

  console.log(`   DB에 ${finalCount}개 저장됨\n`);

  if (finalCount === products.length) {
    console.log('🎉 모든 데이터가 정상적으로 임포트되었습니다!\n');
  } else {
    console.warn(`⚠️  예상: ${products.length}개, 실제: ${finalCount}개\n`);
  }

  // 샘플 쿼리
  console.log('🔍 샘플 데이터 확인:');
  const { data: samples } = await supabase
    .from('tour_products')
    .select('id, title, destination, price')
    .limit(3);

  samples?.forEach(s => {
    console.log(`   - ${s.title} (${s.destination}, ${s.price || '가격 미정'})`);
  });

  console.log('\n✅ 완료! 이제 웹사이트에서 DB 데이터를 사용할 수 있습니다.\n');
}

main().catch(console.error);
