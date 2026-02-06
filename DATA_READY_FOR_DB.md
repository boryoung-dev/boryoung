# 🎉 DB 임포트 준비 완료!

## 📅 작업 완료
**2026-02-04 10:35**

---

## ✅ 작업 내용

### 1️⃣ 원본 데이터 보관
**위치**: `~/clawd/content/crawled/boryoung2/`

```
export/
├── products.json (61MB)              ← 전체 456개 (DB 임포트용)
├── products_japan.json (38MB)        ← 일본 262개
├── products_southeast_asia.json (13MB) ← 동남아 95개
├── products_korea.json (3.4MB)       ← 국내 50개
├── products_china.json (2.4MB)       ← 중국 22개
├── products_taiwan.json (2.0MB)      ← 대만 15개
├── products_other.json (1.6MB)       ← 기타 10개
├── products_americas.json (172KB)    ← 미주 2개
├── schema.sql (107KB)                ← DB 스키마 + 샘플
├── stats.json                        ← 통계
└── README.md                         ← 사용 가이드
```

### 2️⃣ 웹사이트 통합
**위치**: `/Users/simjaehyeong/Desktop/side/boryoung/apps/web/src/`

- ✅ 456개 상품 데이터 (`data/products.ts`)
- ✅ 타입 정의 (`types/products.ts`)
- ✅ 상품 목록 페이지 (`app/tours/page.tsx`)
- ✅ 상품 상세 페이지 (`app/tours/[slug]/page.tsx`)
- ✅ 컴포넌트들 (`components/tours/`)

---

## 📊 데이터 통계

### 전체 개요
- **총 상품**: 456개
- **총 이미지**: 13,452개 (평균 30개/상품)
- **평균 가격**: 1,306,759원 (54개 상품)
- **평균 기간**: 3박 (18개 상품)

### 목적지별
| 목적지 | 상품 수 | 파일 크기 |
|--------|--------|----------|
| 🇯🇵 일본 | 262개 | 38MB |
| 🇻🇳🇹🇭 동남아 | 95개 | 13MB |
| 🇰🇷 국내 | 50개 | 3.4MB |
| 🇨🇳 중국 | 22개 | 2.4MB |
| 🇹🇼 대만 | 15개 | 2.0MB |
| 🌏 기타 | 10개 | 1.6MB |
| 🇺🇸 미주 | 2개 | 172KB |

---

## 🗄️ DB 스키마

### PostgreSQL/Supabase

```sql
CREATE TABLE tour_products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,      -- JAPAN, SOUTHEAST_ASIA, KOREA 등
  category TEXT,
  nights INTEGER,
  days INTEGER,
  duration TEXT,
  price INTEGER,
  excerpt TEXT,
  content TEXT,
  content_html TEXT,
  images JSONB,                    -- JSON 배열
  thumbnail TEXT,
  published_at TIMESTAMP,
  naver_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_destination ON tour_products(destination);
CREATE INDEX idx_is_active ON tour_products(is_active);
CREATE INDEX idx_is_featured ON tour_products(is_featured);
CREATE INDEX idx_price ON tour_products(price);
```

---

## 🚀 DB 임포트 방법

### 방법 1: Supabase (추천!)

#### A. Supabase Dashboard에서

1. **테이블 생성**
   ```sql
   -- Supabase SQL Editor에 붙여넣기
   [schema.sql 내용]
   ```

2. **JSON 데이터 임포트**
   ```javascript
   // JavaScript로 임포트 (Supabase CLI 또는 브라우저)
   import { createClient } from '@supabase/supabase-js';
   import products from './products.json';

   const supabase = createClient(
     'YOUR_SUPABASE_URL',
     'YOUR_SUPABASE_KEY'
   );

   // 배치 삽입 (100개씩)
   for (let i = 0; i < products.products.length; i += 100) {
     const batch = products.products.slice(i, i + 100);
     const { error } = await supabase
       .from('tour_products')
       .insert(batch);
     
     if (error) console.error(`Batch ${i/100 + 1} failed:`, error);
     else console.log(`Batch ${i/100 + 1} success!`);
   }
   ```

#### B. 스크립트로 자동 임포트
```bash
# boryoung 프로젝트에서
node scripts/import-to-supabase.js
```

---

### 방법 2: Prisma

