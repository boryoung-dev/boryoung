# 🚀 빠른 시작 - DB 설정

## 📦 준비된 것
✅ 456개 상품 데이터 (원본 보관됨)  
✅ DB 스키마 & 임포트 스크립트  
✅ DB 연동 웹사이트 코드

---

## ⚡ 10분 설정

### 1. Supabase 프로젝트 생성
https://supabase.com → New Project

### 2. API 키 복사
Settings > API → URL & Keys 복사

### 3. 환경 변수 설정
```bash
# .env.local 생성
echo 'NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key' > .env.local
```

### 4. 설치 & 실행
```bash
# Supabase 설치
pnpm add @supabase/supabase-js dotenv

# 테이블 생성 (Supabase Dashboard > SQL Editor에서)
# supabase-schema.sql 내용 복사 & 실행

# 데이터 임포트
node scripts/import-data.js

# 웹사이트 실행
pnpm dev
```

---

## 📖 상세 가이드
`DATABASE_SETUP_GUIDE.md` 참고

---

## 📁 파일 구조
```
/
├── .env.local                          ← API 키
├── supabase-schema.sql                 ← DB 스키마
├── scripts/
│   ├── setup-supabase.js               ← 테이블 생성
│   └── import-data.js                  ← 데이터 임포트
├── apps/web/src/
│   ├── lib/supabase.ts                 ← Supabase 클라이언트
│   ├── app/api/products/               ← API
│   └── app/tours/                      ← DB 연동 페이지
└── ~/clawd/content/crawled/boryoung2/
    └── export/products.json            ← 원본 데이터
```

---

## 🎯 결과
- ✅ 456개 상품 DB 저장
- ✅ 실시간 업데이트 가능
- ✅ 관리자 페이지 추가 가능
- ✅ 검색/필터 강력
