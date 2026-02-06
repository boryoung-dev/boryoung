import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations/product";

// GET: 상품 상세
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.tourProduct.findUnique({
    where: { id },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      itineraries: { orderBy: { sortOrder: "asc" } },
      priceOptions: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { bookings: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    product: {
      ...product,
      tagList: product.tags.map((t) => t.tag),
    },
  });
}

// PUT: 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "유효성 검사 실패", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tagIds, ...productData } = parsed.data;

    // 태그 업데이트 (있는 경우)
    if (tagIds !== undefined) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
      if (tagIds.length > 0) {
        await prisma.productTag.createMany({
          data: tagIds.map((tagId) => ({ productId: id, tagId })),
        });
      }
    }

    const product = await prisma.tourProduct.update({
      where: { id },
      data: {
        ...productData,
        publishedAt: productData.publishedAt
          ? new Date(productData.publishedAt)
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      product: { ...product, tagList: product.tags.map((t) => t.tag) },
    });
  } catch (error: any) {
    console.error("상품 수정 오류:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 존재하는 slug입니다" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "상품 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.tourProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("상품 삭제 오류:", error);
    return NextResponse.json(
      { error: "상품 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
