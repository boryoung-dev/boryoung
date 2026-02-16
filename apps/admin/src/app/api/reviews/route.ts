import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@repo/database";

// GET: 리뷰 목록 조회
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 필터 조건 구성
    const where: any = {};
    if (status === "published") {
      where.isPublished = true;
    } else if (status === "unpublished") {
      where.isPublished = false;
    }

    // 총 개수 및 리뷰 목록 조회
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              destination: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      total,
    });
  } catch (error) {
    console.error("리뷰 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "리뷰 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST: 리뷰 생성 (관리자가 직접 등록)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
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

    // 필수 필드 검증
    if (!productId || !authorName || !rating || !content) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요" },
        { status: 400 }
      );
    }

    // 별점 범위 검증
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "별점은 1~5 사이여야 합니다" },
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const product = await prisma.tourProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 리뷰 생성
    const review = await prisma.review.create({
      data: {
        productId,
        authorName,
        rating,
        title: title || null,
        content,
        travelDate: travelDate ? new Date(travelDate) : null,
        isVerified: isVerified ?? false,
        isPublished: isPublished ?? false,
      },
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
    console.error("리뷰 생성 실패:", error);
    return NextResponse.json(
      { error: "리뷰 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
