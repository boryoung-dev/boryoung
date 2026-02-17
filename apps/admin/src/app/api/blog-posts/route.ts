import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// 한글 → 영문 로마자 변환 매핑
const KOREAN_TO_ROMAN: Record<string, string> = {
  '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma', '바': 'ba', '사': 'sa',
  '아': 'a', '자': 'ja', '차': 'cha', '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
  '골프': 'golf', '여행': 'trip', '팁': 'tip', '준비물': 'essentials', '체크리스트': 'checklist',
  '항공': 'flight', '운송': 'shipping', '파손': 'damage', '안전': 'safe', '꿀팁': 'tips',
  '동남아': 'southeast-asia', '베스트': 'best', '시즌': 'season', '가이드': 'guide',
  '초보자': 'beginner', '해외': 'overseas', '골프장': 'golf-course', '에티켓': 'etiquette',
  '총정리': 'complete-guide', '경비': 'budget', '절약': 'saving', '방법': 'ways',
  '태국': 'thailand', '베트남': 'vietnam', '필리핀': 'philippines', '비교': 'comparison',
  '보험': 'insurance', '필요': 'essential', '여름철': 'summer', '라운딩': 'rounding',
  '컨디션': 'condition', '관리법': 'management', '예약': 'booking', '사이트': 'site',
  '앱': 'app', '추천': 'recommend', '후기': 'review', '인증샷': 'photo', '블로그': 'blog',
  '매거진': 'magazine', '코스': 'course', '공략': 'strategy', '장비': 'equipment',
  '리뷰': 'review', '기타': 'etc',
};

// slug 생성 함수: 영문 기반 URL-safe slug + 랜덤 6자리
function generateSlug(title: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  let slug = title.trim().toLowerCase();

  // 한글 단어를 영문으로 변환 (긴 단어부터 매칭)
  const sortedKeys = Object.keys(KOREAN_TO_ROMAN).sort((a, b) => b.length - a.length);
  for (const ko of sortedKeys) {
    slug = slug.replaceAll(ko, KOREAN_TO_ROMAN[ko]);
  }

  // 남은 한글 제거, 특수문자 → 하이픈, 연속 하이픈 정리
  slug = slug
    .replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug}-${randomSuffix}`;
}

// GET: 블로그 글 목록 조회 (인증 필요)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const isPublished = searchParams.get("isPublished");

    const where: any = {};

    // 검색 필터
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } }
      ];
    }

    // 발행 상태 필터
    if (isPublished === "true") {
      where.isPublished = true;
    } else if (isPublished === "false") {
      where.isPublished = false;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        thumbnail: true,
        category: true,
        tags: true,
        viewCount: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true
        // content 필드 제외 (대용량)
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("블로그 글 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "블로그 글 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// POST: 블로그 글 생성 (인증 필요)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      contentHtml,
      thumbnail,
      category,
      tags,
      isPublished
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 본문은 필수입니다" },
        { status: 400 }
      );
    }

    // slug 자동 생성
    const slug = generateSlug(title);

    // isPublished=true일 때 현재시간 자동 설정
    const publishedAt = isPublished ? new Date() : null;

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt: excerpt || null,
        content,
        contentHtml: contentHtml || null,
        thumbnail: thumbnail || null,
        category: category || null,
        tags: tags || [],
        isPublished: isPublished ?? false,
        publishedAt
      }
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("블로그 글 생성 실패:", error);
    return NextResponse.json(
      { error: "블로그 글을 생성할 수 없습니다" },
      { status: 500 }
    );
  }
}
