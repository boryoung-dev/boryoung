#!/usr/bin/env node

/**
 * Supabase 테이블 생성 및 데이터 임포트
 * 실행: node scripts/setup-supabase.js
 */

const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

console.log('🗄️  Supabase 데이터베이스 설정\n');

// 환경 변수 확인
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다!');
  console.log('\n.env.local 파일에 다음 값을 설정하세요:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('  SUPABASE_SERVICE_KEY=your_key\n');
  process.exit(1);
}

if (SUPABASE_URL.includes('your_supabase')) {
  console.error('❌ .env.local 파일의 값을 실제 Supabase 값으로 교체하세요!');
  console.log('\n1. https://supabase.com 에서 프로젝트 생성');
  console.log('2. Settings > API에서 URL과 Key 복사');
  console.log('3. .env.local 업데이트\n');
  process.exit(1);
}

console.log('✅ 환경 변수 확인 완료\n');

// SQL 스크립트 생성
const createTableSQL = `
-- 여행 상품 테이블
CREATE TABLE IF NOT EXISTS tour_products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  category TEXT,
  nights INTEGER,
  days INTEGER,
  duration TEXT,
  price INTEGER,
  excerpt TEXT,
  content TEXT,
  content_html TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  published_at TIMESTAMPTZ,
  naver_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tour_products_destination ON tour_products(destination);
CREATE INDEX IF NOT EXISTS idx_tour_products_is_active ON tour_products(is_active);
CREATE INDEX IF NOT EXISTS idx_tour_products_is_featured ON tour_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_tour_products_price ON tour_products(price);
CREATE INDEX IF NOT EXISTS idx_tour_products_sort_order ON tour_products(sort_order);

-- RLS (Row Level Security) 설정
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;

-- Public 읽기 허용
DROP POLICY IF EXISTS "Anyone can view active products" ON tour_products;
CREATE POLICY "Anyone can view active products"
ON tour_products FOR SELECT
USING (is_active = true);

-- 관리자만 수정 가능 (나중에 auth 설정 후)
DROP POLICY IF EXISTS "Service role can do everything" ON tour_products;
CREATE POLICY "Service role can do everything"
ON tour_products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`;

// SQL 파일 저장
const sqlPath = path.join(__dirname, '../supabase-schema.sql');
fs.writeFileSync(sqlPath, createTableSQL);

console.log('✅ SQL 스크립트 생성 완료');
console.log(`   ${sqlPath}\n`);

console.log('📝 다음 단계:\n');
console.log('1. Supabase Dashboard > SQL Editor 열기');
console.log('2. 위 SQL 스크립트 복사 & 붙여넣기');
console.log('3. Run 클릭하여 테이블 생성');
console.log('4. node scripts/import-data.js 실행하여 데이터 임포트\n');

// 안내 메시지
console.log('🔗 Supabase Dashboard:');
console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}\n`);
