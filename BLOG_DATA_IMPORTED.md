# 블로그 데이터 임포트 완료

## 📅 임포트 일시
2026-02-04 09:14

## 📊 임포트 데이터
- **소스**: 네이버 블로그 `boryoung2` (보령항공여행사)
- **포스트 수**: 15개
- **카테고리**: 일본 골프, 베트남/태국 골프, 골프/여행 정보

## 📁 저장 위치

### 1. Markdown 파일 (15개)
**경로**: `/apps/web/src/content/posts/`

각 포스트별로 개별 `.md` 파일 생성됨:
- 공지-골프-스윙자세-7단계-제대로-알아봅시다.md
- 공지-골프-여행시-꼭-챙겨야-하는-필수물품에-대해서-알려드릴게요.md
- 공지-골프-입스가-생기는-원인과-해결-방안.md
- 공지-골프채의-종류와-각-기능에-대해서-알아봅시다.md
- 공지-추운-겨울골프-라운딩-꿀팁-주의할-점.md
- 구마모토골프여행-야츠시로-2월-3월-예약-일본골프여행사.md
- 구마모토골프장추천-야츠시로-그랜드챔피온-온천호텔-사전예약.md
- 미야자키골프장추천-이동-스트레스-거의-없는-니치닌-골프패키지.md
- 방콕골프여행-유니랜드-태국골프리조트-부담없이-즐기는-27홀.md
- 오키나와골프여행-카누차베이-리조트에서-숲과-바다를-동시에-즐기는-여행.md
- 오키나와골프장추천-3색-골프투어-5성급-콜렉티브호텔.md
- 하노이골프장추천-베트남-골프로-인기-3색-박닌골프.md
- 후쿠오카골프여행-중상급-클럽리스트-토리피토하카타기온-호텔-외.md
- 후쿠오카골프장추천-아마가세-쿠주코겐-후론덴호텔.md
- 후지산골프투어-예약-아니면-못가는-후지산골프장-26년-여름예약오픈.md

**Frontmatter 포함**:
```yaml
---
title: "포스트 제목"
slug: "url-slug"
category: "japan" | "asia" | "tips" | "other"
date: "YYYY-MM-DD"
author: "보령항공여행사"
featured: false
images: ["url1", "url2", ...]
excerpt: "요약..."
naverUrl: "https://blog.naver.com/..."
---
```

### 2. TypeScript 파일 (통합)
**경로**: `/apps/web/src/content/blogPosts.ts`

모든 포스트를 하나의 TypeScript 파일로 export:
```typescript
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: 'japan' | 'asia' | 'tips' | 'other';
  date: string;
  excerpt: string;
  content: string;
  images: string[];
  naverUrl: string;
}

export const posts: BlogPost[] = [...];
```

## 📊 포스트 상세

### 일본 골프 (8개)
1. 구마모토골프여행 야츠시로 2월 3월 예약
2. 오키나와골프여행 카누차베이 리조트
3. 미야자키골프장추천 니치닌 골프패키지
4. 후쿠오카골프여행 중상급 클럽리스트
5. 오키나와골프장추천 3색 골프투어
6. 후지산골프투어 예약
7. 구마모토골프장추천 야츠시로 그랜드챔피온
8. 후쿠오카골프장추천 아마가세 쿠주코겐

### 베트남/태국 골프 (2개)
1. 방콕골프여행 유니랜드 태국골프리조트
2. 하노이골프장추천 박닌골프

### 골프/여행 정보 (5개)
1. 추운 겨울골프 라운딩 꿀팁
2. 골프채의 종류와 각 기능
3. 골프 입스가 생기는 원인과 해결 방안
4. 골프 스윙자세 7단계
5. 골프 여행시 꼭 챙겨야 하는 필수물품

## 🖼️ 이미지
- 각 포스트당 평균 5~50개 이미지
- 현재는 네이버 블로그 원본 URL 그대로 저장
- 필요시 이미지 다운로드 & 최적화 스크립트 실행 가능

## 📝 다음 단계

### 1. 데이터 활용
```typescript
// blogPosts.ts 임포트
import { posts } from '@/content/blogPosts';

// 또는 개별 Markdown 파일 읽기
// (gray-matter 등 라이브러리 활용)
```

### 2. 이미지 다운로드 (선택)
```bash
# 이미지 다운로드 스크립트 실행
node ~/clawd/scripts/download-images.js
```

### 3. UI 컴포넌트 연결
- 블로그 리스트 페이지
- 포스트 상세 페이지
- 카테고리별 필터링

## 🔗 원본 데이터
- 크롤링 원본: `~/clawd/content/crawled/boryoung2/posts-all.json`
- 크롤링 로그: `~/clawd/content/crawled/boryoung2/crawl.log`