#### prisma/schema.prisma
```prisma
model TourProduct {
  id            String   @id
  slug          String   @unique
  title         String
  destination   String
  category      String?
  nights        Int?
  days          Int?
  duration      String?
  price         Int?
  excerpt       String?  @db.Text
  content       String?  @db.Text
  contentHtml   String?  @db.Text
  images        Json
  thumbnail     String?
  publishedAt   DateTime?
  naverUrl      String?
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  sortOrder     Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([destination])
  @@index([isActive])
  @@map("tour_products")
}
```

#### 데이터 시드
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import products from '../data/products.json';

const prisma = new PrismaClient();

async function main() {
  for (const product of products.products) {
    await prisma.tourProduct.create({
      data: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        destination: product.destination,
        category: product.category,
        nights: product.nights,
        days: product.days,
        duration: product.duration,
        price: product.price,
        excerpt: product.excerpt,
        content: product.content,
        contentHtml: product.content_html,
        images: product.images,
        thumbnail: product.thumbnail,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        naverUrl: product.naver_url,
        isActive: product.is_active,
        isFeatured: product.is_featured,
        sortOrder: product.sort_order
      }
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

```bash
npx prisma db seed
```

---

## 💡 데이터 활용 예시

### API 엔드포인트 (Next.js)

```typescript
// app/api/products/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  let query = supabase
    .from('tour_products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (destination) {
    query = query.eq('destination', destination);
  }
  
  const { data, error } = await query;
  
  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ products: data });
}
```

### 사용 예시
```typescript
// 일본 상품만 조회
const res = await fetch('/api/products?destination=JAPAN');
const { products } = await res.json();

// 상품 상세
const res = await fetch(`/api/products/${slug}`);
const { product } = await res.json();
```

---

## 🎯 활용도 높이기

### 1. 검색 기능
```sql
-- 전문 검색 (PostgreSQL)
CREATE INDEX idx_title_search ON tour_products 
USING gin(to_tsvector('korean', title));

-- 검색 쿼리
SELECT * FROM tour_products
WHERE to_tsvector('korean', title || ' ' || content) 
@@ plainto_tsquery('korean', '구마모토');
```

### 2. 추천 알고리즘
```sql
-- 인기 상품 (가격이 있고 이미지 많은 것)
SELECT * FROM tour_products
WHERE price IS NOT NULL
ORDER BY jsonb_array_length(images) DESC, price ASC
LIMIT 10;
```

### 3. 관련 상품
```sql
-- 같은 목적지의 다른 상품
SELECT * FROM tour_products
WHERE destination = :destination
AND id != :current_id
ORDER BY RANDOM()
LIMIT 4;
```

---

## 📦 백업 & 복원

### 백업
```bash
# JSON 백업 (이미 완료)
cp ~/clawd/content/crawled/boryoung2/export/products.json ~/backup/

# DB 백업 (Supabase)
supabase db dump > backup.sql
```

### 복원
```bash
# JSON에서 복원
node scripts/import-to-supabase.js

# SQL에서 복원
psql < backup.sql
```

---

## 🔐 보안 고려사항

### 환경 변수
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_service_key
DATABASE_URL=your_database_url
```

### RLS (Row Level Security)
```sql
-- Supabase에서 public 읽기 허용
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON tour_products FOR SELECT
USING (is_active = true);
```

---

## 📋 체크리스트

### DB 임포트 전
- [ ] DB 서비스 준비 (Supabase/Prisma)
- [ ] 환경 변수 설정
- [ ] 스키마 확인

### DB 임포트 중
- [ ] 테이블 생성 (schema.sql)
- [ ] 인덱스 생성
- [ ] 데이터 임포트 (products.json)
- [ ] 에러 확인

### DB 임포트 후
- [ ] 데이터 개수 확인 (456개)
- [ ] 샘플 쿼리 테스트
- [ ] API 엔드포인트 테스트
- [ ] 웹사이트 연동 테스트

---

## 🎉 결과

### 현재 상태
- ✅ **원본 데이터 보관** (JSON, SQL)
- ✅ **웹사이트 통합** (파일 기반)
- ⏳ **DB 임포트** (준비 완료, 실행 대기)

### 다음 단계
1. DB 서비스 선택 (Supabase 추천)
2. 스키마 생성
3. 데이터 임포트
4. API 연동
5. 웹사이트 DB 연결

---

**모든 데이터가 준비되었습니다!** 🎉

DB 임포트 도와줄까요? 어떤 DB 쓸지 알려주세요!
- Supabase (추천)
- Prisma
- MongoDB
- Firebase
- 기타
