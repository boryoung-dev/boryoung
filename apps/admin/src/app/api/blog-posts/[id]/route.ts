import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyAdminToken } from "@/lib/auth";

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
      slug: slugOverride,
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

    // slug는 명시적으로 전달된 경우에만 변경 (URL 안정성 유지)
    // title 변경만으로는 slug를 바꾸지 않음 — 기존 링크 보호
    const newSlug = slugOverride || undefined;

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
