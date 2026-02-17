import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

// slug 생성 함수
function generateSlug(title: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const slug = title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-가-힣]/g, "")
    .toLowerCase();
  return `${slug}-${randomSuffix}`;
}

// GET: 블로그 글 상세 조회 (인증 필요) - content 포함
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json(
        { error: "블로그 글을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("블로그 글 조회 실패:", error);
    return NextResponse.json(
      { error: "블로그 글을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

// PUT: 블로그 글 수정 (인증 필요)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    // 기존 글 조회
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "블로그 글을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // title이 변경되면 slug도 재생성
    const newSlug = title && title !== existingPost.title
      ? generateSlug(title)
      : undefined;

    // isPublished가 false→true로 변경되면 publishedAt 설정
    let publishedAt = undefined;
    if (isPublished !== undefined) {
      if (isPublished && !existingPost.isPublished) {
        publishedAt = new Date();
      } else if (!isPublished) {
        publishedAt = null;
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(newSlug && { slug: newSlug }),
        ...(title !== undefined && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(contentHtml !== undefined && { contentHtml }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(isPublished !== undefined && { isPublished }),
        ...(publishedAt !== undefined && { publishedAt })
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("블로그 글 수정 실패:", error);
    return NextResponse.json(
      { error: "블로그 글을 수정할 수 없습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 블로그 글 삭제 (인증 필요)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.blogPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("블로그 글 삭제 실패:", error);
    return NextResponse.json(
      { error: "블로그 글을 삭제할 수 없습니다" },
      { status: 500 }
    );
  }
}
