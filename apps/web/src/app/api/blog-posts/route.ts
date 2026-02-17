import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 공개 블로그 글 목록 (발행된 글만)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { isPublished: true };
    if (category) {
      where.category = category;
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
        viewCount: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
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
