import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 블로그 글 상세 (slug 기반, 공개)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json(
        { error: "블로그 글을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("블로그 글 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "블로그 글을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
