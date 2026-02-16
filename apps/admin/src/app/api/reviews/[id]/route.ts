import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@repo/database";

// PUT: 리뷰 수정
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
      productId,
      authorName,
      rating,
      title,
      content,
      travelDate,
      isVerified,
      isPublished,
    } = body;

    // 리뷰 존재 여부 확인
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 별점 범위 검증 (제공된 경우)
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "별점은 1~5 사이여야 합니다" },
        { status: 400 }
      );
    }

    // 상품 ID가 변경된 경우 존재 여부 확인
    if (productId && productId !== existingReview.productId) {
      const product = await prisma.tourProduct.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "상품을 찾을 수 없습니다" },
          { status: 404 }
        );
      }
    }

    // 업데이트할 데이터 구성
    const updateData: any = {};
    if (productId !== undefined) updateData.productId = productId;
    if (authorName !== undefined) updateData.authorName = authorName;
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title || null;
    if (content !== undefined) updateData.content = content;
    if (travelDate !== undefined)
      updateData.travelDate = travelDate ? new Date(travelDate) : null;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // 리뷰 업데이트
    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("리뷰 수정 실패:", error);
    return NextResponse.json(
      { error: "리뷰 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 리뷰 삭제
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

    // 리뷰 존재 여부 확인
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 리뷰 삭제
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("리뷰 삭제 실패:", error);
    return NextResponse.json(
      { error: "리뷰 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
