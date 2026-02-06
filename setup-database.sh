#!/bin/bash

# Supabase 설치 및 설정 스크립트
echo "🗄️  Supabase 데이터베이스 설정 시작"
echo ""

cd /Users/simjaehyeong/Desktop/side/boryoung

# 1. Supabase 클라이언트 설치
echo "1️⃣ Supabase 클라이언트 설치..."
pnpm add @supabase/supabase-js

# 2. .env.local 파일 생성
echo ""
echo "2️⃣ 환경 변수 파일 생성..."
cat > .env.local <<'EOF'
# Supabase 설정
# https://supabase.com/dashboard/project/_/settings/api 에서 확인

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
EOF

echo "✅ .env.local 생성 완료"
echo ""
echo "⚠️  주의: Supabase 프로젝트 생성 후 실제 값으로 교체하세요!"
echo ""
echo "📝 다음 단계:"
echo "1. https://supabase.com 에서 프로젝트 생성"
echo "2. Project Settings > API 에서 URL과 Key 복사"
echo "3. .env.local 파일 업데이트"
echo "4. node scripts/setup-supabase-schema.js 실행"
echo ""
