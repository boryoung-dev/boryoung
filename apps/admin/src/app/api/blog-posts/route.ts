import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// slug 생성 함수: 한글 유지, 공백→하이픈, 특수문자 제거 + 랜덤 6자리
function generateSlug(title: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const slug = title
    .trim()
    .replace(/\s+/g, "-") // 공백을 하이픈으로
    .replace(/[^\w\-가-힣]/g, "") // 특수문자 제거 (한글, 영문, 숫자, 하이픈만 유지)
    .toLowerCase();
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
