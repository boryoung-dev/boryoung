# 🗄️ Supabase DB 설정 완벽 가이드

## 📅 작성일
2026-02-04

---

## ✅ 준비된 것

### 1. 원본 데이터 (456개)
- 위치: `~/clawd/content/crawled/boryoung2/export/products.json`
- 크기: 61MB
- 포맷: 깔끔한 JSON (DB 임포트 준비 완료)

### 2. DB 설정 스크립트
- `setup-database.sh` - Supabase 클라이언트 설치
- `scripts/setup-supabase.js` - 테이블 스키마 생성
- `scripts/import-data.js` - 데이터 임포트
- `supabase-schema.sql` - SQL 스키마 파일

### 3. 웹사이트 코드 (DB 버전)
- `lib/supabase.ts` - Supabase 클라이언트
- `app/api/products/route.ts` - API 엔드포인트
- `app/tours/page-db.tsx` - 상품 목록 (DB)
- `app/tours/[slug]/page-db.tsx` - 상품 상세 (DB)

---

## 🚀 설정 단계 (10분 완료)

### 1️⃣ Supabase 프로젝트 생성 (3분)

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `boryoung-tours`
   - Database Password: 강력한 비밀번호
   - Region: `Northeast Asia (Seoul)` 선택
4. "Create new project" 클릭
5. 프로젝트 생성 완료 (1-2분 대기)

---

### 2️⃣ API 키 복사 (1분)

1. 좌측 메뉴 > ⚙️  **Settings** > **API** 클릭
2. 다음 3가지 값 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (🔒 Show 클릭해서 표시)

---

### 3️⃣ 환경 변수 설정 (1분)

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung

# .env.local 파일 수정
nano .env.local
```

다음 내용 붙여넣기:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**저장**: Ctrl+O → Enter → Ctrl+X

---

### 4️⃣ Supabase 클라이언트 설치 (1분)

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung

# Supabase 라이브러리 설치
pnpm add @supabase/supabase-js dotenv

# 또는
npm install @supabase/supabase-js dotenv
```

---

### 5️⃣ 테이블 생성 (2분)

#### 방법 A: Supabase Dashboard (추천)

1. Supabase Dashboard > 좌측 **SQL Editor** 클릭
2. "New query" 클릭
3. 다음 SQL 복사 & 붙여넣기:

```sql
-- 여행 상품 테이블
CREATE TABLE tour_products (
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
CREATE INDEX idx_tour_products_destination ON tour_products(destination);
CREATE INDEX idx_tour_products_is_active ON tour_products(is_active);
CREATE INDEX idx_tour_products_is_featured ON tour_products(is_featured);
CREATE INDEX idx_tour_products_price ON tour_products(price);
CREATE INDEX idx_tour_products_sort_order ON tour_products(sort_order);

-- RLS (Row Level Security)
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON tour_products FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role can do everything"
ON tour_products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

4. **Run** 버튼 클릭
5. "Success. No rows returned" 확인

#### 방법 B: 스크립트 실행

```bash
node scripts/setup-supabase.js
# SQL 파일 생성 후 Dashboard에서 실행
```

---

### 6️⃣ 데이터 임포트 (3분)

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung

# 456개 상품 데이터 임포트
node scripts/import-data.js
```

**진행 상황**:
```
📦 데이터 임포트 시작

📂 데이터 파일 로드 중...
✅ 456개 상품 로드 완료

🔍 기존 데이터 확인 중...
📥 데이터 임포트 시작...

   배치 1/5 (100개) ... ✅ 성공 (100개)
   배치 2/5 (100개) ... ✅ 성공 (100개)
   배치 3/5 (100개) ... ✅ 성공 (100개)
   배치 4/5 (100개) ... ✅ 성공 (100개)
   배치 5/5 (56개) ... ✅ 성공 (56개)

🎉 임포트 완료!

📊 결과:
   - 성공: 456개
   - 실패: 0개
```

---

### 7️⃣ 데이터 확인 (1분)

1. Supabase Dashboard > **Table Editor** 클릭
2. `tour_products` 테이블 선택
3. 456개 데이터 확인 ✅

---

### 8️⃣ 웹사이트 DB 연결 (1분)

#### 파일 교체

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung/apps/web/src

# 기존 파일 백업
mv app/tours/page.tsx app/tours/page-file.tsx.bak
mv app/tours/[slug]/page.tsx app/tours/[slug]/page-file.tsx.bak

# DB 버전으로 교체
mv app/tours/page-db.tsx app/tours/page.tsx
mv app/tours/[slug]/page-db.tsx app/tours/[slug]/page.tsx
```

---

### 9️⃣ 테스트 (1분)

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung

# 개발 서버 실행
pnpm dev
```

**확인**:
- http://localhost:3000/tours → 456개 상품 목록
- http://localhost:3000/tours/구마모토골프여행-... → 상세 페이지
- http://localhost:3000/api/products → API 응답

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] API 키 복사
- [ ] `.env.local` 파일 설정
- [ ] Supabase 클라이언트 설치
- [ ] 테이블 생성 (SQL 실행)
- [ ] 데이터 임포트 (456개)
- [ ] 데이터 확인 (Table Editor)
- [ ] 웹사이트 파일 교체
- [ ] 로컬 테스트 (localhost:3000)

---

## 🎯 DB 사용의 장점

### ✅ 실시간 업데이트
- 관리자 페이지에서 상품 수정 가능
- 가격/재고 실시간 변경
- 신규 상품 즉시 추가

### ✅ 강력한 쿼리
```typescript
// 일본 상품만
const { data } = await supabase
  .from('tour_products')
  .select('*')
  .eq('destination', 'JAPAN');

// 100만원 이하
const { data } = await supabase
  .from('tour_products')
  .select('*')
  .lte('price', 1000000);

// 추천 상품
const { data } = await supabase
  .from('tour_products')
  .select('*')
  .eq('is_featured', true);
```

### ✅ 검색 기능
```sql
-- 전문 검색 인덱스 추가
CREATE INDEX idx_title_search ON tour_products 
USING gin(to_tsvector('korean', title));

-- 검색
SELECT * FROM tour_products
WHERE to_tsvector('korean', title) 
@@ plainto_tsquery('korean', '구마모토');
```

### ✅ 관리 편의성
- Supabase Dashboard에서 직접 수정
- SQL 쿼리로 대량 업데이트
- 백업/복원 자동화

---

## 🔧 관리 기능 추가 (선택)

### 관리자 페이지
```typescript
// app/admin/products/page.tsx
// Supabase Auth로 로그인 후 CRUD
```

### 상품 수정 API
```typescript
// app/api/admin/products/[id]/route.ts
export async function PUT(request: Request, { params }) {
  // 상품 업데이트
}
```

---

## 🎉 완료!

이제 **DB 기반 여행사 웹사이트**가 완성되었습니다!

### 다음 단계
1. 관리자 페이지 추가
2. 검색 기능 구현
3. 예약/문의 폼 연동
4. 배포 (Vercel + Supabase)

---

**문서 작성**: 플럭 (AI Assistant)  
**프로젝트**: boryoung  
**날짜**: 2026-02-04
