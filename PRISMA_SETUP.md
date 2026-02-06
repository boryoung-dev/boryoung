# 🚀 Prisma + Supabase 설정 완료!

## ✅ 설정 완료된 것

### 1. 환경 변수 (.env.local)
```env
DATABASE_URL="postgresql://postgres.vngymgrnsgfijcowefjv:Vmffjr3648!!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.vngymgrnsgfijcowefjv:Vmffjr3648!!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

### 2. Prisma 스키마 (apps/web/prisma/schema.prisma)
- TourProduct 모델 정의
- 인덱스 설정
- PostgreSQL 연결

### 3. Seed 파일 (apps/web/prisma/seed.js)
- 456개 데이터 자동 임포트

### 4. API & 페이지
- Prisma 클라이언트 (`lib/prisma.ts`)
- API 엔드포인트 (`api/products/`)
- 상품 목록/상세 페이지

---

## 🚀 실행 순서 (5분)

### 1️⃣ pnpm 설치 (없으면)

```bash
npm install -g pnpm
```

### 2️⃣ 패키지 설치

```bash
cd /Users/simjaehyeong/Desktop/side/boryoung
pnpm install
```

### 3️⃣ Prisma 설정

```bash
cd apps/web

# Prisma 클라이언트 생성
npx prisma generate

# DB에 테이블 생성 (마이그레이션 없이)
npx prisma db push
```

**출력 예상:**
```
✔ Generated Prisma Client
🚀  Your database is now in sync with your Prisma schema.
```

### 4️⃣ 데이터 임포트 (456개)

```bash
# apps/web 디렉토리에서
npx prisma db seed
```

**출력 예상:**
```
🌱 데이터 시딩 시작...
📂 데이터 파일 로드 중...
✅ 456개 상품 로드 완료

🗑️  기존 데이터 삭제 중...
✅ 0개 삭제 완료

📥 데이터 임포트 시작...
   배치 1/5 (100개) ... ✅
   배치 2/5 (100개) ... ✅
   배치 3/5 (100개) ... ✅
   배치 4/5 (100개) ... ✅
   배치 5/5 (56개) ... ✅

🎉 임포트 완료!

📊 결과:
   - 성공: 456개
   - 실패: 0개

✅ DB에 456개 저장됨
```

### 5️⃣ 웹사이트 실행

```bash
# 루트 디렉토리로 돌아가서
cd /Users/simjaehyeong/Desktop/side/boryoung
pnpm dev
```

**확인:**
- http://localhost:3000/tours → 456개 상품
- http://localhost:3000/api/products → API

---

## 🔍 Prisma Studio (DB 관리 도구)

```bash
cd apps/web
npx prisma studio
```

→ http://localhost:5555 에서 DB 관리!

---

## ⚡ Prisma 명령어

```bash
# 스키마 변경 후 DB 동기화
npx prisma db push

# 클라이언트 재생성
npx prisma generate

# DB 데이터 확인
npx prisma studio

# 데이터 초기화 & 재임포트
npx prisma db seed
```

---

## 🎯 Prisma 사용 예시

### API에서 사용
```typescript
import { prisma } from '@/lib/prisma';

// 전체 조회
const products = await prisma.tourProduct.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: 'asc' }
});

// 특정 조회
const product = await prisma.tourProduct.findUnique({
  where: { slug: 'some-slug' }
});

// 필터링
const japanProducts = await prisma.tourProduct.findMany({
  where: {
    destination: 'JAPAN',
    price: { lte: 1000000 }
  }
});

// 검색
const searchResults = await prisma.tourProduct.findMany({
  where: {
    title: { contains: '구마모토', mode: 'insensitive' }
  }
});
```

---

## 🎉 완료!

이제 **Prisma + Supabase**로 완벽하게 운영 가능합니다!

### 장점
- ✅ 타입 안전 (TypeScript)
- ✅ 자동완성 (IDE 지원)
- ✅ 마이그레이션 관리
- ✅ Prisma Studio (GUI)
- ✅ 쿼리 빌더 (SQL 불필요)

---

**작성**: 플럭 (AI Assistant)  
**날짜**: 2026-02-04
